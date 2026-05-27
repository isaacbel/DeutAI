const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { analyze, analyzeImage } = require('../controllers/analyze.controller');

// Rate-limit: text analysis triggers a paid AI call — 20/min per IP
const textLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    error: 'RATE_LIMIT',
    message: 'Too many analysis requests. Please wait a moment.',
  }),
});

// Rate-limit: image analysis is even more expensive — 6/min per IP
const imageLimiter = rateLimit({
  windowMs: 60_000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    error: 'RATE_LIMIT',
    message: 'Too many image analysis requests. Please wait a moment.',
  }),
});

// POST /analyze        — text grammar analysis
router.post('/', auth, textLimiter, analyze);

// POST /analyze/image  — OCR → grammar analysis
router.post('/image', auth, imageLimiter, analyzeImage);

module.exports = router;
