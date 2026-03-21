const express = require('express');
const router = express.Router();
const { enroll, getMyEnrollments, completeCourse, updateTimeSpent } = require('../controllers/enrollmentController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', authenticate, enroll);
router.get('/my', authenticate, getMyEnrollments);
router.put('/:courseId/complete', authenticate, completeCourse);
router.put('/:courseId/time', authenticate, updateTimeSpent);

// GET /api/enrollments/course/:courseId/attendees — instructor or admin only
router.get('/course/:courseId/attendees', authenticate, requireRole('INSTRUCTOR', 'ADMIN'), async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: req.params.courseId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, totalPoints: true, role: true } },
        course: { 
          select: { 
            lessons: { select: { id: true } }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    // Attach lesson progress counts
    const enriched = await Promise.all(enrollments.map(async (e) => {
      const completed = await prisma.lessonProgress.count({
        where: { userId: e.userId, lessonId: { in: e.course.lessons.map(l => l.id) }, isCompleted: true }
      });
      const total = e.course.lessons.length;
      return {
        id: e.id,
        userId: e.user.id,
        name: e.user.name,
        email: e.user.email,
        avatar: e.user.avatar,
        totalPoints: e.user.totalPoints,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        status: e.status,
        timeSpent: e.timeSpent,
        lessonsCompleted: completed,
        totalLessons: total,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error('[Attendees] Error:', err);
    res.status(500).json({ message: 'Failed to fetch attendees' });
  }
});

module.exports = router;
