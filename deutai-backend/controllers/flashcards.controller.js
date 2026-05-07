const pool = require('../config/db');

async function getFlashcards(req, res, next) {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT
         f.id,
         f.front,
         f.back,
         f.created_at,
         f.unit_id,
         u.title AS unit_title,
         a.error_type,
         a.input_text
       FROM flashcards f
       LEFT JOIN units u ON u.id = f.unit_id
       LEFT JOIN analyses a ON a.id = f.analysis_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    // Bug fix: wrap in an object so the frontend api call
    // (await res.json()).flashcards works correctly.
    return res.status(200).json({ flashcards: result.rows });
  } catch (err) {
    console.error('[FlashcardsController] getFlashcards :', err.message);
    next(err);
  }
}

async function deleteFlashcard(req, res, next) {
  const userId = req.user.userId;
  const { id } = req.params;

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: ['ID de flashcard invalide'],
    });
  }

  try {
    // Bug fix: single DELETE WHERE id AND user_id avoids a TOCTOU race
    // condition between the ownership check and the delete.
    const result = await pool.query(
      'DELETE FROM flashcards WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
      // Either not found or belongs to a different user — return 404 to
      // avoid leaking existence information.
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    return res.status(200).json({ message: 'Flashcard supprimée' });
  } catch (err) {
    console.error('[FlashcardsController] deleteFlashcard :', err.message);
    next(err);
  }
}

module.exports = { getFlashcards, deleteFlashcard };
