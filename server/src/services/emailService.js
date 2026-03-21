const { Resend } = require('resend');
const nodemailer = require('nodemailer');

/**
 * High-Fidelity Communication Engine
 * Architected for the Learnova network to deliver trust-certified settlement alerts.
 */

// Production-grade API clients
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Multi-Protocol Dispatcher: Prefers Resend API, fallbacks to Nodemailer SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Dispatches a high-fidelity 'Acquisition Captured' receipt to the learner.
 */
const sendAcquisitionReceipt = async (learner, payment, course) => {
  const subject = `📥 Acquisition Finalized: Your Link to ${course.title} is Ready`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 60px 20px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 48px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
              
              <!-- Premium Hero Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #714B67 0%, #017E84 100%); padding: 60px 40px; text-align: center;">
                  <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 24px; margin: 0 auto 32px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3); font-size: 32px;">💎</div>
                  <h1 style="color: #ffffff; font-family: 'Sora', sans-serif; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -1px;">Acquisition Captured</h1>
                  <p style="color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 600; margin-top: 12px; text-transform: uppercase; letter-spacing: 2px;">Identity Verified • Settlement Sync Flow Complete</p>
                </td>
              </tr>

              <!-- Course Insight -->
              <tr>
                <td style="padding: 40px;">
                  <div style="border-radius: 32px; background-color: #F1F5F9; border: 1px solid #E2E8F0; overflow: hidden; margin-bottom: 40px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="120" style="padding: 24px 0 24px 24px;">
                          <div style="width: 120px; height: 120px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0;">
                            <img src="${course.coverImage || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200'}" width="120" height="120" style="object-fit: cover; display: block;" />
                          </div>
                        </td>
                        <td style="padding: 24px 32px;">
                          <p style="color: #3395FF; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2.5px; margin: 0 0 8px 0;">Premium Curriculum</p>
                          <h2 style="color: #0F172A; font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; margin: 0 0 12px 0; line-height: 1.2;">${course.title}</h2>
                          <div style="display: flex; align-items: center; gap: 8px;">
                             <span style="background: #ffffff; color: #64748B; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 8px; border: 1px solid #E2E8F0; text-transform: uppercase;">By ${course.instructor?.name || 'Authorized Lead'}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Settlement Intelligence -->
                  <div style="margin-bottom: 40px; border-top: 2px solid #F1F5F9; padding-top: 40px;">
                    <h3 style="color: #1E293B; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 24px 0;">Acquisition Audit Trail</h3>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="color: #64748B; font-size: 14px; font-weight: 500; padding-bottom: 16px;">Order Discovery ID</td>
                        <td align="right" style="color: #0F172A; font-family: monospace; font-size: 14px; font-weight: 800; padding-bottom: 16px;">${payment.orderId.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748B; font-size: 14px; font-weight: 500; padding-bottom: 16px;">Capture Protocol</td>
                        <td align="right" style="color: #0F172A; font-size: 13px; font-weight: 900; padding-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">${payment.method}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748B; font-size: 14px; font-weight: 500; padding-bottom: 16px;">Synchronized Timestamp</td>
                        <td align="right" style="color: #0F172A; font-size: 13px; font-weight: 800; padding-bottom: 16px;">${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #0F172A; border-radius: 20px; padding: 24px; color: #ffffff; margin-top: 12px;">
                       <table width="100%" border="0" cellspacing="0" cellpadding="0">
                         <tr>
                           <td style="color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Total Captured Settlement</td>
                           <td align="right" style="color: #ffffff; font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800;">₹${payment.amount.toLocaleString()}</td>
                         </tr>
                       </table>
                    </div>
                  </div>

                  <!-- Verification Badge -->
                  <div style="text-align: center; margin-bottom: 40px;">
                     <div style="display: inline-flex; align-items: center; gap: 8px; background: #ECFDF5; border: 1px solid #10B981; padding: 8px 20px; border-radius: 100px;">
                        <span style="color: #059669; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Verified Mastery Link Synchronized</span>
                     </div>
                  </div>

                  <!-- Massive CTA -->
                  <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/courses/${course.id}" style="display: block; background: #0F172A; color: #ffffff; padding: 24px; border-radius: 20px; font-size: 14px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">Finalize Evolution Link ➔</a>
                    <p style="color: #94A3B8; font-size: 11px; font-weight: 600; margin-top: 24px;">Secured by Learnova synchronized ledger • 100% Data Integrity</p>
                  </div>
                </td>
              </tr>

              <!-- Footer Global Insights -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 40px; text-align: center;">
                  <div style="margin-bottom: 24px;">
                     <span style="color: #64748B; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 3px;">Learnova Ecosystem</span>
                  </div>
                  <p style="color: #94A3B8; font-size: 11px; line-height: 1.8; margin: 0 0 24px 0;">
                    You are receiving this intelligence alert because an acquisition was captured under your verified identity link. If this wasn't you, please bypass system immediately.
                  </p>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <table border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding: 0 12px;"><a href="#" style="color: #64748B; text-decoration: none; font-size: 10px; font-weight: 800; text-transform: uppercase;">Privacy Station</a></td>
                            <td style="padding: 0 12px;"><a href="#" style="color: #64748B; text-decoration: none; font-size: 10px; font-weight: 800; text-transform: uppercase;">Audit Logs</a></td>
                            <td style="padding: 0 12px;"><a href="#" style="color: #64748B; text-decoration: none; font-size: 10px; font-weight: 800; text-transform: uppercase;">Support Hub</a></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    if (resend) {
      await resend.emails.send({ from: 'Learnova <onboarding@resend.dev>', to: learner.email, subject, html });
      console.log(`[RESEND API] Premium Receipt dispatched for ${learner.email}`);
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({ from: `"Learnova Station" <${process.env.EMAIL_USER}>`, to: learner.email, subject, html });
      console.log(`[SMTP MAIL] Premium Receipt dispatched for ${learner.email}`);
    } else {
      console.log(`[VIRTUAL MAIL] Premium Acquisition Alert for ${learner.email}: Captured ${course.title}`);
    }
  } catch (err) {
    console.error(`[COMMUNICATION FAILURE] Discovery path collapsed: ${err.message}`);
  }
};

/**
 * Dispatches a high-fidelity 'Revenue Intelligence' alert to the instructor.
 */
const sendRevenueAlert = async (instructor, learner, payment, course) => {
  const subject = `💰 Revenue Intelligence: ₹${payment.amount} Settlement Captured`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 60px 20px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 48px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
              
              <!-- Revenue Hero Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #017E84 0%, #064E3B 100%); padding: 60px 40px; text-align: center;">
                  <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 24px; margin: 0 auto 32px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3); font-size: 32px;">📈</div>
                  <h1 style="color: #ffffff; font-family: 'Sora', sans-serif; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -1px;">Revenue Captured</h1>
                  <p style="color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 600; margin-top: 12px; text-transform: uppercase; letter-spacing: 2px;">Curriculum Asset Performance Update</p>
                </td>
              </tr>

              <!-- Learner Discovery -->
              <tr>
                <td style="padding: 40px;">
                  <div style="background-color: #F8FAFC; border-radius: 32px; padding: 32px; border: 1px solid #E2E8F0; margin-bottom: 40px; text-align: center;">
                    <p style="color: #64748B; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">New Learner Identified</p>
                    <h2 style="color: #0F172A; font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800; margin: 0 0 8px 0;">${learner.name}</h2>
                    <p style="color: #017E84; font-size: 13px; font-weight: 700; margin: 0;">Verified identity linked to your portfolio</p>
                  </div>

                  <!-- Asset Insight -->
                  <div style="margin-bottom: 40px;">
                    <h3 style="color: #1E293B; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 0;">Asset Details</h3>
                    <div style="padding: 20px; border-left: 4px solid #017E84; background-color: #F0FDFA; border-radius: 0 16px 16px 0;">
                       <p style="color: #0F172A; font-weight: 800; font-size: 15px; margin: 0;">${course.title}</p>
                    </div>
                  </div>

                  <!-- Settlement Intelligence -->
                  <div style="background-color: #017E84; border-radius: 24px; padding: 32px; color: #ffffff;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                           <p style="color: rgba(255,255,255,0.6); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Settlement Amount</p>
                           <h4 style="font-family: 'Sora', sans-serif; font-size: 32px; font-weight: 800; margin: 0;">₹${payment.amount.toLocaleString()}</h4>
                        </td>
                        <td align="right">
                           <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px;">💰</div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <p style="color: #94A3B8; font-size: 11px; font-weight: 600; text-align: center; margin-top: 32px;">Acquisition Sync ID: ${payment.id.toUpperCase()}</p>
                  
                  <!-- CTA -->
                  <div style="text-align: center; margin-top: 40px;">
                    <a href="${process.env.FRONTEND_URL}/admin/revenue" style="display: block; background: #017E84; color: #ffffff; padding: 22px; border-radius: 20px; font-size: 14px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 20px 40px rgba(1, 126, 132, 0.2);">Revenue Command Center ➔</a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 40px; text-align: center;">
                   <p style="color: #94A3B8; font-size: 11px; line-height: 1.8; margin: 0;">
                    Automated report dispatched by Learnova Revenue Intelligence Station.
                   </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    if (resend) {
      await resend.emails.send({ from: 'Learnova <onboarding@resend.dev>', to: instructor.email, subject, html });
      console.log(`[RESEND API] Revenue Alert dispatched for ${instructor.email}`);
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({ from: `"Learnova Station" <${process.env.EMAIL_USER}>`, to: instructor.email, subject, html });
      console.log(`[SMTP MAIL] Revenue Alert dispatched for ${instructor.email}`);
    } else {
      console.log(`[VIRTUAL REVENUE] Alert for ${instructor.email}: Student ${learner.name} joined ${course.title}`);
    }
  } catch (err) {
    console.error(`[REVENUE COMMUNICATION FAILURE] Intelligence path collapsed: ${err.message}`);
  }
};

module.exports = { sendAcquisitionReceipt, sendRevenueAlert };
