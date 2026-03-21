const { PrismaClient } = require('@prisma/client');
const { sendLearnerEnrollmentEmail, sendInstructorEnrollmentEmail } = require('../utils/email');

const prisma = new PrismaClient();

const enroll = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.accessRule === 'ON_PAYMENT' && !req.body.simulated) {
      return res.status(403).json({ message: 'This course requires payment. Please use the payment gateway.' });
    }

    // Capture Learner Identity
    const learner = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    // Capture Instructor Identity
    const instructor = await prisma.user.findUnique({ where: { id: course.instructorId } });

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });
    if (existing) return res.status(409).json({ message: 'Already enrolled' });

    const enrollment = await prisma.$transaction(async (tx) => {
      // 4a. Create the acquisition record (₹0 Payment)
      await tx.payment.create({
        data: {
          userId: req.user.id,
          courseId,
          amount: 0,
          method: 'FREE_ACCESS',
          orderId: 'FREE-' + Math.floor(1000 + Math.random() * 9000),
          status: 'SUCCESS'
        }
      });

      // 4b. Create the enrollment link
      return await tx.enrollment.create({
        data: { userId: req.user.id, courseId },
        include: { course: true },
      });
    });

    // 5. Asynchronous Communication Dispatch (Background)
    (async () => {
      try {
        await Promise.all([
          sendLearnerEnrollmentEmail({
            learnerEmail: learner.email,
            learnerName: learner.name,
            courseName: course.title,
            instructorName: instructor?.name || 'Curriculum Lead',
            courseId: course.id
          }),
          sendInstructorEnrollmentEmail({
            instructorEmail: instructor?.email,
            instructorName: instructor?.name,
            learnerName: learner.name,
            learnerEmail: learner.email,
            courseName: course.title,
            amount: 0,
            orderId: 'FREE-CAPTURE-' + Math.floor(1000 + Math.random() * 9000)
          })
        ]);
        console.log(`[ENROLL_HUB] Intelligence tokens dispatched for free acquisition: ${learner.email}`);
      } catch (commError) {
        console.error('[ENROLL_HUB_FAILURE] Communication collapsed:', commError.message);
      }
    })();

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('enroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            lessons: { select: { id: true } },
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Add progress for each enrollment
    const result = await Promise.all(
      enrollments.map(async (enrollment) => {
        const lessonIds = enrollment.course.lessons.map((l) => l.id);
        const completedCount = await prisma.lessonProgress.count({
          where: { userId: req.user.id, lessonId: { in: lessonIds }, isCompleted: true },
        });
        return {
          ...enrollment,
          completedLessons: completedCount,
          totalLessons: lessonIds.length,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const completeCourse = async (req, res) => {
  try {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: req.params.id || req.params.courseId } },
      include: { course: true }
    });

    if (!existing) return res.status(404).json({ message: 'Enrollment not found' });
    if (existing.status === 'COMPLETED') return res.json({ enrollment: existing, pointsEarned: 0 });

    const pointsEarned = 0; // Removed course completion XP per user request

    const enrollment = await prisma.enrollment.update({
      where: { userId_courseId: { userId: req.user.id, courseId: req.params.id || req.params.courseId } },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { totalPoints: true } });

    res.json({ enrollment, pointsEarned, totalPoints: updatedUser.totalPoints });
  } catch (error) {
    console.error('completeCourse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTimeSpent = async (req, res) => {
  try {
    const { deltaSeconds } = req.body;
    const courseId = req.params.courseId || req.params.id;

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });

    if (!existing) return res.status(404).json({ message: 'Enrollment not found' });

    const enrollment = await prisma.enrollment.update({
      where: { userId_courseId: { userId: req.user.id, courseId } },
      data: { timeSpent: { increment: Math.max(0, parseInt(deltaSeconds) || 0) } },
    });

    res.json(enrollment);
  } catch (error) {
    console.error('updateTimeSpent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { enroll, getMyEnrollments, completeCourse, updateTimeSpent };
