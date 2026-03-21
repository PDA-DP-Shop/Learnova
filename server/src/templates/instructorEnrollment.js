const instructorEnrollmentTemplate = ({
  instructorName,
  learnerName,
  learnerEmail,
  courseName,
  amount,
  orderId,
}) => {
  const isPaid = amount > 0;
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
<body style="margin:0;padding:0;background:#0F172A;font-family:Arial,sans-serif;color:#ffffff;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F172A;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#1E293B;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366F1,#4F46E5);padding:40px;text-align:center;">
               <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:900;letter-spacing:1px;">🎓 LEARNOVA</h1>
               <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin-top:10px;">Instructor Revenue Station</p>
            </td>
          </tr>

          <!-- STATUS BANNER -->
          <tr>
             <td style="padding:40px 40px 20px;">
                <div style="background:${isPaid ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)'};border:1px solid ${isPaid ? '#22C55E' : '#6366F1'};border-radius:15px;padding:20px;text-align:center;">
                   <p style="color:${isPaid ? '#4ade80' : '#818cf8'};font-size:18px;font-weight:900;margin:0;">
                      ${isPaid ? '💰 Settlement Link Captured!' : '👥 New Attendee Registered!'}
                   </p>
                </div>
             </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:0 40px 30px;">
               <h2 style="color:#ffffff;font-size:20px;margin:0 0 10px;font-weight:800;">Hi ${instructorName},</h2>
               <p style="color:#94A3B8;font-size:15px;margin:0;line-height:1.6;">
                  Intelligence tokens indicate that a new learner has synchronized with your curriculum. Here are the acquisition metrics:
               </p>
            </td>
          </tr>

          <!-- METRICS GRID -->
          <tr>
             <td style="padding:0 40px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:20px;padding:25px;">
                   <tr>
                      <td style="padding-bottom:20px;">
                         <p style="color:rgba(255,255,255,0.4);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;">Curriculum Path</p>
                         <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0;">${courseName}</p>
                      </td>
                   </tr>
                   <tr>
                      <td style="padding-bottom:20px;width:50%;">
                         <p style="color:rgba(255,255,255,0.4);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;">Learner Discovery</p>
                         <p style="color:#ffffff;font-size:14px;font-weight:700;margin:0;">${learnerName}</p>
                         <p style="color:#6366F1;font-size:12px;margin:3px 0 0;">${learnerEmail}</p>
                      </td>
                   </tr>
                   <tr>
                      <td>
                         <p style="color:rgba(255,255,255,0.4);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;">Settlement Amount</p>
                         <p style="color:${isPaid ? '#22C55E' : '#94A3B8'};font-size:24px;font-weight:900;margin:0;">
                            ${isPaid ? '₹' + amount.toLocaleString() : 'FREE'}
                         </p>
                      </td>
                   </tr>
                </table>
             </td>
          </tr>

          <!-- CTA -->
          <tr>
             <td style="padding:0 40px 40px;text-align:center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/revenue"
                   style="display:inline-block;border:1px solid #6366F1;color:#6366F1;text-decoration:none;padding:15px 35px;border-radius:12px;font-size:14px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">
                   📈 View Settlement Audit
                </a>
             </td>
          </tr>

          <!-- FOOTER -->
          <tr>
             <td style="background:rgba(0,0,0,0.2);padding:25px;text-align:center;">
                <p style="color:rgba(255,255,255,0.2);font-size:10px;margin:0;letter-spacing:1px;">CURRICULUM INTELLIGENCE SYSTEM • ${date}</p>
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

module.exports = { instructorEnrollmentTemplate };
