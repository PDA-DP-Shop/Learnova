const nodemailer = require('nodemailer');
const { learnerPurchaseTemplate } = require('../templates/learnerPurchase');
const { learnerEnrollmentTemplate } = require('../templates/learnerEnrollment');
const { instructorEnrollmentTemplate } = require('../templates/instructorEnrollment');

/**
 * Global Communication Protocol Station (Gmail Discovery)
 * Architected for the Learnova network to deliver trust-certified alerts.
 */

// Create Gmail transporter with discovery logic
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // 16-character App Password
  },
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.warn('⚠️ Communication Handshake delayed. Check GMAIL keys.');
  } else {
    console.log('✅ Learnova Communication Station ready for discovery');
  }
});

const EMAIL_FROM = process.env.EMAIL_FROM || `Learnova <${process.env.GMAIL_USER}>`;

// ─── 1. PAID: Settlement Discovery (Learner) ───────────────────────────────────
const sendLearnerPurchaseEmail = async ({ learnerEmail, learnerName, courseName, instructorName, amount, orderId, courseId }) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: learnerEmail,
      subject: `🎓 You're enrolled in "${courseName}" — Learnova`,
      html: learnerPurchaseTemplate({ learnerName, courseName, instructorName, amount, orderId, courseId }),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP_SETTLEMENT] Paid Receipt dispatched: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[SMTP_FAILURE] Paid path collapsed: ${err.message}`);
  }
};

// ─── 2. FREE: Acquisition Discovery (Learner) ──────────────────────────────────
const sendLearnerEnrollmentEmail = async ({ learnerEmail, learnerName, courseName, instructorName, courseId }) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: learnerEmail,
      subject: `🚀 Start Learning: "${courseName}" — Learnova`,
      html: learnerEnrollmentTemplate({ learnerName, courseName, instructorName, courseId }),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP_ACQUISITION] Free Enrollment dispatched: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[SMTP_FAILURE] Free path collapsed: ${err.message}`);
  }
};

// ─── 3. ATTENDEES: Enrollment Audit (Instructor) ────────────────────────────────
const sendInstructorEnrollmentEmail = async ({ instructorEmail, instructorName, learnerName, learnerEmail, courseName, amount, orderId }) => {
  try {
    const isPaid = amount > 0;
    const mailOptions = {
      from: EMAIL_FROM,
      to: instructorEmail,
      subject: `${isPaid ? '💰 Settlement Linked' : '👥 New Attendee'} — ${courseName}`,
      html: instructorEnrollmentTemplate({ instructorName, learnerName, learnerEmail, courseName, amount, orderId }),
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP_REVENUE] Instructor Audit dispatched: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[SMTP_FAILURE] Revenue path collapsed: ${err.message}`);
  }
};

module.exports = { 
  sendLearnerPurchaseEmail, 
  sendLearnerEnrollmentEmail, 
  sendInstructorEnrollmentEmail 
};
