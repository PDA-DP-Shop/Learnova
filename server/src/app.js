require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const progressRoutes = require('./routes/progress');
const reportingRoutes = require('./routes/reporting');

// Lesson and quiz controllers for standalone + nested routes
const {
  getLessons, createLesson, updateLesson, deleteLesson, addAttachment, deleteAttachment
} = require('./controllers/lessonController');
const {
  getQuizzes, createQuiz, getQuiz, updateQuiz, deleteQuiz,
  addQuestion, updateQuestion, deleteQuestion, updateRewards, submitAttempt,
} = require('./controllers/quizController');
const { getReviews, createReview } = require('./controllers/reviewController');
const authenticate = require('./middleware/auth');
const requireRole = require('./middleware/role');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 },
}));

// Optional auth
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try { req.user = require('./utils/jwt').verifyAccessToken(token); } catch (e) {}
  }
  next();
};

// Core routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reporting', reportingRoutes);

// Course-scoped lessons
app.get('/api/courses/:courseId/lessons', authenticate, getLessons);
app.post('/api/courses/:courseId/lessons', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), createLesson);

// Standalone lesson ops
app.put('/api/lessons/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateLesson);
app.delete('/api/lessons/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteLesson);
app.post('/api/lessons/:id/attachments', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), addAttachment);
app.delete('/api/lessons/:id/attachments/:attachmentId', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteAttachment);

// Course-scoped quizzes
app.get('/api/courses/:courseId/quizzes', authenticate, getQuizzes);
app.post('/api/courses/:courseId/quizzes', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), createQuiz);

// Standalone quiz ops
app.post('/api/quizzes', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), (req, res, next) => {
  req.params.courseId = req.body.courseId;
  createQuiz(req, res, next);
});
app.get('/api/quizzes/:id', authenticate, getQuiz);
app.put('/api/quizzes/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateQuiz);
app.delete('/api/quizzes/:id', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteQuiz);
app.post('/api/quizzes/:id/questions', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), addQuestion);
app.put('/api/quizzes/:id/questions/:questionId', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateQuestion);
app.delete('/api/quizzes/:id/questions/:questionId', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), deleteQuestion);
app.put('/api/quizzes/:id/rewards', authenticate, requireRole('ADMIN', 'INSTRUCTOR'), updateRewards);
app.post('/api/quizzes/:id/attempt', authenticate, requireRole('LEARNER'), submitAttempt);

// Reviews
app.get('/api/reviews/:courseId', optionalAuth, getReviews);
app.post('/api/reviews/:courseId', authenticate, createReview);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Learnova API running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Learnova server running on port ${PORT}`));

module.exports = app;
