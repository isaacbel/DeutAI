const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const quizController = require('../controllers/quiz.controller');

// Security fix: require authentication — quiz generation calls a paid AI API
router.post('/generate', auth, quizController.generateQuiz);

module.exports = router;
