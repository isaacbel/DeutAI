/**
 * mock.js — Development-only AI provider for DeutAI.
 *
 * Returns a well-formed stub response so the full request/response cycle
 * (validation → DB insert → flashcard) can be exercised without live credits.
 *
 * NEVER active in production — throws immediately if NODE_ENV !== 'development'.
 */

function assertDev() {
  if (process.env.NODE_ENV !== 'development') {
    const err = new Error('Mock provider is not allowed in production');
    err.status = 503;
    throw err;
  }
}

async function analyzeText(text) {
  assertDev();
  console.warn('[Mock] analyzeText — returning stub response for:', text);

  return {
    raw: JSON.stringify({
      hasErrors: true,
      originalSentence: text,
      correctedSentence: 'Ich bin in die Schule gegangen.',
      errors: [
        {
          errorText: 'gehe',
          startIndex: 4,
          endIndex: 9,
          correction: 'bin gegangen',
          errorType: 'auxiliaire',
          severity: 'high',
          rule: 'Les verbes de mouvement utilisent «sein» comme auxiliaire au passé composé.',
          explanation: 'DE: Das Verb "gehen" beschreibt eine Bewegung und nutzt im Perfekt "sein" statt "haben". || AR: الفعل "gehen" يعبّر عن حركة، لذلك في صيغة Perfekt يستخدم "sein" وليس "haben".',
          suggestions: ['bin gegangen', 'ging (Präteritum)'],
        },
      ],
      globalExplanation: 'DE: Der Satz enthält einen Fehler bei der Wahl des Hilfsverbs im Perfekt. || AR: الجملة تحتوي على خطأ في اختيار الفعل المساعد في صيغة Perfekt.',
      exercises: [
        { question: 'Quel auxiliaire utilise-t-on avec «gehen» au Perfekt ?', answer: 'sein — Ich bin gegangen.' },
        { question: 'Conjuguez «fahren» au Perfekt à la 3ème personne du singulier.', answer: 'Er ist gefahren.' },
      ],
    }),
    provider: 'mock',
    usage: null,
  };
}

async function extractTextFromImage(_base64Image) {
  assertDev();
  console.warn('[Mock] extractTextFromImage — returning stub response');

  return {
    raw: JSON.stringify({
      extractedText: 'Ich gehe in die Schule.',
      confidence: 'low',
    }),
    provider: 'mock',
    usage: null,
  };
}

module.exports = { analyzeText, extractTextFromImage };
