const learnerPurchaseTemplate = ({
  learnerName,
  courseName,
  instructorName,
  amount,
  orderId,
  courseId,
}) => {
  const basePrice = (amount / 1.18).toFixed(0);
  const gst = (amount - basePrice).toFixed(0);
  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);padding:36px 40px;text-align:center;">
              <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:800;letter-spacing:-0.5px;">
                🎓 Learnova
              </h1>
              <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:6px 0 0;">
                by Team AntiGravity
              </p>
            </td>
          </tr>

          <!-- SUCCESS BADGE -->
          <tr>
            <td style="background:#F0FDF4;padding:28px 40px;text-align:center;border-bottom:2px solid #BBF7D0;">
              <p style="font-size:40px;margin:0;">✅</p>
              <h2 style="color:#15803D;font-size:22px;margin:12px 0 4px;font-weight:700;">
                Payment Successful!
              </h2>
              <p style="color:#166534;font-size:14px;margin:0;">
                Hi <strong>${learnerName}</strong>, you're officially enrolled. Time to start learning!
              </p>
            </td>
          </tr>

          <!-- COURSE CARD -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;border-left:4px solid #6366F1;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#6366F1;font-size:11px;font-weight:700;text-transform:uppercase;
                               letter-spacing:1.2px;margin:0 0 6px;">📚 Course Enrolled</p>
                    <h3 style="color:#0F172A;font-size:18px;font-weight:700;margin:0 0 4px;">
                      ${courseName}
                    </h3>
                    <p style="color:#64748B;font-size:13px;margin:0;">
                      Instructor: <strong>${instructorName}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ORDER DETAILS -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="color:#0F172A;font-size:13px;font-weight:700;text-transform:uppercase;
                         letter-spacing:0.8px;margin:0 0 14px;border-bottom:1px solid #F1F5F9;padding-bottom:10px;">
                🧾 Order Summary
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px dashed #E2E8F0;">
                    <span style="color:#64748B;font-size:13px;">Order ID</span>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px dashed #E2E8F0;text-align:right;">
                    <span style="color:#0F172A;font-size:13px;font-weight:600;font-family:monospace;">
                      ${orderId}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px dashed #E2E8F0;">
                    <span style="color:#64748B;font-size:13px;">Date</span>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px dashed #E2E8F0;text-align:right;">
                    <span style="color:#0F172A;font-size:13px;">${date}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px dashed #E2E8F0;">
                    <span style="color:#64748B;font-size:13px;">Course Price</span>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px dashed #E2E8F0;text-align:right;">
                    <span style="color:#0F172A;font-size:13px;">₹${basePrice}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px dashed #E2E8F0;">
                    <span style="color:#64748B;font-size:13px;">GST (18%)</span>
                  </td>
                  <td style="padding:8px 0;border-bottom:1px dashed #E2E8F0;text-align:right;">
                    <span style="color:#0F172A;font-size:13px;">₹${gst}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0 0;">
                    <span style="color:#0F172A;font-size:15px;font-weight:700;">Total Paid</span>
                  </td>
                  <td style="padding:14px 0 0;text-align:right;">
                    <span style="color:#6366F1;font-size:20px;font-weight:800;">₹${amount}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/courses/${courseId}"
                 style="display:inline-block;background:linear-gradient(135deg,#6366F1,#4F46E5);
                        color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:10px;
                        font-size:15px;font-weight:700;letter-spacing:0.3px;">
                🚀 Start Learning Now
              </a>
              <p style="color:#94A3B8;font-size:12px;margin:14px 0 0;">
                ♾️ Lifetime access • 📱 Learn anywhere • 🏆 Earn badges
              </p>
            </td>
          </tr>

          <!-- WHAT'S NEXT -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#EFF6FF;border-radius:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#1D4ED8;font-size:13px;font-weight:700;margin:0 0 10px;">
                      📌 What happens next?
                    </p>
                    <p style="color:#1E40AF;font-size:13px;margin:0 0 6px;">✓ Access all lessons immediately</p>
                    <p style="color:#1E40AF;font-size:13px;margin:0 0 6px;">✓ Attempt quizzes and earn points</p>
                    <p style="color:#1E40AF;font-size:13px;margin:0 0 6px;">✓ Unlock achievement badges</p>
                    <p style="color:#1E40AF;font-size:13px;margin:0;">✓ Get a completion certificate when done</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#F8FAFC;padding:20px 40px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="color:#94A3B8;font-size:12px;margin:0 0 4px;">
                This email was sent from <a href="mailto:${process.env.GMAIL_USER || 'devanshpatel12022005@gmail.com'}"
                style="color:#6366F1;text-decoration:none;">${process.env.GMAIL_USER || 'devanshpatel12022005@gmail.com'}</a>
              </p>
              <p style="color:#CBD5E1;font-size:11px;margin:0;">
                © 2026 Learnova · Team AntiGravity · All rights reserved.
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
};

module.exports = { learnerPurchaseTemplate };
