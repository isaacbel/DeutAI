const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyze, analyzeImage } = require('../controllers/analyze.controller');

// POST /analyze        — text grammar analysis
router.post('/', auth, analyze);

// POST /analyze/image  — OCR → grammar analysis
router.post('/image', auth, analyzeImage);

module.exports = router;
