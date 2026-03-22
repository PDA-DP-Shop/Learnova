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
    const coursesWithDuration = courses.map(c => ({
      ...c,
      totalDuration: c.lessons.reduce((acc, l) => acc + (l.duration || 0), 0)
    }));
    res.json(coursesWithDuration);
  } catch (error) {
    console.error('getCourses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/courses/public - public course list (respects visibility)
const getPublicCourses = async (req, res) => {
  try {
    const where = { isPublished: true };

    // Unauthenticated users: only EVERYONE-visible + OPEN/PAYMENT courses (never invitation-only)
    if (!req.user) {
      where.visibility = 'EVERYONE';
      where.accessRule = { not: 'ON_INVITATION' };

      const courses = await prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true } },
          lessons: { select: { duration: true } },
          _count: { select: { lessons: true, enrollments: true, quizzes: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(courses.map(c => ({
        ...c,
        totalDuration: c.lessons.reduce((acc, l) => acc + (l.duration || 0), 0)
      })));
    }

    // Authenticated users — exclude ON_INVITATION courses they are NOT enrolled in
    // Step 1: get the IDs of ON_INVITATION courses this user IS enrolled in
    const invitedEnrollments = await prisma.enrollment.findMany({
      where: {
        userId: req.user.id,
        course: { isPublished: true, accessRule: 'ON_INVITATION' }
      },
      select: { courseId: true }
    });
    const enrolledInvitedIds = invitedEnrollments.map(e => e.courseId);

    // Step 2: visibility filter
    if (req.user.role === 'LEARNER') {
      where.visibility = 'EVERYONE'; // SIGNED_IN should also show — adjust if needed
    }

    // Step 3: build the accessRule filter:
    // Show OPEN + ON_PAYMENT always, plus ON_INVITATION only if enrolled
    const accessRuleFilter = enrolledInvitedIds.length > 0
      ? {
          OR: [
            { accessRule: { not: 'ON_INVITATION' } },
            { accessRule: 'ON_INVITATION', id: { in: enrolledInvitedIds } }
          ]
        }
      : { accessRule: { not: 'ON_INVITATION' } };

    const courses = await prisma.course.findMany({
      where: { ...where, ...accessRuleFilter },
      include: {
        instructor: { select: { id: true, name: true } },
        lessons: { select: { duration: true } },
        _count: { select: { lessons: true, enrollments: true, quizzes: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses.map(c => ({
      ...c,
      totalDuration: c.lessons.reduce((acc, l) => acc + (l.duration || 0), 0)
    })));
  } catch (error) {
    console.error('[getPublicCourses]', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/courses - create course
const createCourse = async (req, res) => {
  try {
    const { title, rewardXP } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const course = await prisma.course.create({
      data: { 
        title, 
        instructorId: req.user.id,
        rewardXP: parseInt(rewardXP) || 500
      },
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
    const { title, description, tags, website, visibility, accessRule, price, isPublished, rewardXP } = req.body;
    let coverImage;

    if (req.files && req.files.coverImage) {
      const result = await uploadToCloudinary(req.files.coverImage, 'learnova/covers');
      coverImage = result.secure_url;
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
    if (rewardXP !== undefined) updateData.rewardXP = parseInt(rewardXP) || 500;
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
    
    // Notify followers if publishing
    if (updated.isPublished) {
      const instructor = await prisma.user.findUnique({
        where: { id: updated.instructorId },
        include: { followers: true }
      });
      if (instructor && instructor.followers.length > 0) {
        const notifications = instructor.followers.map(f => ({
          userId: f.followerId,
          message: `${instructor.name} compiled a new course: ${updated.title}!`,
          link: `/courses/${updated.id}`
        }));
        await prisma.notification.createMany({ data: notifications });
      }
    }
    
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
        lessons: { 
          include: { 
            attachments: true,
            quiz: { include: { questions: { include: { options: true }, orderBy: { order: 'asc' } } } }
          }, 
          orderBy: { order: 'asc' } 
        },
        quizzes: { include: { rewards: true } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!req.user) {
      // Unauthenticated: block ON_INVITATION entirely
      if (course.accessRule === 'ON_INVITATION') {
        return res.status(403).json({ message: 'This course is invitation-only' });
      }
    }

    let enrollment = null;
    let lessonProgress = [];
    let quizAttempts = [];
    let isFollowing = false;
    
    if (req.user) {
      enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.id, courseId: req.params.id } },
      });

      // Authenticated but not enrolled → block ON_INVITATION courses
      // (Admins and the course instructor can always view)
      if (
        course.accessRule === 'ON_INVITATION' &&
        !enrollment &&
        req.user.role !== 'ADMIN' &&
        course.instructorId !== req.user.id
      ) {
        return res.status(403).json({ message: 'This course is invitation-only. Ask the instructor to invite you.' });
      }

      lessonProgress = await prisma.lessonProgress.findMany({
        where: { userId: req.user.id, lessonId: { in: course.lessons.map((l) => l.id) } },
      });
      quizAttempts = await prisma.quizAttempt.findMany({
        where: { userId: req.user.id, quizId: { in: course.quizzes.map((q) => q.id) } },
        orderBy: { attemptNo: 'desc' },
      });
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.user.id, followingId: course.instructorId } }
      });
      if (follow) isFollowing = true;
    }

    const allAttempts = await prisma.quizAttempt.findMany({
      where: { quizId: { in: course.quizzes.map((q) => q.id) } },
      include: { user: { select: { id: true, name: true, avatar: true } }, quiz: { select: { title: true } } },
      orderBy: [
        { score: 'desc' },
        { timeTaken: 'asc' },
      ],
    });

    const userMap = new Map();
    for (const a of allAttempts) {
      if (!userMap.has(a.userId)) userMap.set(a.userId, a);
    }
    const leaderboard = Array.from(userMap.values()).slice(0, 3);

    const totalDuration = course.lessons.reduce((acc, l) => acc + (l.duration || 0), 0);

    res.json({ course: { ...course, totalDuration }, enrollment, lessonProgress, quizAttempts, leaderboard, isFollowing });
  } catch (error) {
    console.error('getCourseDetail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCourses, getPublicCourses, createCourse, getCourse, updateCourse, deleteCourse, togglePublish, getCourseDetail };
