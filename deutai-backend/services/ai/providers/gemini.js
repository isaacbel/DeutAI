/**
 * gemini.js — Google Gemini provider for DeutAI
 */

const { GoogleGenAI } = require('@google/genai');
const { ANALYZE_SYSTEM_PROMPT, VISION_EXTRACT_PROMPT, ANALYZE_USER_MSG } = require('../prompts');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Text Analysis ─────────────────────────────────────────────────────────────

async function analyzeText(text) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: ANALYZE_USER_MSG(text),
    config: {
      systemInstruction: ANALYZE_SYSTEM_PROMPT,
      maxOutputTokens: 1024,
    }
  });

  return {
    raw: response.text || '',
    provider: 'gemini',
    usage: response.usageMetadata ?? null,
  };
}

// ─── Vision / Image Extraction ─────────────────────────────────────────────────

async function extractTextFromImage(base64Image) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
      VISION_EXTRACT_PROMPT,
    ],
    config: { maxOutputTokens: 512 },
  });

  return {
    raw: response.text || '',
    provider: 'gemini',
    usage: response.usageMetadata ?? null,
  };
}

module.exports = { analyzeText, extractTextFromImage };
