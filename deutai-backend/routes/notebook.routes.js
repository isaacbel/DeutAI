const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { ocr, notebookAnalyze } = require('../controllers/notebook.controller');

// Fix #18 — moved to dedicated middleware file pattern for reusability
function requireJson(req, res, next) {
  if (!req.is('application/json')) {
    return res.status(415).json({
      error: 'UNSUPPORTED_MEDIA_TYPE',
      message: 'Content-Type must be application/json',
    });
  }
  next();
}

// Fix #17 — rate-limit the /ocr route: it triggers an expensive AI Vision call
// Allows 10 requests per minute per IP; adjust windowMs/max for production needs
const ocrLimiter = rateLimit({
  windowMs: 60_000,       // 1 minute
  max: 10,                // max 10 OCR calls per minute per IP
  standardHeaders: true,  // return RateLimit-* headers
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT', message: 'Too many OCR requests. Please wait a moment.' },
});

// /analyze is cheaper (text only) — still rate-limited but more generous
const analyzeLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT', message: 'Too many requests. Please wait a moment.' },
});

router.post('/ocr',     auth, ocrLimiter,     requireJson, ocr);
router.post('/analyze', auth, analyzeLimiter,  requireJson, notebookAnalyze);

module.exports = router;
