/**
 * normalize.js
 * Cleans and parses raw AI text into consistent structured objects.
 */

function cleanJSON(rawText) {
  let cleaned = String(rawText || '').trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
  return cleaned;
}

function parseJSON(rawText) {
  const cleaned = cleanJSON(rawText);
  try {
    return JSON.parse(cleaned);
  } catch {
    const err = new Error('Impossible de parser la réponse AI en JSON');
    err.code = 'AI_PARSE_ERROR';
    throw err;
  }
}

const VALID_ERROR_TYPES = [
  // Grammar & Morphology
  'conjugaison', 'temps', 'auxiliaire', 'déclinaison', 'genre', 'nombre', 'accord',
  // Syntax
  'ordre', 'position_verbe', 'subordonnée',
  // Prepositions
  'préposition', 'cas_prépositionnel',
  // Vocabulary
  'choix_mot', 'faux_ami', 'collocation', 'registre',
  // Writing
  'orthographe', 'majuscule', 'ponctuation',
  // German-specific
  'verbe_séparable', 'infinitif_zu', 'modalverbe',
  // Other / legacy
  'autre', 'aucun',
];

function normalizeErrorType(type) {
  if (!type) return 'autre';
  const lower = type.toLowerCase().trim();
  return VALID_ERROR_TYPES.includes(lower) ? lower : 'autre';
}

function normalizeAnalysis(raw) {
  const parsed = parseJSON(raw);

  // ── New multi-error format ──
  if ('hasErrors' in parsed) {
    const errors = Array.isArray(parsed.errors)
      ? parsed.errors.map((e) => ({
          errorText:    e.errorText || '',
          startIndex:   typeof e.startIndex === 'number' ? e.startIndex : null,
          endIndex:     typeof e.endIndex === 'number' ? e.endIndex : null,
          correction:   e.correction || '',
          errorType:    normalizeErrorType(e.errorType),
          severity:     e.severity || 'medium',
          rule:         e.rule || '',
          explanation:  e.explanation || '',
          suggestions:  Array.isArray(e.suggestions) ? e.suggestions : [],
        }))
      : [];

    return {
      // Legacy compat fields (for DB columns that expect a single value)
      hasError:         Boolean(parsed.hasErrors),
      errorPhrase:      errors[0]?.errorText || '',
      correction:       errors[0]?.correction || '',
      rule:             errors[0]?.rule || '',
      errorType:        errors[0] ? normalizeErrorType(errors[0].errorType) : 'aucun',
      exercises:        Array.isArray(parsed.exercises) ? parsed.exercises : [],

      // New multi-error fields
      hasErrors:        Boolean(parsed.hasErrors),
      originalSentence: parsed.originalSentence || '',
      correctedSentence:parsed.correctedSentence || '',
      errors,
      globalExplanation:parsed.globalExplanation || '',
    };
  }

  // ── Legacy single-error format (fallback) ──
  return {
    hasError:         Boolean(parsed.hasError),
    errorPhrase:      parsed.errorPhrase || '',
    correction:       parsed.correction || '',
    rule:             parsed.rule || '',
    errorType:        normalizeErrorType(parsed.errorType),
    exercises:        Array.isArray(parsed.exercises) ? parsed.exercises : [],

    hasErrors:        Boolean(parsed.hasError),
    originalSentence: '',
    correctedSentence:parsed.correction || '',
    errors: parsed.hasError && parsed.errorPhrase
      ? [{
          errorText:   parsed.errorPhrase,
          startIndex:  null,
          endIndex:    null,
          correction:  parsed.correction || '',
          errorType:   normalizeErrorType(parsed.errorType),
          severity:    'medium',
          rule:        parsed.rule || '',
          explanation: parsed.rule || '',
          suggestions: [],
        }]
      : [],
    globalExplanation: '',
  };
}

function normalizeExtraction(raw) {
  const parsed = parseJSON(raw);
  return {
    extractedText: parsed.extractedText || '',
    confidence: parsed.confidence || 'low',
  };
}

module.exports = { normalizeAnalysis, normalizeExtraction };
