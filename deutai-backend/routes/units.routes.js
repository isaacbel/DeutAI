const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUnitByQrCode } = require('../controllers/units.controller');

router.get('/:qrCode', auth, getUnitByQrCode);

module.exports = router;
