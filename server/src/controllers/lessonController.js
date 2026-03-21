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
    const { title, type, videoUrl, duration, description, allowDownload } = req.body;
    let fileUrl;

    if (req.files && req.files.file) {
      fileUrl = await uploadToCloudinary(req.files.file, 'learnova/lessons');
    }

    // Get max order in course
    const maxOrder = await prisma.lesson.aggregate({
      where: { courseId: req.params.courseId },
      _max: { order: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        courseId: req.params.courseId,
        title,
        type,
        videoUrl,
        duration: duration ? parseInt(duration) : null,
        fileUrl,
        description,
        allowDownload: allowDownload === 'true' || allowDownload === true,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: { attachments: true },
    });
    res.status(201).json(lesson);
  } catch (error) {
    console.error('createLesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { title, type, videoUrl, duration, description, allowDownload, order } = req.body;
    let fileUrl;

    if (req.files && req.files.file) {
      fileUrl = await uploadToCloudinary(req.files.file, 'learnova/lessons');
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null;
    if (description !== undefined) updateData.description = description;
    if (allowDownload !== undefined) updateData.allowDownload = allowDownload === 'true' || allowDownload === true;
    if (order !== undefined) updateData.order = parseInt(order);
    if (fileUrl) updateData.fileUrl = fileUrl;
    else if (req.body.deleteFile === 'true' || req.body.deleteFile === true) updateData.fileUrl = null;

    const lesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data: updateData,
      include: { attachments: true },
    });
    res.json(lesson);
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
      attachUrl = await uploadToCloudinary(req.files.file, 'learnova/attachments');
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

module.exports = { getLessons, createLesson, updateLesson, deleteLesson, addAttachment, deleteAttachment };
