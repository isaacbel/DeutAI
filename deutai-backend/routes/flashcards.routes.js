const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getFlashcards, deleteFlashcard } = require('../controllers/flashcards.controller');

router.get('/', auth, getFlashcards);
router.delete('/:id', auth, deleteFlashcard);

module.exports = router;
