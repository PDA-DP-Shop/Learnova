const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const enroll = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
    });
    if (existing) return res.status(409).json({ message: 'Already enrolled' });

    const enrollment = await prisma.enrollment.create({
      data: { userId: req.user.id, courseId },
      include: { course: true },
    });
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
    const enrollment = await prisma.enrollment.update({
      where: { userId_courseId: { userId: req.user.id, courseId: req.params.courseId } },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { enroll, getMyEnrollments, completeCourse };
