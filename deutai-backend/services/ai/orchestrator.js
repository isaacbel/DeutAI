/**
 * Single entry point for all AI calls in DeutAI.
 * Provider chain (production) : Groq → OpenRouter → Gemini → OpenAI → Anthropic
 * Provider chain (development): Groq → OpenRouter → Gemini → OpenAI → Anthropic → Mock
 */

const anthropic = require('./providers/anthropic');
const openai   = require('./providers/openai');
const gemini   = require('./providers/gemini');
const groq     = require('./providers/groq');
const openrouter = require('./providers/openrouter');
const mock     = require('./providers/mock');
const { normalizeAnalysis, normalizeExtraction } = require('./utils/normalize');
const pool = require('../../config/db');

const IS_DEV = process.env.NODE_ENV !== 'production';

// In development the mock provider is appended as a last-resort so the app
// keeps working even when all real AI credits are exhausted.
const REAL_PROVIDERS   = [groq, openrouter, gemini, openai, anthropic];
const ANALYSIS_PROVIDERS = IS_DEV ? [...REAL_PROVIDERS, mock] : REAL_PROVIDERS;
const VISION_PROVIDERS   = IS_DEV ? [...REAL_PROVIDERS, mock] : REAL_PROVIDERS;

const PROVIDER_NAMES = new Map([
  [anthropic, 'anthropic'],
  [openai,   'openai'],
  [gemini,   'gemini'],
  [groq,     'groq'],
  [openrouter, 'openrouter'],
  [mock,     'mock'],
]);

function nameOf(provider) {
  return PROVIDER_NAMES.get(provider) ?? 'unknown';
}

function shouldFallback(err) {
  if (err.code === 'AI_PARSE_ERROR') return false;

  const status = err.status ?? err.statusCode ?? err.httpStatusCode ?? 0;
  if (status === 429 || status === 402) return true;
  if (status === 404) return true;   // model not found / endpoint unavailable
  if (status >= 500) return true;

  const message = err.message?.toLowerCase() ?? '';
  if (message.includes('credit balance')) return true;
  if (message.includes('rate limit')) return true;
  if (message.includes('quota')) return true;
  if (message.includes('resource_exhausted')) return true;
  if (message.includes('not found')) return true;   // Gemini wraps 404 in message

  return false;
}

async function logAttempt({ provider, task, prompt, success, errorMsg }) {
  try {
    await pool.query(
      `INSERT INTO ai_logs (provider, task, prompt, success, error_message)
       VALUES ($1, $2, $3, $4, $5)`,
      [provider, task, prompt?.slice(0, 500), success, errorMsg ?? null]
    );
  } catch (dbErr) {
    console.error('[Orchestrator] Failed to write ai_log:', dbErr.message);
  }
}

async function runWithFallback(providers, task, fn, prompt) {
  let lastError;

  for (const provider of providers) {
    const providerName = nameOf(provider);

    try {
      const result = await fn(provider);
      await logAttempt({ provider: providerName, task, prompt, success: true });
      console.log(`[Orchestrator] "${task}" succeeded via ${providerName}`);
      return result;
    } catch (err) {
      console.error(`[Orchestrator] ${providerName} failed for "${task}":`, err.message);
      await logAttempt({
        provider: providerName,
        task,
        prompt,
        success: false,
        errorMsg: err.message,
      });

      if (!shouldFallback(err)) throw err;
      lastError = err;
    }
  }

  const finalErr = new Error('Tous les services AI sont indisponibles. Veuillez réessayer plus tard.');
  finalErr.code = 'AI_ALL_PROVIDERS_FAILED';
  finalErr.cause = lastError;
  throw finalErr;
}

async function analyzeText(text) {
  return runWithFallback(
    ANALYSIS_PROVIDERS,
    'analyzeText',
    async (provider) => {
      const { raw } = await provider.analyzeText(text);
      if (!raw) {
        const err = new Error('Réponse AI vide');
        err.code = 'AI_PARSE_ERROR';
        throw err;
      }
      return normalizeAnalysis(raw);
    },
    text
  );
}

async function extractTextFromImage(base64Image) {
  return runWithFallback(
    VISION_PROVIDERS,
    'extractTextFromImage',
    async (provider) => {
      const { raw } = await provider.extractTextFromImage(base64Image);
      if (!raw) {
        const err = new Error('Réponse AI Vision vide');
        err.code = 'AI_PARSE_ERROR';
        throw err;
      }
      return normalizeExtraction(raw);
    },
    '[base64 image]'
  );
}

module.exports = { analyzeText, extractTextFromImage };
