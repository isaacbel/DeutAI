/**
 * anthropic.js — Anthropic (Claude) provider for DeutAI
 */

const anthropic = require('../../../config/claude');
const { ANALYZE_SYSTEM_PROMPT, VISION_EXTRACT_PROMPT, ANALYZE_USER_MSG } = require('../prompts');

// ─── Text Analysis ─────────────────────────────────────────────────────────────

async function analyzeText(text) {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: ANALYZE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: ANALYZE_USER_MSG(text) }],
  });

  return {
    raw: response.content[0]?.text || '',
    provider: 'anthropic',
    usage: response.usage,
  };
}

// ─── Vision / Image Extraction ─────────────────────────────────────────────────

async function extractTextFromImage(base64Image) {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
        { type: 'text', text: VISION_EXTRACT_PROMPT },
      ],
    }],
  });

  return {
    raw: response.content[0]?.text || '',
    provider: 'anthropic',
    usage: response.usage,
  };
}

module.exports = { analyzeText, extractTextFromImage };
