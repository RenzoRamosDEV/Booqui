// Plantilla para geenerar la entrada en pdf
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const LOGO_PATH = '/src/assets/logo_entrada.png' // Mismo logo que en checkout

function c(r, g, b) { return rgb(r / 255, g / 255, b / 255) }

function roundRect(page, x, y, w, h, r, color, opacity) {
  const p = [
    `M ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y} Z`,
  ].join(' ')
  const opts = { x: 0, y: 0, color, borderWidth: 0 }
  if (opacity !== undefined) opts.opacity = opacity
  page.drawSvgPath(p, opts)
}

function drawQR(page, x, y, size, seed) {
  const N = 21
  const cell = size / N
  const INK = c(26, 26, 26)
  const BG = rgb(1, 1, 1)

  page.drawRectangle({ x, y: y - size, width: size, height: size, color: BG })

  const inCorner = (row, col) => {
    const b = (r0, c0) => row >= r0 && row <= r0 + 6 && col >= c0 && col <= c0 + 6
    return b(0, 0) || b(0, 14) || b(14, 0)
  }

  const putCell = (row, col) => {
    page.drawRectangle({
      x: x + col * cell,
      y: y - size + (N - 1 - row) * cell,
      width: cell + 0.4,
      height: cell + 0.4,
      color: INK,
    })
  }

  const corner = (r0, c0) => {
    for (let dr = 0; dr <= 6; dr++) for (let dc = 0; dc <= 6; dc++) {
      const outer = dr === 0 || dr === 6 || dc === 0 || dc === 6
      const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
      if (outer || inner) putCell(r0 + dr, c0 + dc)
    }
  }
  corner(0, 0); corner(0, 14); corner(14, 0)

  for (let i = 8; i <= 12; i++) {
    if (i % 2 === 0) { putCell(6, i); putCell(i, 6) }
  }

  let s = seed >>> 0
  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      if (inCorner(row, col)) continue
      if (row === 6 || col === 6) continue
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0
      if ((s & 0xff) > 127) putCell(row, col)
    }
  }
}

export async function generateTicketPDF({ bookingId, paymentId, items, user }) {
  const pdfDoc = await PDFDocument.create()
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const reg = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const NEAR_BLACK = c(26, 26, 26)
  const DARK_GREY = c(60, 60, 60)
  const MID_GREY = c(130, 130, 130)
  const LIGHT_GREY = c(220, 220, 218)
  const OFF_WHITE = c(250, 250, 249)
  const WARM_WHITE = c(255, 255, 255)
  const PURPLE = c(109, 40, 217)
  const PURPLE_DEEP = c(22, 8, 52)
  const PURPLE_MID = c(72, 35, 130)
  const PURPLE_LIGHT = c(245, 240, 255)
  const PURPLE_TEXT = c(124, 58, 237)
  const WHITE = rgb(1, 1, 1)

  const W = 720, H = 270, R = 16
  const SPLIT = 520
  const STUB_W = W - SPLIT

  for (let ticketIndex = 0; ticketIndex < items.length; ticketIndex++) {
    const item = items[ticketIndex]
    const page = pdfDoc.addPage([W, H])

    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: c(255, 255, 255) })
    roundRect(page, 0, 0, SPLIT, H, R, WARM_WHITE)

    const STRIPE_W = 6
    page.drawRectangle({ x: 0, y: R, width: STRIPE_W, height: H - R * 2, color: PURPLE })
    page.drawRectangle({ x: 0, y: 0, width: R, height: R, color: OFF_WHITE })
    roundRect(page, 0, 0, R * 2, R * 2, R, WARM_WHITE)
    page.drawRectangle({ x: 0, y: H - R, width: R, height: R, color: OFF_WHITE })
    roundRect(page, 0, H - R * 2, R * 2, R * 2, R, WARM_WHITE)

    const IMG_START = SPLIT
    const LOGO_Y = H - 42

    // LOGO - EXACTAMENTE IGUAL QUE EN CHECKOUT
    let logoOk = false
    try {
      const res = await fetch(LOGO_PATH)
      if (res.ok) {
        const bytes = await res.arrayBuffer()
        const img = await pdfDoc.embedPng(bytes)
        const lh = 22
        const lw = img.width * (lh / img.height)
        page.drawImage(img, { x: STRIPE_W + 14, y: LOGO_Y + 4, width: lw, height: lh })
        logoOk = true
      }
    } catch (err) {
      console.log('Error cargando logo:', err)
    }
    if (!logoOk) {
      page.drawRectangle({ x: STRIPE_W + 14, y: LOGO_Y + 8, width: 16, height: 11, color: PURPLE, opacity: 0.15 })
      page.drawRectangle({ x: STRIPE_W + 14, y: LOGO_Y + 11, width: 16, height: 4, color: PURPLE, opacity: 0.2 })
      page.drawText('booqi', { x: STRIPE_W + 34, y: LOGO_Y + 10, size: 16, font: bold, color: PURPLE })
    }

    const HDR_SEP = H - 52
    page.drawRectangle({ x: STRIPE_W + 14, y: HDR_SEP, width: IMG_START - STRIPE_W - 28, height: 0.8, color: LIGHT_GREY })

    const titleRaw = item.title || 'Evento'
    const tSize = titleRaw.length > 40 ? 11 : titleRaw.length > 28 ? 13.5 : titleRaw.length > 18 ? 16 : 19
    const TITLE_Y = HDR_SEP - 22
    page.drawText(titleRaw.toUpperCase(), {
      x: STRIPE_W + 14,
      y: TITLE_Y,
      size: tSize,
      font: bold,
      color: NEAR_BLACK,
      maxWidth: IMG_START - STRIPE_W - 30,
    })

    const rawDate = item.startDate ? new Date(item.startDate) : new Date()
    const dateStr = rawDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).replace(/^\w/, ch => ch.toUpperCase())
    const timeStr = rawDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    const META_Y = TITLE_Y - 16
    page.drawText(`${dateStr}  -  ${timeStr}`, {
      x: STRIPE_W + 14,
      y: META_Y,
      size: 8,
      font: bold,
      color: DARK_GREY,
      maxWidth: IMG_START - STRIPE_W - 30,
    })
    if (item.location) {
      page.drawText(item.location, {
        x: STRIPE_W + 14,
        y: META_Y - 13,
        size: 7.5,
        font: reg,
        color: MID_GREY,
        maxWidth: IMG_START - STRIPE_W - 30,
      })
    }

    const MID_SEP = item.location ? META_Y - 28 : META_Y - 18
    page.drawRectangle({ x: STRIPE_W + 14, y: MID_SEP, width: IMG_START - STRIPE_W - 28, height: 0.8, color: LIGHT_GREY })

    const unitStr = (item.price || 0).toFixed(2)
    const totStr = (item.price || 0).toFixed(2)

    const COL1_X = STRIPE_W + 14
    const COL2_X = COL1_X + 120
    const COL3_X = COL2_X + 90
    const DATA_Y = MID_SEP - 14

    page.drawText('TITULAR', { x: COL1_X, y: DATA_Y, size: 5.5, font: bold, color: MID_GREY })
    page.drawText(`${user.firstName || ''} ${user.lastName || ''}`.trim().toUpperCase() || 'COMPRADOR', {
      x: COL1_X,
      y: DATA_Y - 13,
      size: 9.5,
      font: bold,
      color: NEAR_BLACK,
      maxWidth: 100,
    })
    page.drawText(user.contactEmail || '', {
      x: COL1_X,
      y: DATA_Y - 25,
      size: 6.5,
      font: reg,
      color: MID_GREY,
      maxWidth: 100,
    })

    page.drawText('ENTRADA', { x: COL2_X, y: DATA_Y, size: 5.5, font: bold, color: MID_GREY })
    page.drawText(`Entrada ${ticketIndex + 1} de ${items.length}`, {
      x: COL2_X,
      y: DATA_Y - 13,
      size: 8,
      font: bold,
      color: NEAR_BLACK,
    })
    page.drawText(`${unitStr} EUR`, {
      x: COL2_X,
      y: DATA_Y - 25,
      size: 6.5,
      font: reg,
      color: MID_GREY,
    })

    const TOT_BOX_W = 100, TOT_BOX_H = 52
    roundRect(page, COL3_X - 4, DATA_Y - TOT_BOX_H + 6, TOT_BOX_W, TOT_BOX_H, 6, PURPLE_LIGHT)
    page.drawText('TOTAL', { x: COL3_X, y: DATA_Y - 4, size: 5.5, font: bold, color: PURPLE_TEXT })
    page.drawText(`${totStr} EUR`, { x: COL3_X, y: DATA_Y - 19, size: 12, font: bold, color: PURPLE })

    const seatLetter = String.fromCharCode(65 + ((bookingId + ticketIndex) % 26))
    const seatNumber = `${seatLetter}${((bookingId + ticketIndex) % 50) + 1}`
    page.drawText('ASIENTO', { x: COL3_X, y: DATA_Y - 34, size: 5, font: bold, color: PURPLE_TEXT })
    page.drawText(seatNumber, { x: COL3_X + 45, y: DATA_Y - 34, size: 9, font: bold, color: PURPLE })

    const BOT_SEP = DATA_Y - TOT_BOX_H - 2
    page.drawRectangle({ x: STRIPE_W + 14, y: BOT_SEP, width: IMG_START - STRIPE_W - 28, height: 0.8, color: LIGHT_GREY })

    const PILL_Y = 14, PILL_H = BOT_SEP - 24
    const drawInfoPill = (px, label, value) => {
      const pw = 110
      page.drawRectangle({ x: px, y: PILL_Y, width: pw, height: PILL_H, color: c(245, 245, 244) })
      page.drawRectangle({ x: px, y: PILL_Y + PILL_H - 3, width: pw, height: 3, color: PURPLE })
      page.drawText(label, { x: px + 8, y: PILL_Y + PILL_H - 12, size: 5.5, font: bold, color: MID_GREY })
      page.drawText(value, { x: px + 8, y: PILL_Y + 4, size: 9, font: bold, color: NEAR_BLACK })
    }
    drawInfoPill(STRIPE_W + 14, 'N. DE RESERVA', `#${String(bookingId).padStart(8, '0')}`)
    drawInfoPill(STRIPE_W + 130, 'ID DE PAGO', `#${String(paymentId).padStart(8, '0')}`)

    page.drawRectangle({ x: SPLIT - R, y: 0, width: R, height: R, color: OFF_WHITE })
    roundRect(page, SPLIT - R * 2, 0, R * 2, R * 2, R, WARM_WHITE)

    page.drawCircle({ x: SPLIT, y: H + 2, size: 12, color: OFF_WHITE })
    page.drawCircle({ x: SPLIT, y: -2, size: 12, color: OFF_WHITE })
    for (let yy = 16; yy < H - 16; yy += 11) {
      page.drawLine({
        start: { x: SPLIT, y: yy },
        end: { x: SPLIT, y: yy + 5.5 },
        thickness: 1.5,
        color: LIGHT_GREY,
        opacity: 0.8,
      })
    }

    roundRect(page, SPLIT, 0, STUB_W, H, R, PURPLE_DEEP)
    const GS = 30
    for (let i = 0; i < GS; i++) {
      const t = i / GS
      const rr = Math.round(22 + (45 - 22) * t)
      const gg = Math.round(8 + (27 - 8) * t)
      const bb = Math.round(52 + (78 - 52) * t)
      page.drawRectangle({
        x: SPLIT,
        y: i * (H / GS),
        width: STUB_W,
        height: H / GS + 1,
        color: c(rr, gg, bb),
      })
    }
    page.drawRectangle({ x: W - R, y: H - R, width: R, height: R, color: OFF_WHITE })
    roundRect(page, W - R * 2, H - R * 2, R * 2, R * 2, R, c(45, 27, 78))
    page.drawRectangle({ x: W - R, y: 0, width: R, height: R, color: OFF_WHITE })
    roundRect(page, W - R * 2, 0, R * 2, R * 2, R, PURPLE_DEEP)

    const SCX = SPLIT + STUB_W / 2
    const STUB_LOGO_Y = H - 36
    page.drawText('booqi', {
      x: SCX - bold.widthOfTextAtSize('booqi', 14) / 2,
      y: STUB_LOGO_Y,
      size: 14,
      font: bold,
      color: WHITE,
    })
    page.drawRectangle({ x: SCX - 22, y: STUB_LOGO_Y - 6, width: 44, height: 1.5, color: PURPLE, opacity: 0.7 })

    page.drawCircle({ x: SCX, y: H * 0.43, size: 72, color: PURPLE_MID, opacity: 0.18 })
    page.drawCircle({ x: SCX, y: H * 0.43, size: 52, color: PURPLE_MID, opacity: 0.14 })

    const QR_SIZE = 96
    const QR_X = SPLIT + (STUB_W - QR_SIZE) / 2
    const QR_TOP = H - 50

    page.drawRectangle({ x: QR_X - 8, y: QR_TOP - QR_SIZE - 8, width: QR_SIZE + 16, height: QR_SIZE + 16, color: PURPLE_MID, opacity: 0.3 })
    page.drawRectangle({ x: QR_X - 5, y: QR_TOP - QR_SIZE - 5, width: QR_SIZE + 10, height: QR_SIZE + 10, color: WHITE })
    drawQR(page, QR_X, QR_TOP, QR_SIZE, (bookingId * 31 + paymentId + ticketIndex))

    const refVal = `#${String(bookingId).padStart(8, '0')}`
    const rvW = bold.widthOfTextAtSize(refVal, 8)
    const refLbl = 'N. DE RESERVA'
    const rlW = reg.widthOfTextAtSize(refLbl, 6)

    page.drawText(refLbl, { x: SCX - rlW / 2, y: QR_TOP - QR_SIZE - 20, size: 6, font: reg, color: c(150, 120, 200) })
    page.drawText(refVal, { x: SCX - rvW / 2, y: QR_TOP - QR_SIZE - 32, size: 8, font: bold, color: WHITE })

    page.drawRectangle({ x: SPLIT, y: 0, width: STUB_W, height: 22, color: PURPLE, opacity: 0.25 })
    const footTxt = 'CONSERVE ESTA ENTRADA'
    const ftW = reg.widthOfTextAtSize(footTxt, 5.5)
    page.drawText(footTxt, { x: SCX - ftW / 2, y: 7.5, size: 5.5, font: reg, color: c(180, 150, 230) })
  }

  return await pdfDoc.save()
}

export function downloadPDF(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}