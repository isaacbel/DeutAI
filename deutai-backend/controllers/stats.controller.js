const pool = require('../config/db');

const PERIOD_TO_INTERVAL = {
  '30d': '30 days',
  '3m': '3 months',
  '6m': '6 months',
  '1y': '1 year',
};

async function getStats(req, res, next) {
  const userId = req.user.userId;
  const period = req.query.period;
  const interval = PERIOD_TO_INTERVAL[period] || PERIOD_TO_INTERVAL['30d'];

  try {
    const totalsResult = await pool.query(
      `SELECT
         COUNT(*)                                        AS total_analyses,
         COUNT(*) FILTER (WHERE has_error = true)       AS total_errors,
         ROUND(
           COUNT(*) FILTER (WHERE has_error = true)::numeric
           / NULLIF(COUNT(*), 0) * 100,
           1
         )                                              AS error_percentage
       FROM analyses
       WHERE user_id = $1
         AND created_at >= NOW() - $2::interval`,
      [userId, interval]
    );

    const byTypeResult = await pool.query(
      `SELECT error_type, COUNT(*) AS count
       FROM analyses
       WHERE user_id = $1
         AND has_error = true
         AND error_type != 'aucun'
         AND created_at >= NOW() - $2::interval
       GROUP BY error_type`,
      [userId, interval]
    );

    const typeCountMap = {};
    let mostCommonKey = null;
    let maxCount = 0;

    byTypeResult.rows.forEach((row) => {
      const count = parseInt(row.count, 10);
      typeCountMap[row.error_type] = count;
      if (count > maxCount) {
        maxCount = count;
        mostCommonKey = row.error_type;
      }
    });

    const ERROR_LABELS = {
      // Grammar & Morphology
      conjugaison:       'Conjugaison',
      temps:             'Temps verbal',
      auxiliaire:        'Auxiliaire',
      déclinaison:       'Déclinaison',
      genre:             'Genre',
      nombre:            'Nombre',
      accord:            'Accord',
      // Syntax
      ordre:             'Ordre des mots',
      position_verbe:    'Position du verbe',
      subordonnée:       'Subordonnée',
      // Prepositions
      préposition:       'Préposition',
      cas_prépositionnel:'Cas prépositionnel',
      // Vocabulary
      choix_mot:         'Choix du mot',
      faux_ami:          'Faux ami',
      collocation:       'Collocation',
      registre:          'Registre',
      // Writing
      orthographe:       'Orthographe',
      majuscule:         'Majuscule',
      ponctuation:       'Ponctuation',
      // German-specific
      verbe_séparable:   'Verbe séparable',
      infinitif_zu:      'Infinitif + zu',
      modalverbe:        'Verbe modal',
      // Other
      autre:             'Autre',
    };
    const mostCommonError = mostCommonKey ? ERROR_LABELS[mostCommonKey] || mostCommonKey : null;

    const evolutionResult = await pool.query(
      `SELECT
         DATE(created_at AT TIME ZONE 'UTC') AS date,
         COUNT(*)                             AS count
       FROM analyses
       WHERE user_id = $1
         AND created_at >= NOW() - $2::interval
       GROUP BY DATE(created_at AT TIME ZONE 'UTC')
       ORDER BY date ASC`,
      [userId, interval]
    );

    const evolution30Days = evolutionResult.rows.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      count: parseInt(row.count, 10),
    }));

    const totals = totalsResult.rows[0];

    return res.status(200).json({
      totalAnalyses: parseInt(totals.total_analyses, 10),
      totalErrors: parseInt(totals.total_errors, 10),
      errorRate: parseFloat(totals.error_percentage) || 0,
      errorsByType: typeCountMap,
      evolution: evolution30Days,
      mostCommonError,
      period: Object.keys(PERIOD_TO_INTERVAL).includes(period) ? period : '30d',
    });
  } catch (err) {
    console.error('[StatsController] getStats :', err.message);
    next(err);
  }
}

module.exports = { getStats };
