const express = require('express');
const router = express.Router();
const { sendLearnerPurchaseEmail } = require('../utils/email');
const { 
  fakeProcessPayment, 
  getUserPayments, 
  getInstructorPayments, 
  getPaymentStats 
} = require('../controllers/paymentController');
const authenticate = require('../middleware/auth');

// Simulated high-fidelity payment flow
router.post('/fake-process', authenticate, fakeProcessPayment);

// Ledger Discovery: Retrieve personal settlement history
router.get('/my-history', authenticate, getUserPayments);

// Revenue Intelligence: Retrieve instructor-specific acquisition records
router.get('/instructor/history', authenticate, getInstructorPayments);
router.get('/instructor/stats', authenticate, getPaymentStats);
// Public Diagnostic Discovery: Verify communication hub status via browser
router.get('/test-email', async (req, res) => {
  try {
    const target = req.query.to || process.env.GMAIL_USER;
    
    if (!target) {
      return res.status(400).json({ error: 'Please provide a destination email: /test-email?to=your@email.com' });
    }

    await sendLearnerPurchaseEmail({
      learnerEmail: target,
      learnerName: 'Diagnostic Discovery Lead',
      courseName: 'System Diagnostic Protocol',
      instructorName: 'Learnova AntiGravity Hub',
      amount: 0,
      orderId: 'DIAG-LINK-' + Math.floor(1000 + Math.random() * 9000),
      courseId: 'system-discovery'
    });

    res.json({ 
      success: true, 
      message: `✅ Intelligence token dispatched to ${target}! Check your Gmail inbox and Spam folder.`,
      tip: 'If using Gmail, ensure you are using a 16-character "App Password", not your regular password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
