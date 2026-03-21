const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: req.params.courseId },
      include: {
        questions: { include: { options: true }, orderBy: { order: 'asc' } },
        rewards: true,
        _count: { select: { attempts: true } },
      },
    });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createQuiz = async (req, res) => {
  try {
    const { title } = req.body;
    const quiz = await prisma.quiz.create({
      data: { courseId: req.params.courseId, title },
      include: { questions: true, rewards: true },
    });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuiz = async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { include: { options: true }, orderBy: { order: 'asc' } },
        rewards: true,
      },
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Include user's attempts if authenticated
    let userAttempts = [];
    if (req.user) {
      userAttempts = await prisma.quizAttempt.findMany({
        where: { userId: req.user.id, quizId: req.params.id },
        orderBy: { completedAt: 'desc' },
      });
    }

    res.json({
      ...JSON.parse(JSON.stringify(quiz)),
      userAttempts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const quiz = await prisma.quiz.update({
      where: { id: req.params.id },
      data: { title: req.body.title },
    });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    await prisma.quiz.delete({ where: { id: req.params.id } });
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { text, options } = req.body;
    const maxOrder = await prisma.question.aggregate({
      where: { quizId: req.params.id },
      _max: { order: true },
    });
    const question = await prisma.question.create({
      data: {
        quizId: req.params.id,
        text,
        order: (maxOrder._max.order || 0) + 1,
        options: {
          create: options.map((opt) => ({ text: opt.text, isCorrect: opt.isCorrect })),
        },
      },
      include: { options: true },
    });
    res.status(201).json(question);
  } catch (error) {
    console.error('addQuestion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { text, options } = req.body;
    // Delete old options and recreate
    await prisma.option.deleteMany({ where: { questionId: req.params.questionId } });
    const question = await prisma.question.update({
      where: { id: req.params.questionId },
      data: {
        text,
        options: {
          create: options.map((opt) => ({ text: opt.text, isCorrect: opt.isCorrect })),
        },
      },
      include: { options: true },
    });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    await prisma.question.delete({ where: { id: req.params.questionId } });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRewards = async (req, res) => {
  try {
    const { attempt1, attempt2, attempt3, attempt4 } = req.body;
    const rewards = await prisma.quizReward.upsert({
      where: { quizId: req.params.id },
      update: {
        attempt1: parseInt(attempt1),
        attempt2: parseInt(attempt2),
        attempt3: parseInt(attempt3),
        attempt4: parseInt(attempt4),
      },
      create: {
        quizId: req.params.id,
        attempt1: parseInt(attempt1) || 100,
        attempt2: parseInt(attempt2) || 75,
        attempt3: parseInt(attempt3) || 50,
        attempt4: parseInt(attempt4) || 25,
      },
    });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const { id: quizId } = req.params;
    const userId = req.user.id;
    
    console.log(`[QuizSubmit] Processing quizId=${quizId} for userId=${userId}`);
    
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { include: { options: true } },
        rewards: true,
      },
    });

    if (!quiz) {
      console.warn(`[QuizSubmit] Quiz not found: ${quizId}`);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      console.warn(`[QuizSubmit] Quiz has no questions: ${quizId}`);
      return res.json({ score: 0, pointsEarned: 0, totalPoints: req.user.totalPoints || 0, correct: 0, total: 0 });
    }

    // Calculate score
    let correct = 0;
    for (const question of quiz.questions) {
      const selectedOptionId = answers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      if (correctOption && selectedOptionId === correctOption.id) correct++;
    }
    const score = Math.round((correct / quiz.questions.length) * 100) || 0;

    // Get attempt number
    const prevAttempts = await prisma.quizAttempt.count({
      where: { userId, quizId },
    });
    const attemptNo = prevAttempts + 1;

    // One-time XP logic
    const alreadyEarned = await prisma.quizAttempt.findFirst({
      where: { userId, quizId, pointsEarned: { gt: 0 } }
    });

    let pointsEarned = 0;
    if (!alreadyEarned && score === 100 && (req.user.role === 'LEARNER' || req.user.role === 'ADMIN')) {
      const rewards = quiz.rewards;
      if (rewards) {
        if (attemptNo === 1) pointsEarned = rewards.attempt1;
        else if (attemptNo === 2) pointsEarned = rewards.attempt2;
        else if (attemptNo === 3) pointsEarned = rewards.attempt3;
        else pointsEarned = rewards.attempt4;
      } else {
        pointsEarned = 10; // BASE XP if no rewards defined
      }
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        attemptNo,
        score,
        pointsEarned,
        answers,
        timeTaken: parseInt(timeTaken) || 0,
      },
    });

    // Add points to user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: pointsEarned || 0 } },
      select: { totalPoints: true },
    });

    console.log(`[QuizSubmit] Success: userId=${userId}, score=${score}, pointsEarned=${pointsEarned}`);
    res.json({ attempt, score, pointsEarned, totalPoints: updatedUser.totalPoints, correct, total: quiz.questions.length });
  } catch (error) {
    console.error('[QuizSubmit] FATAL ERROR:', error);
    res.status(500).json({ message: error?.message || 'Server error during submission' });
  }
};

module.exports = { getQuizzes, createQuiz, getQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion, updateRewards, submitAttempt };
