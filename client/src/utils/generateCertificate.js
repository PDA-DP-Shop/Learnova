import { jsPDF } from 'jspdf'

/**
 * Generates a premium PDF certificate of completion.
 * @param {Object} opts
 * @param {string} opts.userName  - Full name of the learner
 * @param {string} opts.courseName - Title of the completed course
 * @param {string} opts.instructorName - Instructor's name
 * @param {string} [opts.completionDate] - ISO date string (defaults to today)
 * @param {boolean} [opts.isParticipation] - If true, issues "Participation" cert instead of "Completion"
 */
export const generateCertificate = ({ userName, courseName, instructorName, completionDate, isParticipation = false }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // ─── Background ──────────────────────────────────────────────────────────
  doc.setFillColor(250, 248, 255) // near-white with a light purple tint
  doc.rect(0, 0, W, H, 'F')

  // Corner gradient-like accents (simulated with overlapping semi-transparent rects)
  doc.setFillColor(113, 75, 103) // #714B67
  doc.setGState(doc.GState({ opacity: 0.08 }))
  doc.ellipse(0, 0, 180, 180, 'F')
  doc.ellipse(W, H, 180, 180, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))

  // ─── Outer Border (double line) ───────────────────────────────────────────
  doc.setDrawColor(113, 75, 103)
  doc.setLineWidth(3)
  doc.roundedRect(28, 28, W - 56, H - 56, 16, 16, 'S')
  doc.setLineWidth(1)
  doc.setDrawColor(1, 126, 132) // #017E84
  doc.roundedRect(36, 36, W - 72, H - 72, 12, 12, 'S')

  // ─── Top Brand Strip ──────────────────────────────────────────────────────
  doc.setFillColor(113, 75, 103)
  doc.roundedRect(28, 28, W - 56, 52, 16, 16, 'F')
  doc.setFillColor(113, 75, 103)
  doc.rect(28, 60, W - 56, 20, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('LEARNOVA  ·  MASTERY PLATFORM', W / 2, 55, { align: 'center' })

  // Co-branding: Odoo x Gujarat Vidhyapith
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.7 }))
  doc.text('In partnership with  Odoo  ×  Gujarat Vidhyapith', W / 2, 68, { align: 'center' })
  doc.setGState(doc.GState({ opacity: 1 }))

  // ─── Certificate Type Label ───────────────────────────────────────────────
  const certLabel = isParticipation ? 'Certificate of Participation' : 'Certificate of Completion'
  doc.setTextColor(113, 75, 103)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('THIS IS TO CERTIFY THAT', W / 2, 122, { align: 'center' })

  // ─── Recipient Name ───────────────────────────────────────────────────────
  doc.setTextColor(30, 30, 40)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(42)
  doc.text(userName || 'Learner', W / 2, 176, { align: 'center' })

  // Underline below name
  const nameWidth = doc.getTextWidth(userName || 'Learner')
  doc.setDrawColor(1, 126, 132)
  doc.setLineWidth(1.5)
  doc.line(W / 2 - nameWidth / 2, 182, W / 2 + nameWidth / 2, 182)

  // ─── Body Text ────────────────────────────────────────────────────────────
  doc.setTextColor(80, 80, 100)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text('has successfully demonstrated outstanding dedication and mastery in completing', W / 2, 212, { align: 'center' })

  // ─── Course Name ──────────────────────────────────────────────────────────
  doc.setTextColor(113, 75, 103)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)

  // Handle long course names (wrap at ~50 chars)
  const maxCourseWidth = W - 200
  const courseLines = doc.splitTextToSize(courseName || 'Course', maxCourseWidth)
  let courseY = 254
  courseLines.forEach(line => {
    doc.text(line, W / 2, courseY, { align: 'center' })
    courseY += 34
  })

  // ─── Cert Type Badge ──────────────────────────────────────────────────────
  const badgeY = courseY + 16
  doc.setFillColor(1, 126, 132)
  doc.setGState(doc.GState({ opacity: 0.10 }))
  doc.roundedRect(W / 2 - 110, badgeY - 17, 220, 28, 8, 8, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))
  doc.setTextColor(1, 126, 132)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(certLabel.toUpperCase(), W / 2, badgeY, { align: 'center' })

  // ─── Date & Instructor Row ────────────────────────────────────────────────
  const dateStr = completionDate
    ? new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const sigY = H - 100

  // Left: Date
  doc.setDrawColor(200, 200, 210)
  doc.setLineWidth(0.8)
  doc.line(60, sigY, 220, sigY)
  doc.setTextColor(50, 50, 70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(dateStr, 140, sigY + 16, { align: 'center' })
  doc.setTextColor(140, 140, 160)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('DATE OF COMPLETION', 140, sigY + 30, { align: 'center' })

  // Center: Learnova seal (circle)
  const sealX = W / 2
  const sealY = sigY - 10
  doc.setDrawColor(113, 75, 103)
  doc.setFillColor(113, 75, 103)
  doc.setGState(doc.GState({ opacity: 0.08 }))
  doc.circle(sealX, sealY, 36, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))
  doc.setLineWidth(2)
  doc.circle(sealX, sealY, 36, 'S')
  doc.setLineWidth(1)
  doc.circle(sealX, sealY, 30, 'S')
  doc.setTextColor(113, 75, 103)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('LEARNOVA', sealX, sealY - 6, { align: 'center' })
  doc.text('CERTIFIED', sealX, sealY + 4, { align: 'center' })
  doc.setFontSize(6)
  doc.text('✦', sealX, sealY + 14, { align: 'center' })

  // Right: Instructor
  doc.setDrawColor(200, 200, 210)
  doc.setLineWidth(0.8)
  doc.line(W - 220, sigY, W - 60, sigY)
  doc.setTextColor(50, 50, 70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(instructorName || 'Learnova Team', W - 140, sigY + 16, { align: 'center' })
  doc.setTextColor(140, 140, 160)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('COURSE INSTRUCTOR', W - 140, sigY + 30, { align: 'center' })

  // ─── Certificate ID footer ────────────────────────────────────────────────
  const certId = `LRN-${Date.now().toString(36).toUpperCase()}`
  doc.setTextColor(180, 180, 200)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`Certificate ID: ${certId}  ·  Issued by Learnova · learnova.app`, W / 2, H - 40, { align: 'center' })

  // ─── Save ─────────────────────────────────────────────────────────────────
  const fileName = `Learnova_Certificate_${(userName || 'Learner').replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}
