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

    return res.status(200).json(result.rows);
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
    const check = await pool.query(
      'SELECT user_id FROM flashcards WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (check.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    await pool.query('DELETE FROM flashcards WHERE id = $1', [id]);

    return res.status(200).json({ message: 'Flashcard supprimée' });
  } catch (err) {
    console.error('[FlashcardsController] deleteFlashcard :', err.message);
    next(err);
  }
}

module.exports = { getFlashcards, deleteFlashcard };
