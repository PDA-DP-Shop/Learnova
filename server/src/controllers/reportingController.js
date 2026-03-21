const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getReporting = async (req, res) => {
  try {
    const { status } = req.query;
    const where = req.user.role === 'ADMIN' ? {} : { course: { instructorId: req.user.id } };
    if (status) where.status = status;

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: {
          select: {
            id: true, title: true, instructorId: true,
            lessons: { select: { id: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Add completion percentage
    const result = await Promise.all(
      enrollments.map(async (enrollment) => {
        const lessonIds = enrollment.course.lessons.map((l) => l.id);
        const completedCount = lessonIds.length > 0
          ? await prisma.lessonProgress.count({
              where: { userId: enrollment.userId, lessonId: { in: lessonIds }, isCompleted: true },
            })
          : 0;
        const percent = lessonIds.length > 0 ? Math.round((completedCount / lessonIds.length) * 100) : 0;
        return { ...enrollment, completedLessons: completedCount, totalLessons: lessonIds.length, completionPercent: percent };
      })
    );

    // Stats
    const total = result.length;
    const yetToStart = result.filter((e) => e.status === 'YET_TO_START').length;
    const inProgress = result.filter((e) => e.status === 'IN_PROGRESS').length;
    const completed = result.filter((e) => e.status === 'COMPLETED').length;

    res.json({ enrollments: result, stats: { total, yetToStart, inProgress, completed } });
  } catch (error) {
    console.error('getReporting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getReporting };
