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
    res.json(quiz);
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
    const { answers } = req.body; // { questionId: optionId }
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { include: { options: true } },
        rewards: true,
      },
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Calculate score
    let correct = 0;
    for (const question of quiz.questions) {
      const selectedOptionId = answers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      if (correctOption && selectedOptionId === correctOption.id) correct++;
    }
    const score = Math.round((correct / quiz.questions.length) * 100);

    // Get attempt number
    const prevAttempts = await prisma.quizAttempt.count({
      where: { userId: req.user.id, quizId: req.params.id },
    });
    const attemptNo = prevAttempts + 1;

    // Calculate points
    const rewards = quiz.rewards;
    let pointsEarned = 0;
    if (rewards) {
      if (attemptNo === 1) pointsEarned = rewards.attempt1;
      else if (attemptNo === 2) pointsEarned = rewards.attempt2;
      else if (attemptNo === 3) pointsEarned = rewards.attempt3;
      else pointsEarned = rewards.attempt4;
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user.id,
        quizId: req.params.id,
        attemptNo,
        score,
        pointsEarned,
        answers,
      },
    });

    // Add points to user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { totalPoints: { increment: pointsEarned } },
      select: { totalPoints: true },
    });

    res.json({ attempt, score, pointsEarned, totalPoints: updatedUser.totalPoints, correct, total: quiz.questions.length });
  } catch (error) {
    console.error('submitAttempt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getQuizzes, createQuiz, getQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion, updateRewards, submitAttempt };
