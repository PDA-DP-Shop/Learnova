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

// POST /api/enrollments/course/:courseId/invite — instructor invites a learner by email
router.post('/course/:courseId/invite', authenticate, requireRole('INSTRUCTOR', 'ADMIN'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Find the course
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only the course instructor (or admin) can invite
    if (req.user.role !== 'ADMIN' && course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'You are not the instructor of this course' });
    }

    // Find user by email (any role can be invited)
    const learner = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!learner) return res.status(404).json({ message: `No user found with email: ${email}` });
    if (!learner.isActive) return res.status(400).json({ message: 'This user account is disabled' });

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: learner.id, courseId: req.params.courseId } }
    });
    if (existing) return res.status(409).json({ message: `${learner.name} is already enrolled in this course` });

    // Enroll directly
    const enrollment = await prisma.enrollment.create({
      data: { userId: learner.id, courseId: req.params.courseId },
      include: { 
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { title: true } }
      }
    });

    // Notify the learner
    await prisma.notification.create({
      data: {
        userId: learner.id,
        message: `${req.user.name} invited you to join: ${enrollment.course.title}`,
        link: `/courses/${req.params.courseId}`
      }
    });

    console.log(`[Invite] ${req.user.email} invited ${learner.email} to course ${req.params.courseId}`);
    res.status(201).json({
      message: `✅ ${learner.name} has been enrolled successfully`,
      user: enrollment.user,
      enrolledAt: enrollment.enrolledAt,
    });
  } catch (err) {
    console.error('[Invite] Error:', err);
    res.status(500).json({ message: 'Failed to invite learner' });
  }
});

// DELETE /api/enrollments/course/:courseId/invite/:userId — instructor removes a learner
router.delete('/course/:courseId/invite/:userId', authenticate, requireRole('INSTRUCTOR', 'ADMIN'), async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    // Find the course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only the course instructor (or admin) can remove
    if (req.user.role !== 'ADMIN' && course.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Delete enrollment
    const deleted = await prisma.enrollment.delete({
      where: { userId_courseId: { userId, courseId } }
    });

    // Also delete lesson progress
    await prisma.lessonProgress.deleteMany({
      where: { userId, lessonId: { in: (await prisma.lesson.findMany({ where: { courseId }, select: { id: true } })).map(l => l.id) } }
    });

    // Notify the learner
    await prisma.notification.create({
      data: {
        userId,
        message: `${req.user.name} removed your access to: ${course.title}`,
      }
    });

    res.json({ message: 'User removed from course' });
  } catch (err) {
    console.error('[Remove Enrollment] Error:', err);
    res.status(500).json({ message: 'Failed to remove user' });
  }
});

module.exports = router;
