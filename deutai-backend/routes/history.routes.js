const express = require('express');
const router  = express.Router();
const authenticate = require('../middleware/auth');
const {
  getHistory,
  getHistoryItem,
  deleteHistoryItem,
  clearHistory,
} = require('../controllers/history.controller');

router.use(authenticate);

router.get('/',         getHistory);
router.get('/:id',      getHistoryItem);
router.delete('/all',   clearHistory);       // must come before /:id
router.delete('/:id',   deleteHistoryItem);

module.exports = router;
