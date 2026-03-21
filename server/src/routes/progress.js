const express = require('express');
const router = express.Router();
const { markLessonComplete, getProgress } = require('../controllers/progressController');
const authenticate = require('../middleware/auth');

router.post('/lesson', authenticate, markLessonComplete);
router.get('/', authenticate, getProgress);

module.exports = router;
