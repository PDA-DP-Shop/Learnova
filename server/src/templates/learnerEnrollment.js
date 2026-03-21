const learnerEnrollmentTemplate = ({
  learnerName,
  courseName,
  instructorName,
  courseId,
}) => {
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
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F172A,#1E293B);padding:40px;text-align:center;">
              <h1 style="color:#ffffff;font-size:28px;margin:0;font-weight:800;letter-spacing:-0.5px;">🎓 Learnova</h1>
              <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:8px 0 0;">Free Acquisition Link Verified</p>
            </td>
          </tr>

          <!-- WELCOME BADGE -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
               <div style="background:#EEF2FF;width:60px;height:60px;border-radius:20px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;border:1px solid #E0E7FF;">
                  <span style="font-size:30px;">🚀</span>
               </div>
               <h2 style="color:#0F172A;font-size:24px;margin:0 0 8px;font-weight:800;">Welcome to the Course!</h2>
               <p style="color:#64748B;font-size:15px;margin:0;line-height:1.6;">
                  Hi <strong>${learnerName}</strong>, your evolution path has been synchronized. You now have full access to this curriculum.
               </p>
            </td>
          </tr>

          <!-- COURSE INFO -->
          <tr>
            <td style="padding:0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:20px;overflow:hidden;">
                <tr>
                   <td style="padding:30px;border-left:5px solid #6366F1;">
                      <p style="color:#6366F1;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px;">📚 Curriculum Link</p>
                      <h3 style="color:#0F172A;font-size:20px;margin:0 0 5px;font-weight:800;">${courseName}</h3>
                      <p style="color:#64748B;font-size:14px;margin:0;">Instructor: <strong>${instructorName}</strong></p>
                   </td>
                </tr>
                <tr>
                   <td style="background:#F1F5F9;padding:15px 30px;border-top:1px solid #E2E8F0;">
                      <p style="color:#94A3B8;font-size:11px;margin:0;">Enrolled on: ${date} • Status: LIFETIME ACCESS</p>
                   </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/courses/${courseId}"
                 style="display:inline-block;background:#0F172A;color:#ffffff;text-decoration:none;padding:18px 45px;border-radius:15px;font-size:16px;font-weight:700;box-shadow:0 10px 20px rgba(0,0,0,0.15);">
                ✨ Launch My Journey
              </a>
            </td>
          </tr>

          <!-- TIPS SECTION -->
          <tr>
            <td style="padding:0 40px 40px;">
              <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:15px;padding:24px;">
                 <p style="color:#92400E;font-size:14px;margin:0;line-height:1.6;">
                   💡 <strong>Discovery Tip:</strong> Did you know? Students who complete their first lesson within 24 hours are 3x more likely to finish the course!
                 </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#F8FAFC;padding:30px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="color:#94A3B8;font-size:12px;margin:0 0 5px;">Synchronized via Learnova Intelligence Path</p>
              <p style="color:#CBD5E1;font-size:11px;margin:0;">© 2026 Team AntiGravity Hub</p>
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

module.exports = { learnerEnrollmentTemplate };
