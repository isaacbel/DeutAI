/**
 * openai.js — OpenAI provider for DeutAI
 * Uses the new Responses API (openai.responses.create) introduced in SDK v4+.
 */

const OpenAI = require('openai');
const { ANALYZE_SYSTEM_PROMPT, VISION_EXTRACT_PROMPT, ANALYZE_USER_MSG } = require('../prompts');

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('OPENAI_API_KEY is not configured');
    err.status = 503;
    throw err;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Text Analysis ─────────────────────────────────────────────────────────────

async function analyzeText(text) {
  const client = getClient();

  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    instructions: ANALYZE_SYSTEM_PROMPT,
    input: ANALYZE_USER_MSG(text),
    store: false,
  });

  return {
    raw: response.output_text || '',
    provider: 'openai',
    usage: response.usage ?? null,
  };
}

// ─── Vision / Image Extraction ─────────────────────────────────────────────────

async function extractTextFromImage(base64Image) {
  const client = getClient();

  // The Responses API supports multi-modal input via the `input` array.
  const response = await client.responses.create({
    model: 'gpt-4o',
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_image',
            image_url: `data:image/jpeg;base64,${base64Image}`,
          },
          {
            type: 'input_text',
            text: VISION_EXTRACT_PROMPT,
          },
        ],
      },
    ],
    store: false,
  });

  return {
    raw: response.output_text || '',
    provider: 'openai',
    usage: response.usage ?? null,
  };
}

module.exports = { analyzeText, extractTextFromImage };
