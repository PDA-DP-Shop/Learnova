const { prisma } = require('../config/db');
const { sendLearnerPurchaseEmail, sendInstructorEnrollmentEmail } = require('../utils/email');

const fakeProcessPayment = async (req, res) => {
  try {
    const { courseId, amount, method, last4 } = req.body;
    const userId = req.user.id;

    // 1. Verify existence and rules with instructor discovery
    const course = await prisma.course.findUnique({ 
      where: { id: courseId },
      include: { instructor: { select: { id: true, name: true, email: true } } }
    });
    if (!course) return res.status(404).json({ message: 'Curriculum not discovered' });

    // 2. Fetch Learner Identity
    const learner = await prisma.user.findUnique({ where: { id: userId } });
    if (!learner) return res.status(404).json({ message: 'Learner identity not found' });
    
    // In simulation, we allow it even if rules are OPEN for testing, but typically ON_PAYMENT
    if (course.accessRule !== 'ON_PAYMENT' && course.accessRule !== 'OPEN') {
       return res.status(400).json({ message: 'Invalid acquisition rule' });
    }

    // 2. Already enrolled?
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (existing) return res.status(409).json({ message: 'Already mastered this curriculum' });

    // 3. Generate Simulated Order ID: LRN-XXXX
    const orderId = `LRN-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Atomic Transaction: Create Payment & Enrollment
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId,
          courseId,
          amount: parseFloat(amount),
          method,
          last4: last4 || null,
          orderId,
          status: 'SUCCESS'
        }
      });

      const enrollment = await tx.enrollment.create({
        data: {
          userId,
          courseId,
          status: 'YET_TO_START'
        }
      });

      return { payment, enrollment };
    });

    res.status(201).json({
      success: true,
      message: 'Acquisition finalized',
      orderId: result.payment.orderId,
      paymentId: result.payment.id,
      method: result.payment.method,
      amount: result.payment.amount,
      courseTitle: course.title
    });

    // 5. Asynchronous Communication Dispatch (Background)
    (async () => {
      try {
        await Promise.all([
          sendLearnerPurchaseEmail({
            learnerEmail: learner.email,
            learnerName: learner.name,
            courseName: course.title,
            instructorName: course.instructor?.name,
            amount: result.payment.amount,
            orderId: result.payment.orderId,
            courseId: course.id
          }),
          sendInstructorEnrollmentEmail({
            instructorEmail: course.instructor?.email,
            instructorName: course.instructor?.name,
            learnerName: learner.name,
            learnerEmail: learner.email,
            courseName: course.title,
            amount: result.payment.amount,
            orderId: result.payment.orderId
          })
        ]);
        console.log(`[COMM_HUB] Intelligence tokens dispatched for ${learner.email} and ${course.instructor?.email}`);
      } catch (commError) {
        console.error('[COMM_HUB_FAILURE] Settlement communication collapsed:', commError.message);
      }
    })();

  } catch (error) {
    console.error('SIM_PAYMENT_ERROR:', error);
    res.status(500).json({ message: 'Acquisition synchronization failure' });
  }
};

const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await prisma.payment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: 'Ledger retrieval failure' });
  }
};

const getInstructorPayments = async (req, res) => {
  try {
    const instructorId = req.user.id;
    // Role-based discovery: Admin sees all, Instructor sees their own portfolio
    const where = req.user.role === 'ADMIN' ? {} : { course: { instructorId: req.user.id } };

    const payments = await prisma.payment.findMany({
      where,
      include: {
        course: { select: { id: true, title: true, coverImage: true, instructorId: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: 'Revenue ledger retrieval failure' });
  }
};

const getPaymentStats = async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? { status: 'SUCCESS' } : { status: 'SUCCESS', course: { instructorId: req.user.id } };

    const payments = await prisma.payment.findMany({
      where,
      select: { amount: true, createdAt: true },
    });

    const dailyRevenue = payments.reduce((acc, curr) => {
      const date = curr.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + curr.amount;
      return acc;
    }, {});

    res.json({ success: true, dailyRevenue });
  } catch (error) {
    console.error('STATS_ERROR:', error);
    res.status(500).json({ message: 'Intelligence aggregation failure' });
  }
};

module.exports = { fakeProcessPayment, getUserPayments, getInstructorPayments, getPaymentStats };
