const pool = require('../config/db');

/**
 * createFlashcards — creates one flashcard per detected error.
 * @param {string} userId
 * @param {string} analysisId
 * @param {object} analysisResult  — normalised result from orchestrator
 * @param {string|null} unitId
 */
async function createFlashcards(userId, analysisId, analysisResult, unitId = null) {
  const errors = analysisResult.errors || [];

  // If new multi-error format has errors, create one card per error
  if (errors.length > 0) {
    const ids = [];
    for (const err of errors) {
      const front = err.errorText;
      const correction = err.correction || '';
      const rule = err.rule || '';
      const explanation = err.explanation || '';

      const back = [
        correction,
        rule ? `\n📖 Règle : ${rule}` : '',
        explanation && explanation !== rule ? `\n💡 ${explanation}` : '',
        err.suggestions?.length > 0 ? `\n✓ Variantes : ${err.suggestions.join(' / ')}` : '',
      ].filter(Boolean).join('');

      try {
        const result = await pool.query(
          `INSERT INTO flashcards (user_id, analysis_id, unit_id, front, back)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [userId, analysisId, unitId || null, front, back]
        );
        ids.push(result.rows[0].id);
      } catch (insertErr) {
        // Bug fix: renamed from `err` to `insertErr` to avoid shadowing the
        // outer loop variable `err` (the current error object being processed).
        console.error('[FlashcardService] Échec création flashcard :', insertErr.message);
      }
    }
    return ids;
  }

  // Legacy single-error fallback
  if (!analysisResult.hasError || !analysisResult.errorPhrase) return [];

  const front = analysisResult.errorPhrase;
  const back = `${analysisResult.correction}\n\n📖 Règle : ${analysisResult.rule}`;

  try {
    const result = await pool.query(
      `INSERT INTO flashcards (user_id, analysis_id, unit_id, front, back)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, analysisId, unitId || null, front, back]
    );
    return [result.rows[0].id];
  } catch (err) {
    console.error('[FlashcardService] Échec création flashcard :', err.message);
    return [];
  }
}

// Legacy compat export
async function createFlashcard(userId, analysisId, analysisResult, unitId = null) {
  const ids = await createFlashcards(userId, analysisId, analysisResult, unitId);
  return ids[0] || null;
}

module.exports = { createFlashcard, createFlashcards };
