const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { ocr, notebookAnalyze } = require('../controllers/notebook.controller');

// FIX: Enforce JSON content-type on both routes to reject malformed requests early
// and prevent body-parser from silently receiving unexpected payloads.
function requireJson(req, res, next) {
  if (!req.is('application/json')) {
    return res.status(415).json({
      error: 'UNSUPPORTED_MEDIA_TYPE',
      message: 'Content-Type must be application/json',
    });
  }
  next();
}

// NOTE: Consider adding rate-limiting middleware (e.g. express-rate-limit) to
// the /ocr route specifically, as it triggers an expensive Claude Vision call.
// Example: router.post('/ocr', auth, rateLimit({ windowMs: 60_000, max: 10 }), requireJson, ocr);
router.post('/ocr', auth, requireJson, ocr);
router.post('/analyze', auth, requireJson, notebookAnalyze);

module.exports = router;
