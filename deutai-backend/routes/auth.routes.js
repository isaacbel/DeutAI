const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
