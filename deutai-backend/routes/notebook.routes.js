const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { ocr, notebookAnalyze } = require('../controllers/notebook.controller');

router.post('/ocr', auth, ocr);
router.post('/analyze', auth, notebookAnalyze);

module.exports = router;
