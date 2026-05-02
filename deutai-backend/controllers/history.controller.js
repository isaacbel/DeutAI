const pool = require('../config/db');

// ── GET /history — list paginated analysis history ─────────────────────────
async function getHistory(req, res, next) {
  const userId = req.user.userId;
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(50, parseInt(req.query.limit || '20', 10));
  const offset = (page - 1) * limit;

  try {
    const [rows, countRow] = await Promise.all([
      pool.query(
        `SELECT
           id,
           source,
           input_text,
           has_error,
           error_phrase,
           correction,
           rule,
           error_type,
           exercises_json,
           errors_json,
           global_explanation,
           created_at
         FROM analyses
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      ),
      pool.query(
        'SELECT COUNT(*) FROM analyses WHERE user_id = $1',
        [userId]
      ),
    ]);

    const total = parseInt(countRow.rows[0].count, 10);

    return res.status(200).json({
      history: rows.rows,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[HistoryController] getHistory:', err.message);
    next(err);
  }
}

// ── GET /history/:id — single analysis with all errors ─────────────────────
async function getHistoryItem(req, res, next) {
  const userId = req.user.userId;
  const { id } = req.params;

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return res.status(400).json({ error: 'INVALID_ID' });
  }

  try {
    const result = await pool.query(
      `SELECT
         a.*,
         u.title AS unit_title
       FROM analyses a
       LEFT JOIN units u ON u.id = a.unit_id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('[HistoryController] getHistoryItem:', err.message);
    next(err);
  }
}

// ── DELETE /history/:id ────────────────────────────────────────────────────
async function deleteHistoryItem(req, res, next) {
  const userId = req.user.userId;
  const { id } = req.params;

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return res.status(400).json({ error: 'INVALID_ID' });
  }

  try {
    const check = await pool.query(
      'SELECT user_id FROM analyses WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
    if (check.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    // Cascade: flashcards linked to this analysis are deleted by FK ON DELETE CASCADE
    await pool.query('DELETE FROM analyses WHERE id = $1', [id]);

    return res.status(200).json({ message: 'Analyse supprimée' });
  } catch (err) {
    console.error('[HistoryController] deleteHistoryItem:', err.message);
    next(err);
  }
}

// ── DELETE /history — delete all for the user ──────────────────────────────
async function clearHistory(req, res, next) {
  const userId = req.user.userId;
  try {
    await pool.query('DELETE FROM analyses WHERE user_id = $1', [userId]);
    return res.status(200).json({ message: 'Historique effacé' });
  } catch (err) {
    console.error('[HistoryController] clearHistory:', err.message);
    next(err);
  }
}

module.exports = { getHistory, getHistoryItem, deleteHistoryItem, clearHistory };
