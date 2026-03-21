const express = require('express');
const router = express.Router({ mergeParams: true });
const { getLessons, createLesson, updateLesson, deleteLesson, addAttachment, deleteAttachment } = require('../controllers/lessonController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');

// Mounted at /api/courses/:courseId/lessons
router.get('/', authenticate, getLessons);
router.post('/', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), createLesson);

// Standalone lesson routes (mounted at /api/lessons)
module.exports = router;
