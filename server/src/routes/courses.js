const express = require('express');
const router = express.Router();
const {
  getCourses, getPublicCourses, createCourse, getCourse,
  updateCourse, deleteCourse, togglePublish, getCourseDetail,
} = require('../controllers/courseController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');

// Optional auth middleware - attaches user if token exists but doesn't require it
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { verifyAccessToken } = require('../utils/jwt');
      req.user = verifyAccessToken(token);
    } catch (e) { /* no-op */ }
  }
  next();
};

router.get('/public', optionalAuth, getPublicCourses);
router.get('/', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), getCourses);
router.post('/', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), createCourse);
router.get('/:id/detail', optionalAuth, getCourseDetail);
router.get('/:id', authenticate, getCourse);
router.put('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateCourse);
router.delete('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteCourse);
router.put('/:id/publish', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), togglePublish);

module.exports = router;
