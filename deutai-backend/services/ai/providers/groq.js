/**
 * groq.js — Groq provider for DeutAI
 */

const Groq = require('groq-sdk');
const { ANALYZE_SYSTEM_PROMPT, VISION_EXTRACT_PROMPT, ANALYZE_USER_MSG } = require('../prompts');

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error('GROQ_API_KEY is not configured');
    err.status = 503;
    throw err;
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// ─── Text Analysis ─────────────────────────────────────────────────────────────

async function analyzeText(text) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
      { role: 'user', content: ANALYZE_USER_MSG(text) },
    ],
    temperature: 0,
  });

  return {
    raw: response.choices[0]?.message?.content || '',
    provider: 'groq',
    usage: response.usage ?? null,
  };
}

// ─── Vision / Image Extraction ─────────────────────────────────────────────────

async function extractTextFromImage(base64Image) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'llama-3.2-11b-vision-preview',
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
    provider: 'groq',
    usage: response.usage ?? null,
  };
}

module.exports = { analyzeText, extractTextFromImage };
