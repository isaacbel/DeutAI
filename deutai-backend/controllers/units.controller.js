const pool = require('../config/db');

async function getUnitByQrCode(req, res, next) {
  const { qrCode } = req.params;

  if (!qrCode || qrCode.trim() === '') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: ['QR code invalide'],
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, qr_code_slug, title, chapter_number, type
       FROM units
       WHERE qr_code_slug = $1`,
      [qrCode.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    const unit = result.rows[0];

    return res.status(200).json({
      id: unit.id,
      qr_code_slug: unit.qr_code_slug,
      title: unit.title,
      chapter_number: unit.chapter_number,
      type: unit.type,
    });
  } catch (err) {
    console.error('[UnitsController] getUnitByQrCode :', err.message);
    next(err);
  }
}

module.exports = { getUnitByQrCode };
