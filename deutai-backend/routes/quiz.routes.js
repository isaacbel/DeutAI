const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// Generate a quiz via Groq
router.post('/generate', quizController.generateQuiz);

module.exports = router;
