const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/role');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { enrollments: true, courses: true, reviews: true, quizAttempts: true } }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/toggle-status', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'Cannot ban yourself' });
    const { isActive } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
    });
    res.json(user);
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    
    // 🛡️ High-Fidelity Atomic Purge Protocol
    await prisma.$transaction([
      // 1. Cleanup Learner Footprint
      prisma.lessonProgress.deleteMany({ where: { userId: id } }),
      prisma.quizAttempt.deleteMany({ where: { userId: id } }),
      prisma.review.deleteMany({ where: { userId: id } }),
      prisma.enrollment.deleteMany({ where: { userId: id } }),
      prisma.payment.deleteMany({ where: { userId: id } }),
      
      // 2. Cleanup Social & Communication Discovery
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.follow.deleteMany({ where: { 
        OR: [{ followerId: id }, { followingId: id }] 
      } }),

      // 3. Optional: Cleanup Instructor Footprint
      // This will cascade delete lessons, quizzes through Course relation (if config allows)
      // Note: If courses have other students, deleting the course might be destructive.
      // But for a total purge, we clear the curriculum links.
      prisma.course.deleteMany({ where: { instructorId: id } }),

      // 4. Final Solution: User Dissolution
      prisma.user.delete({ where: { id: id } })
    ]);

    console.log(`[PURGE_STATION] User ${id} dissolution finalized successfully.`);
    res.json({ success: true, message: 'User and all associated signatures purged.' });
  } catch (error) {
    console.error('[PURGE_FAILURE] User dissolution collapsed:', error.message);
    res.status(500).json({ 
      message: 'Failed to purge user. They may have active curriculum associations that require manual oversight.',
      details: error.message 
    });
  }
});

// Notifications
router.get('/me/notifications', authenticate, async (req, res) => {
  try {
    const notifs = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    res.json(notifs)
  } catch(error) {
    res.status(500).json({ message: 'Error fetching notifications' })
  }
})

router.patch('/me/notifications/read', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true }
    })
    res.json({ success: true })
  } catch(error) {
    res.status(500).json({ message: 'Error updating notifications' })
  }
})

// Follow actions
router.post('/:id/follow', authenticate, async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: "Cannot follow yourself" })
    
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.user.id, followingId: req.params.id } }
    })

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } })
      return res.json({ following: false })
    }

    await prisma.follow.create({
      data: { followerId: req.user.id, followingId: req.params.id }
    })
    res.json({ following: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Profile Detail
router.get('/:id/profile', async (req, res) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, avatar: true, role: true, totalPoints: true, createdAt: true,
        _count: { select: { followers: true, following: true } }
      }
    })
    
    if (!profile) return res.status(404).json({ message: 'User not found' });
    
    let isFollowing = false;
    let isOwner = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded && decoded.id) {
          if (decoded.id === req.params.id) {
            isOwner = true;
          } else {
            const f = await prisma.follow.findUnique({
              where: { followerId_followingId: { followerId: decoded.id, followingId: req.params.id } }
            })
            isFollowing = !!f;
          }
        }
      } catch(e) {}
    }

    const whereClause = { instructorId: req.params.id };

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        _count: { select: { enrollments: true, lessons: true, reviews: true } }
      }
    })

    res.json({ profile, courses, isFollowing, isOwner })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router;
