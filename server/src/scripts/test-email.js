require('dotenv').config();
const { Resend } = require('resend');
const nodemailer = require('nodemailer');

/**
 * 🛠️ PERFORMANCE DIAGNOSTIC: Email Discovery Path
 * Run: node src/scripts/test-email.js
 */

const testEmail = async () => {
  console.log('🚀 INITIALIZING COMMUNICATION DIAGNOSTIC...');
  
  const targetEmail = 'YOUR_EMAIL_HERE'; // CHANGE THIS TO YOUR EMAIL
  const resendKey = process.env.RESEND_API_KEY;
  const smtpUser = process.env.EMAIL_USER;
  const smtpPass = process.env.EMAIL_PASS;

  console.log('--- CONTEXT ---');
  console.log('RESEND_API_KEY:', resendKey ? '✅ DETECTED' : '❌ MISSING');
  console.log('EMAIL_USER:', smtpUser ? '✅ DETECTED' : '❌ MISSING');
  console.log('EMAIL_PASS:', smtpPass ? '✅ DETECTED' : '❌ MISSING');
  console.log('----------------\n');

  if (resendKey) {
    console.log('📡 ATTEMPTING RESEND DISCOVERY...');
    const resend = new Resend(resendKey);
    try {
      const { data, error } = await resend.emails.send({
        from: 'Learnova <onboarding@resend.dev>',
        to: targetEmail,
        subject: '🧪 DIAGNOSTIC: Resend Discovery Path',
        html: '<strong>Success!</strong> Your Resend API is synchronized with the Learnova network.'
      });
      if (error) throw error;
      console.log('✅ RESEND SUCCESS:', data.id);
    } catch (err) {
      console.error('❌ RESEND COLLAPSED:', err.message);
      console.log('💡 TIP: On the Resend FREE TIER, you can ONLY send to the email you signed up with!');
    }
  }

  if (smtpUser && smtpPass) {
    console.log('\n📡 ATTEMPTING SMTP DISCOVERY (GMAIL)...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass }
    });
    try {
      await transporter.sendMail({
        from: `"Learnova Diagnostic" <${smtpUser}>`,
        to: targetEmail,
        subject: '🧪 DIAGNOSTIC: SMTP Discovery Path',
        text: 'Success! Your Gmail SMTP is synchronized.'
      });
      console.log('✅ SMTP SUCCESS');
    } catch (err) {
      console.error('❌ SMTP COLLAPSED:', err.message);
      console.log('💡 TIP: You MUST use a "Gmail App Password", not your regular password!');
    }
  }
};

testEmail();
