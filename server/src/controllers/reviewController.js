const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { courseId: req.params.courseId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating) return res.status(400).json({ message: 'Rating is required' });

    const existing = await prisma.review.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: req.params.courseId } }
    });

    let pointsEarned = 0;
    if (!existing) {
      pointsEarned = 0; // No XP for reviews per user request
    }

    const review = await prisma.review.upsert({
      where: { userId_courseId: { userId: req.user.id, courseId: req.params.courseId } },
      update: { rating: parseInt(rating), text },
      create: { userId: req.user.id, courseId: req.params.courseId, rating: parseInt(rating), text },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { totalPoints: true } });

    res.status(201).json({ review, pointsEarned, totalPoints: updatedUser.totalPoints });
  } catch (error) {
    console.error('createReview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getReviews, createReview };
