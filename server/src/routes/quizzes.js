const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getQuizzes, createQuiz, getQuiz, updateQuiz, deleteQuiz,
  addQuestion, updateQuestion, deleteQuestion, updateRewards, submitAttempt,
} = require('../controllers/quizController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');

// Course-level quiz routes (mounted at /api/courses/:courseId/quizzes via courses router NOT separate)
// Standalone quiz routes
router.get('/:id', authenticate, getQuiz);
router.put('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateQuiz);
router.delete('/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteQuiz);
router.post('/:id/questions', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), addQuestion);
router.put('/:id/questions/:questionId', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateQuestion);
router.delete('/:id/questions/:questionId', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteQuestion);
router.put('/:id/rewards', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateRewards);
router.post('/:id/attempt', authenticate, requireRole('LEARNER'), submitAttempt);

// Course-scoped routes
router.get('/', authenticate, getQuizzes);
router.post('/', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), createQuiz);

module.exports = router;
