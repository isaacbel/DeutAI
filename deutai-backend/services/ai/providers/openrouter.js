/**
 * openrouter.js — OpenRouter provider for DeutAI
 */

const OpenAI = require('openai');
const { ANALYZE_SYSTEM_PROMPT, VISION_EXTRACT_PROMPT, ANALYZE_USER_MSG } = require('../prompts');

function getClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    const err = new Error('OPENROUTER_API_KEY is not configured');
    err.status = 503;
    throw err;
  }
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });
}

// ─── Text Analysis ─────────────────────────────────────────────────────────────

async function analyzeText(text) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'google/gemini-2.5-flash',
    messages: [
      { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
      { role: 'user', content: ANALYZE_USER_MSG(text) },
    ],
    temperature: 0,
  });

  return {
    raw: response.choices[0]?.message?.content || '',
    provider: 'openrouter',
    usage: response.usage ?? null,
  };
}

// ─── Vision / Image Extraction ─────────────────────────────────────────────────

async function extractTextFromImage(base64Image) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'google/gemini-2.5-flash',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: VISION_EXTRACT_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    temperature: 0,
  });

  return {
    raw: response.choices[0]?.message?.content || '',
    provider: 'openrouter',
    usage: response.usage ?? null,
  };
}

module.exports = { analyzeText, extractTextFromImage };
