const { PrismaClient } = require('@prisma/client');
const { uploadToCloudinary } = require('../utils/cloudinary');

const prisma = new PrismaClient();

const getLessons = async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: req.params.courseId },
      include: { attachments: true },
      orderBy: { order: 'asc' },
    });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createLesson = async (req, res) => {
  try {
    const { title, type, videoUrl, duration, description, allowDownload, quizId, inlineQuestions } = req.body;
    let fileUrl;
    let autoDuration = null;

    if (req.files && req.files.file) {
      const result = await uploadToCloudinary(req.files.file, 'learnova/lessons');
      fileUrl = result.secure_url;
      if (type === 'VIDEO' && result.duration) {
        autoDuration = Math.round(result.duration / 60);
      }
    }

    // Get max order in course
    const maxOrder = await prisma.lesson.aggregate({
      where: { courseId: req.params.courseId },
      _max: { order: true },
    });

    // Handle inline quiz questions for QUIZ-type lessons
    let resolvedQuizId = quizId || null;
    if (type === 'QUIZ' && inlineQuestions) {
      const questions = JSON.parse(inlineQuestions);
      if (questions && questions.length > 0) {
        // If lesson already has a linked quiz, update it; otherwise create new
        if (resolvedQuizId) {
          // Delete existing questions and recreate
          await prisma.question.deleteMany({ where: { quizId: resolvedQuizId } });
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const created = await prisma.question.create({
              data: { quizId: resolvedQuizId, text: q.text, order: i },
            });
            for (const opt of q.options) {
              await prisma.option.create({
                data: { questionId: created.id, text: opt.text, isCorrect: opt.isCorrect },
              });
            }
          }
        } else {
          // Auto-create a quiz for this module
          const quiz = await prisma.quiz.create({
            data: {
              courseId: req.params.courseId,
              title: `${title} — Quiz`,
            },
          });
          resolvedQuizId = quiz.id;
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const created = await prisma.question.create({
              data: { quizId: quiz.id, text: q.text, order: i },
            });
            for (const opt of q.options) {
              await prisma.option.create({
                data: { questionId: created.id, text: opt.text, isCorrect: opt.isCorrect },
              });
            }
          }
        }
      }
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId: req.params.courseId,
        title,
        type,
        videoUrl: videoUrl,
        duration: autoDuration || (duration ? (parseInt(duration) || null) : null),
        fileUrl,
        description,
        quizId: resolvedQuizId,
        allowDownload: allowDownload === 'true' || allowDownload === true,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: { attachments: true },
    });
    res.status(201).json(lesson);
  } catch (error) {
    console.error('createLesson error:', error);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { title, type, videoUrl, duration, description, allowDownload, order, quizId, inlineQuestions } = req.body;
    let fileUrl;
    let autoDuration = null;

    if (req.files && req.files.file) {
      const result = await uploadToCloudinary(req.files.file, 'learnova/lessons');
      fileUrl = result.secure_url;
      if ((type === 'VIDEO' || req.body.type === 'VIDEO') && result.duration) {
        autoDuration = Math.round(result.duration / 60);
      }
    }

    // Handle inline quiz questions
    let resolvedQuizId = quizId || null;
    if (type === 'QUIZ' && inlineQuestions) {
      const questions = JSON.parse(inlineQuestions);
      if (questions && questions.length > 0) {
        if (resolvedQuizId) {
          // Update existing quiz questions
          await prisma.question.deleteMany({ where: { quizId: resolvedQuizId } });
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const created = await prisma.question.create({
              data: { quizId: resolvedQuizId, text: q.text, order: i },
            });
            for (const opt of q.options) {
              await prisma.option.create({
                data: { questionId: created.id, text: opt.text, isCorrect: opt.isCorrect },
              });
            }
          }
        } else {
          // Auto-create quiz for the first time
          const existingLesson = await prisma.lesson.findUnique({ where: { id: req.params.id } });
          const quiz = await prisma.quiz.create({
            data: {
              courseId: existingLesson.courseId,
              title: `${title} — Quiz`,
            },
          });
          resolvedQuizId = quiz.id;
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const created = await prisma.question.create({
              data: { quizId: quiz.id, text: q.text, order: i },
            });
            for (const opt of q.options) {
              await prisma.option.create({
                data: { questionId: created.id, text: opt.text, isCorrect: opt.isCorrect },
              });
            }
          }
        }
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (autoDuration) updateData.duration = autoDuration;
    else if (duration !== undefined) updateData.duration = duration ? (parseInt(duration) || null) : null;
    if (description !== undefined) updateData.description = description;
    if (allowDownload !== undefined) updateData.allowDownload = allowDownload === 'true' || allowDownload === true;
    if (order !== undefined) updateData.order = parseInt(order);
    // Always set resolvedQuizId (may be auto-created above)
    updateData.quizId = resolvedQuizId;
    if (fileUrl) updateData.fileUrl = fileUrl;
    else if (req.body.deleteFile === 'true' || req.body.deleteFile === true) updateData.fileUrl = null;

    const lesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data: updateData,
      include: { attachments: true },
    });
    res.json(lesson);
  } catch (error) {
    console.error('updateLesson error:', error?.message, error?.code);
    res.status(500).json({ message: error?.message || 'Server error' });
  }
};

// GET quiz questions for a lesson (to load in editor)
const getLessonQuiz = async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      select: { quizId: true },
    });
    if (!lesson?.quizId) return res.json({ questions: [] });
    const questions = await prisma.question.findMany({
      where: { quizId: lesson.quizId },
      include: { options: true },
      orderBy: { order: 'asc' },
    });
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addAttachment = async (req, res) => {
  try {
    const { type, url, name } = req.body;
    let attachUrl = url;

    if (req.files && req.files.file) {
      const result = await uploadToCloudinary(req.files.file, 'learnova/attachments');
      attachUrl = result.secure_url;
    }

    const attachment = await prisma.attachment.create({
      data: { lessonId: req.params.id, type: type || 'LINK', url: attachUrl, name },
    });
    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    await prisma.attachment.delete({ where: { id: req.params.attachmentId } });
    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getLessons, createLesson, updateLesson, deleteLesson, addAttachment, deleteAttachment, getLessonQuiz };
