const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStats } = require('../controllers/stats.controller');

router.get('/', auth, getStats);

module.exports = router;
