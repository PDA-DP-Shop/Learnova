const { PrismaClient } = require('@prisma/client');
const { uploadToCloudinary } = require('../utils/cloudinary');

const prisma = new PrismaClient();

// GET /api/courses - list courses (admin/instructor sees their own)
const getCourses = async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { instructorId: req.user.id };
    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        lessons: { select: { id: true, duration: true } },
        enrollments: { select: { id: true } },
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses);
  } catch (error) {
    console.error('getCourses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/courses/public - public course list (respects visibility)
const getPublicCourses = async (req, res) => {
  try {
    const where = { isPublished: true };
    if (!req.user) {
      where.visibility = 'EVERYONE';
    }
    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true } },
        _count: { select: { lessons: true, enrollments: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/courses - create course
const createCourse = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const course = await prisma.course.create({
      data: { title, instructorId: req.user.id },
    });
    res.status(201).json(course);
  } catch (error) {
    console.error('createCourse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/courses/:id - get course details
const getCourse = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        lessons: { include: { attachments: true }, orderBy: { order: 'asc' } },
        quizzes: { include: { questions: { include: { options: true }, orderBy: { order: 'asc' } }, rewards: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/courses/:id - update course
const updateCourse = async (req, res) => {
  try {
    const { title, description, tags, website, visibility, accessRule, price, isPublished } = req.body;
    let coverImage;

    if (req.files && req.files.coverImage) {
      coverImage = await uploadToCloudinary(req.files.coverImage, 'learnova/covers');
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : JSON.parse(tags || '[]');
    if (website !== undefined) updateData.website = website;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (accessRule !== undefined) updateData.accessRule = accessRule;
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (isPublished !== undefined) updateData.isPublished = isPublished === 'true' || isPublished === true;
    if (coverImage) updateData.coverImage = coverImage;

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(course);
  } catch (error) {
    console.error('updateCourse error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/courses/:id/publish - toggle publish status
const togglePublish = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: { isPublished: !course.isPublished },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/courses/:id/detail - course detail with learner's progress
const getCourseDetail = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { id: true, name: true } },
        lessons: { include: { attachments: true }, orderBy: { order: 'asc' } },
        quizzes: { include: { rewards: true } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let enrollment = null;
    let lessonProgress = [];
    if (req.user) {
      enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.id, courseId: req.params.id } },
      });
      lessonProgress = await prisma.lessonProgress.findMany({
        where: { userId: req.user.id, lessonId: { in: course.lessons.map((l) => l.id) } },
      });
    }

    res.json({ course, enrollment, lessonProgress });
  } catch (error) {
    console.error('getCourseDetail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCourses, getPublicCourses, createCourse, getCourse, updateCourse, deleteCourse, togglePublish, getCourseDetail };
