import { jsPDF } from 'jspdf'

/**
 * Generates a professional certificate matching the Odoo × Gujarat Vidhyapith style.
 */
export const generateCertificate = ({ userName, courseName, instructorName, completionDate, isParticipation = false }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()   // 841.89
  const H = doc.internal.pageSize.getHeight()  // 595.28

  // ─── White Background ────────────────────────────────────────────────────
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, W, H, 'F')

  // ─── Outer border (light gray double frame) ───────────────────────────────
  doc.setDrawColor(180, 190, 200)
  doc.setLineWidth(1.5)
  doc.rect(16, 16, W - 32, H - 32, 'S')
  doc.setLineWidth(0.5)
  doc.rect(22, 22, W - 44, H - 44, 'S')

  // ─── Right Panel — Blue Ribbon banner ─────────────────────────────────────
  const ribbonX = W * 0.62
  const ribbonW = W - ribbonX - 16

  // Blue ribbon background
  doc.setFillColor(200, 215, 230)
  doc.rect(ribbonX, 16, ribbonW, H - 32, 'F')

  // Ribbon vertical stripes for texture
  doc.setFillColor(190, 207, 222)
  for (let i = 0; i < 20; i++) {
    doc.rect(ribbonX + i * 14, 16, 7, H - 32, 'F')
  }

  // "COURSE CERTIFICATE" text top of ribbon
  doc.setTextColor(80, 100, 130)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('COURSE', ribbonX + ribbonW / 2, 80, { align: 'center' })
  doc.text('CERTIFICATE', ribbonX + ribbonW / 2, 96, { align: 'center' })

  // ─── Ribbon circular seal ─────────────────────────────────────────────────
  const sealCX = ribbonX + ribbonW / 2
  const sealCY = H / 2 + 20
  const sealR = 68

  // Outer circle
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(150, 170, 195)
  doc.setLineWidth(2)
  doc.circle(sealCX, sealCY, sealR, 'FD')

  // Inner ring
  doc.setDrawColor(160, 180, 200)
  doc.setLineWidth(1)
  doc.circle(sealCX, sealCY, sealR - 8, 'S')

  // Curved top text "Odoo X Gujarat Vidhyapith"
  doc.setTextColor(70, 90, 120)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  const topText = 'Odoo X Gujarat Vidhyapith'
  const topRadius = sealR - 14
  const topStartAngle = -Math.PI * 0.72
  const topEndAngle = -Math.PI * 0.28
  const chars = topText.split('')
  chars.forEach((ch, i) => {
    const angle = topStartAngle + (topEndAngle - topStartAngle) * (i / (chars.length - 1))
    const cx = sealCX + topRadius * Math.cos(angle)
    const cy = sealCY + topRadius * Math.sin(angle)
    doc.text(ch, cx, cy, { angle: (angle * 180 / Math.PI + 90) % 360, align: 'center' })
  })

  // Curved bottom text "Learnova Platform Platform"
  const bottomText = 'Learnova e-Learning Platform'
  const botRadius = sealR - 14
  const botStartAngle = Math.PI * 0.28
  const botEndAngle = Math.PI * 0.72
  const bchars = bottomText.split('')
  bchars.forEach((ch, i) => {
    const angle = botStartAngle + (botEndAngle - botStartAngle) * (i / (bchars.length - 1))
    const cx = sealCX + botRadius * Math.cos(angle)
    const cy = sealCY + botRadius * Math.sin(angle)
    doc.text(ch, cx, cy, { angle: (angle * 180 / Math.PI - 90 + 360) % 360, align: 'center' })
  })

  // Seal center content
  // Learnova "L" box
  doc.setFillColor(113, 75, 103)
  doc.roundedRect(sealCX - 12, sealCY - 26, 24, 24, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('L', sealCX, sealCY - 9, { align: 'center' })

  doc.setTextColor(70, 90, 120)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('PARTNERSHIP', sealCX, sealCY + 6, { align: 'center' })
  doc.setFontSize(9)
  doc.setTextColor(113, 75, 103)
  doc.text('Learnova', sealCX, sealCY + 20, { align: 'center' })

  // ─── LEFT PANEL — Main Content ────────────────────────────────────────────
  const lPad = 44
  const lRight = ribbonX - 20

  // ── Logo row: "odoo" text + GV crest ─────────────────────────────────────
  // Odoo text logo (colored letters)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  // "o" teal, "d" teal, "o" teal, "o" teal  (simplify as styled text)
  doc.setTextColor(32, 171, 167)  // Odoo teal
  doc.text('odoo', lPad, 78)

  // Separator line
  doc.setDrawColor(160, 160, 160)
  doc.setLineWidth(1)
  doc.line(lPad + 58, 58, lPad + 58, 82)

  // Gujarat Vidhyapith crest (drawn as stylized roundel)
  const crestX = lPad + 76
  const crestY = 68
  doc.setFillColor(120, 80, 40)
  doc.setDrawColor(120, 80, 40)
  doc.setLineWidth(1.5)
  doc.circle(crestX, crestY, 16, 'S')
  doc.setFontSize(5.5)
  doc.setTextColor(120, 80, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('GV', crestX, crestY + 2, { align: 'center' })
  doc.setFontSize(4)
  doc.text('GUJARAT', crestX, crestY + 8, { align: 'center' })
  doc.text('VIDHYAPITH', crestX, crestY + 13, { align: 'center' })

  // ── Main title ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(20)
  doc.setTextColor(40, 40, 50)
  doc.text('Odoo X Gujarat Vidhyapith', lPad, 112)

  // ── Date ──────────────────────────────────────────────────────────────────
  const dateStr = completionDate
    ? new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 120)
  doc.text(dateStr, lPad, 136)

  // ── Student Name ───────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(30, 30, 40)
  doc.text(userName || 'Learner', lPad, 178)

  // ── "has successfully completed" ───────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 100)
  doc.text(isParticipation ? 'has successfully participated in' : 'has successfully completed', lPad, 204)

  // ── Course Name ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(30, 30, 40)
  const courseLines = doc.splitTextToSize(courseName || 'Course Title', lRight - lPad - 10)
  doc.text(courseLines, lPad, 226)

  // ── Body description ────────────────────────────────────────────────────────
  const descY = 226 + courseLines.length * 18 + 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 120)
  const desc = `a professional course completed on the Learnova e-learning platform and\nauthorized and delivered by Odoo in collaboration with Gujarat Vidhyapith.`
  doc.text(desc, lPad, descY)

  // ─── Signature Section ────────────────────────────────────────────────────
  const sigY = H - 110
  const sig1X = lPad
  const sig2X = lPad + 160
  const sig3X = lPad + 340

  const drawSig = (x, sigText, nameLabel, roleLabel) => {
    // Cursive-style signature text
    doc.setFont('helvetica', 'bolditalic')
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 60)
    doc.text(sigText, x, sigY)
    // Line
    doc.setDrawColor(140, 140, 160)
    doc.setLineWidth(0.5)
    doc.line(x, sigY + 6, x + 130, sigY + 6)
    // Labels
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(60, 60, 80)
    doc.text(nameLabel, x, sigY + 20)
    doc.setFontSize(7.5)
    doc.setTextColor(100, 100, 120)
    const roleLines = doc.splitTextToSize(roleLabel, 130)
    doc.text(roleLines, x, sigY + 32)
  }

  drawSig(sig1X, 'Fabien Pinckaers', 'Fabien Pinckaers,', 'CEO, Odoo')
  drawSig(sig2X, 'Gujarat Vidhyapith', '[OFFICIAL NAME],', 'Vice-Chancellor,\nGujarat Vidhyapith')
  drawSig(sig3X, 'Learnova', instructorName || 'Learnova Team', 'Platform Director,\nLearnova')

  // ─── Verification footer ──────────────────────────────────────────────────
  const certId = `LRN-${Date.now().toString(36).toUpperCase()}`
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(130, 130, 150)
  doc.text(`Verify at: learnova.app/verify/${certId}`, ribbonX + 10, H - 48, { align: 'left' })
  doc.text(`Certificate ID: ${certId}`, ribbonX + 10, H - 36, { align: 'left' })
  doc.setFontSize(6)
  const verifyNote = `Odoo, Gujarat Vidhyapith, and Learnova have confirmed the identity\nof this individual and their participation in the course.`
  doc.text(verifyNote, ribbonX + 10, H - 24, { align: 'left' })

  // ─── Save ─────────────────────────────────────────────────────────────────
  const fileName = `Certificate_${(userName || 'Learner').replace(/\s+/g, '_')}_${courseName?.replace(/\s+/g,'_')?.slice(0,20) || 'Course'}.pdf`
  doc.save(fileName)
}
