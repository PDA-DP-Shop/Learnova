const express = require('express');
const router = express.Router();
const { getReporting } = require('../controllers/reportingController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');

router.get('/', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), getReporting);

module.exports = router;
