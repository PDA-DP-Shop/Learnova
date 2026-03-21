const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const lesson = await prisma.lesson.findUnique({ 
      where: { id: lessonId }, 
      select: { courseId: true, type: true, duration: true } 
    });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    let pointsEarned = 0; // Removed XP reward for lessons per user request

    const progressResult = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: req.user.id, lessonId } },
      update: { isCompleted: true, completedAt: new Date() },
      create: { userId: req.user.id, lessonId, isCompleted: true, completedAt: new Date() },
    });

    // Update enrollment status to IN_PROGRESS if YET_TO_START
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: lesson.courseId } },
    });
    if (enrollment && enrollment.status === 'YET_TO_START') {
      await prisma.enrollment.update({
        where: { userId_courseId: { userId: req.user.id, courseId: lesson.courseId } },
        data: { status: 'IN_PROGRESS', startedAt: new Date() },
      });
    }

    // Check if all lessons are completed
    const totalLessons = await prisma.lesson.count({ where: { courseId: lesson.courseId } });
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: req.user.id,
        isCompleted: true,
        lesson: { courseId: lesson.courseId },
      },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { totalPoints: true } });

    res.json({ 
      progress: progressResult, 
      completedLessons, 
      totalLessons, 
      allCompleted: completedLessons >= totalLessons,
      pointsEarned,
      totalPoints: updatedUser.totalPoints
    });
  } catch (error) {
    console.error('markLessonComplete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProgress = async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = { userId: req.user.id };
    if (courseId) {
      where.lesson = { courseId };
    }
    const progress = await prisma.lessonProgress.findMany({ where });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { markLessonComplete, getProgress };
