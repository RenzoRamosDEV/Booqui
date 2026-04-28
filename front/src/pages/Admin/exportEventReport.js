
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const c = (r, g, b) => rgb(r / 255, g / 255, b / 255)

const COL = {
  primary:      c(124, 58, 237),
  primaryDark:  c(91, 33, 182),
  primaryLight: c(237, 233, 254),
  primaryBg:    c(245, 243, 255),
  textDark:     c(31, 41, 55),
  textMuted:    c(107, 114, 128),
  textLight:    c(156, 163, 175),
  white:        rgb(1, 1, 1),
  whiteOff:     c(250, 250, 250),
  border:       c(229, 231, 235),
  green:        c(16, 185, 129),
  greenBg:      c(236, 253, 245),
  amber:        c(245, 158, 11),
  amberBg:      c(254, 252, 232),
  red:          c(239, 68, 68),
  redBg:        c(254, 242, 242),
}

function roundRect(page, x, y, w, h, r, color) {
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
  page.drawSvgPath(p, { color, borderWidth: 0 })
}

function safe(text) {
  if (text === null || text === undefined) return '-'
  return String(text).replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim() || '-'
}

// Función para ancho max en la columna 
function truncate(text, font, size, maxWidth) {
  const s = safe(text);
  if (font.widthOfTextAtSize(s, size) <= maxWidth) return s;
  let t = s;
  while (t.length > 0 && font.widthOfTextAtSize(t + '...', size) > maxWidth) {
    t = t.slice(0, -1);
  }
  return t.length > 0 ? t + '...' : '-';
}

function statusColor(status) {
  if (!status) return { text: COL.textMuted, bg: COL.whiteOff }
  const s = status.toUpperCase()
  if (s === 'APPROVED' || s === 'CONFIRMED') return { text: COL.green, bg: COL.greenBg }
  if (s === 'REJECTED' || s === 'CANCELLED') return { text: COL.red, bg: COL.redBg }
  return { text: COL.amber, bg: COL.amberBg }
}

function statusLabel(status) {
  if (!status) return '-'
  const s = status.toUpperCase()
  if (s === 'APPROVED') return 'Aprobado'
  if (s === 'REJECTED') return 'Rechazado'
  if (s === 'CONFIRMED') return 'Confirmado'
  if (s === 'CANCELLED') return 'Cancelado'
  if (s === 'PENDING') return 'Pendiente'
  return safe(status)
}

function methodLabel(method) {
  if (!method) return '-'
  const m = method.toUpperCase()
  if (m.includes('CREDIT')) return 'Tarjeta crédito'
  if (m.includes('DEBIT')) return 'Tarjeta débito'
  if (m.includes('PAYPAL')) return 'PayPal'
  return safe(method)
}

function getClientData(sale) {
  let firstName = ''
  let lastName = ''
  let email = ''
  let tickets = 1
  let amount = 0
  
  if (sale.booking) {
    const booking = sale.booking
    firstName = booking.firstName || booking.userFirstName || booking.first_name || ''
    lastName = booking.lastName || booking.userLastName || booking.last_name || ''
    email = booking.email || booking.userEmail || booking.customerEmail || ''
    tickets = sale.ticketQuantity || booking.ticketQuantity || booking.quantity || 1
    amount = sale.totalPrice || booking.totalPrice || sale.amount || 0
  }
  
  if (!firstName && !email) {
    firstName = sale.firstName || sale.userFirstName || sale.first_name || ''
    lastName = sale.lastName || sale.userLastName || sale.last_name || ''
    email = sale.email || sale.userEmail || sale.customerEmail || ''
    tickets = sale.ticketQuantity || sale.quantity || 1
    amount = sale.totalPrice || sale.amount || 0
  }
  
  let fullName = ''
  if (firstName || lastName) {
    fullName = `${firstName} ${lastName}`.trim()
  } else if (email) {
    fullName = email.split('@')[0]
  } else {
    fullName = 'Cliente'
  }
  
  if (typeof tickets === 'string') tickets = parseInt(tickets, 10) || 1
  if (typeof amount === 'string') amount = parseFloat(amount) || 0
  
  return {
    name: fullName,
    email: email || '-',
    tickets: tickets,
    amount: amount
  }
}

// GENERADOR PRINCIPAL 
export async function generateEventReportPDF({
  eventTitle,
  eventId,
  sales,
  generatedBy = 'Administrador',
  logoPath = '/src/assets/logo_entrada.png',
}) {
  const pdfDoc = await PDFDocument.create()
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const reg = await pdfDoc.embedFont(StandardFonts.Helvetica)

  let logoImg = null
  try {
    const res = await fetch(logoPath)
    if (res.ok) {
      const bytes = await res.arrayBuffer()
      logoImg = await pdfDoc.embedPng(bytes)
    }
  } catch {
    // sin logo
  }

  const PW = 842, PH = 595
  const MARGIN = 40
  const HEADER_H = 120
  const FOOTER_H = 50
  const ROW_H = 30
  const TABLE_W = PW - MARGIN * 2

  // Detección automática de si es el informe global
  const isGlobal = eventId === 'GLOBAL' || eventId === '__all__'

  // Columnas dinámicas según si es un evento individual o global
  const COLS = isGlobal ? [
    { label: '#', x: MARGIN, w: 30, align: 'center' },
    { label: 'ID Pago', x: MARGIN + 30, w: 55, align: 'left' },
    { label: 'Evento', x: MARGIN + 85, w: 130, align: 'left' },
    { label: 'Cliente', x: MARGIN + 215, w: 120, align: 'left' },
    { label: 'Email', x: MARGIN + 335, w: 135, align: 'left' },
    { label: 'Tcks', x: MARGIN + 470, w: 40, align: 'center' },
    { label: 'Importe', x: MARGIN + 510, w: 70, align: 'right' },
    { label: 'Método', x: MARGIN + 590, w: 80, align: 'left' },
    { label: 'Estado', x: MARGIN + 670, w: 92, align: 'center' },
  ] : [
    { label: '#', x: MARGIN, w: 30, align: 'center' },
    { label: 'ID Pago', x: MARGIN + 35, w: 70, align: 'left' },
    { label: 'Cliente', x: MARGIN + 110, w: 150, align: 'left' },
    { label: 'Email', x: MARGIN + 265, w: 160, align: 'left' },
    { label: 'Tickets', x: MARGIN + 430, w: 50, align: 'center' },
    { label: 'Importe', x: MARGIN + 485, w: 80, align: 'right' },
    { label: 'Método', x: MARGIN + 570, w: 100, align: 'left' },
    { label: 'Estado', x: MARGIN + 675, w: 87, align: 'center' },
  ]

  let totalAmount = 0
  let totalApproved = 0
  let totalTickets = 0
  let countApproved = 0
  let countRejected = 0
  let countPending = 0
  
  const processedSales = []
  
  for (let idx = 0; idx < sales.length; idx++) {
    const sale = sales[idx]
    const clientData = getClientData(sale)
    
    let payStatus = sale.status || sale.paymentStatus || 'PENDING'
    if (sale.booking && sale.booking.status === 'CONFIRMED') {
      payStatus = 'APPROVED'
    }
    if (sale.booking && sale.booking.paymentStatus) {
      payStatus = sale.booking.paymentStatus
    }
    payStatus = payStatus.toUpperCase()
    
    const amount = clientData.amount
    const ticketsCount = clientData.tickets
    
    totalAmount += amount
    totalTickets += ticketsCount
    
    if (payStatus === 'APPROVED') {
      totalApproved += amount
      countApproved++
    } else if (payStatus === 'REJECTED') {
      countRejected++
    } else {
      countPending++
    }
    
    processedSales.push({
      id: sale.paymentId || sale.id || (sale.booking?.id) || 'N/A',
      eventTitle: sale.booking?.eventTitle || sale.eventTitle || '-', // Se extrae el título del evento
      clientName: clientData.name,
      clientEmail: clientData.email,
      ticketQuantity: ticketsCount,
      amount: amount,
      paymentMethod: sale.paymentMethod || sale.booking?.paymentMethod || 'No especificado',
      status: payStatus
    })
  }

  const nowDate = new Date()
  const dateStr = nowDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = nowDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  const TABLE_START_Y = PH - HEADER_H - 20
  const TABLE_END_Y = FOOTER_H + 40
  const AVAILABLE_HEIGHT = TABLE_START_Y - TABLE_END_Y
  let ROWS_PER_PAGE = Math.floor(AVAILABLE_HEIGHT / ROW_H)
  if (ROWS_PER_PAGE < 5) ROWS_PER_PAGE = 5
  
  const totalPages = Math.ceil(processedSales.length / ROWS_PER_PAGE) + 1

  async function drawPageHeader(page, pageNum) {
    page.drawRectangle({ x: 0, y: PH - HEADER_H, width: PW, height: HEADER_H, color: COL.white })
    page.drawRectangle({ x: 0, y: PH - 4, width: PW, height: 4, color: COL.primary })
    
    const LOGO_X = MARGIN
    const LOGO_Y = PH - 48
    
    if (logoImg) {
      const lh = 26
      const lw = logoImg.width * (lh / logoImg.height)
      page.drawImage(logoImg, { x: LOGO_X, y: LOGO_Y, width: lw, height: lh })
    } else {
      page.drawText('booqi', { x: LOGO_X, y: LOGO_Y, size: 22, font: bold, color: COL.primary })
    }
    
    page.drawText('INFORME DE VENTAS', {
      x: LOGO_X, y: LOGO_Y - 20, size: 8, font: bold, color: COL.textMuted, letterSpacing: 2
    })
    
    page.drawLine({ start: { x: MARGIN, y: LOGO_Y - 28 }, end: { x: PW - MARGIN, y: LOGO_Y - 28 }, thickness: 1, color: COL.border })
    
    const titleSafe = safe(eventTitle || 'Evento')
    page.drawText(titleSafe, {
      x: LOGO_X, y: LOGO_Y - 46, size: 15, font: bold, color: COL.textDark
    })
    
    page.drawText(`ID: ${safe(eventId)}  |  Generado: ${dateStr} ${timeStr}`, {
      x: LOGO_X, y: LOGO_Y - 62, size: 8, font: reg, color: COL.textMuted
    })
    
    page.drawText(`Exportado por: ${safe(generatedBy)}`, {
      x: LOGO_X, y: LOGO_Y - 76, size: 8, font: reg, color: COL.textMuted
    })
    
    page.drawText(`Pág. ${pageNum} / ${totalPages}`, {
      x: PW - MARGIN - 50, y: LOGO_Y - 62, size: 8, font: reg, color: COL.textLight
    })
  }

  function drawFooter(page) {
    page.drawLine({ start: { x: MARGIN, y: FOOTER_H + 8 }, end: { x: PW - MARGIN, y: FOOTER_H + 8 }, thickness: 1, color: COL.border })
    page.drawText('booqi - Plataforma de gestión de eventos', {
      x: MARGIN, y: 16, size: 7, font: reg, color: COL.textLight
    })
    page.drawText(`Documento generado automáticamente. ${dateStr} ${timeStr}`, {
      x: PW - MARGIN - 210, y: 16, size: 7, font: reg, color: COL.textLight
    })
  }

  async function drawSummaryCards(page, startY) {
    const cardW = (TABLE_W - 40) / 3
    const cardH = 80
    
    const cards = [
      { 
        label: 'VENTAS', 
        value: String(processedSales.length),
        sub: `${countApproved} aprobadas | ${countPending} pendientes | ${countRejected} rechazadas`,
      },
      { 
        label: 'TICKETS', 
        value: String(totalTickets),
        sub: totalTickets === 1 ? 'entrada vendida' : 'entradas vendidas',
      },
      { 
        label: 'INGRESOS', 
        value: `${totalAmount.toFixed(2)} €`,
        sub: `aprobado: ${totalApproved.toFixed(2)} €`,
      }
    ]
    
    cards.forEach((card, index) => {
      const x = MARGIN + index * (cardW + 20)
      
      roundRect(page, x, startY - cardH, cardW, cardH, 10, COL.white)
      page.drawRectangle({ x, y: startY - cardH, width: cardW, height: cardH, borderColor: COL.border, borderWidth: 1 })
      page.drawRectangle({ x, y: startY - 4, width: cardW, height: 3, color: COL.primary })
      
      page.drawText(card.label, { x: x + 12, y: startY - 20, size: 7, font: bold, color: COL.textMuted })
      page.drawText(card.value, { x: x + 12, y: startY - 46, size: 16, font: bold, color: COL.primaryDark })
      page.drawText(card.sub, { x: x + 12, y: startY - 64, size: 6.5, font: reg, color: COL.textLight })
    })
  }

  function drawTableHeader(page, y) {
    page.drawRectangle({ 
      x: MARGIN, 
      y: y - ROW_H + 4, 
      width: TABLE_W, 
      height: ROW_H - 2, 
      color: COL.primaryBg 
    })
    
    COLS.forEach(col => {
      let tx = col.x
      if (col.align === 'center') tx = col.x + (col.w - bold.widthOfTextAtSize(col.label, 7.5)) / 2
      if (col.align === 'right') tx = col.x + col.w - bold.widthOfTextAtSize(col.label, 7.5)
      page.drawText(col.label, { 
        x: tx, 
        y: y - ROW_H + 16, 
        size: 7.5, 
        font: bold, 
        color: COL.primary 
      })
    })
    
    page.drawLine({ 
      start: { x: MARGIN, y: y - ROW_H + 3 }, 
      end: { x: PW - MARGIN, y: y - ROW_H + 3 }, 
      thickness: 1, 
      color: COL.primary 
    })
  }

  function drawTableRow(page, sale, rowNumber, y, isEven) {
    if (isEven) {
      page.drawRectangle({ 
        x: MARGIN, 
        y: y - ROW_H + 4, 
        width: TABLE_W, 
        height: ROW_H - 2, 
        color: COL.whiteOff 
      })
    }
    
    const textY = y - ROW_H + 18

    // Helper para pintar el texto truncado y alineado
    const drawColText = (colIndex, text, fontType, size, color) => {
      const col = COLS[colIndex]
      const str = String(text)
      let finalStr = truncate(str, fontType, size, col.w - 8)

      let finalX = col.x
      if (col.align === 'center') {
        const nw = fontType.widthOfTextAtSize(finalStr, size)
        finalX = col.x + (col.w - nw) / 2
      } else if (col.align === 'right') {
        const nw = fontType.widthOfTextAtSize(finalStr, size)
        finalX = col.x + col.w - nw - 4
      }

      page.drawText(finalStr, { x: finalX, y: textY, size, font: fontType, color })
    }

    // Helper para pintar la insignia de estado
    const drawBadge = (colIndex, status) => {
      const col = COLS[colIndex]
      const ps = statusColor(status)
      const psLabel = statusLabel(status)
      const psW = bold.widthOfTextAtSize(psLabel, 6.5) + 14
      const psBadgeX = col.x + (col.w - psW) / 2
      roundRect(page, psBadgeX, y - ROW_H + 8, psW, 18, 9, ps.bg)
      page.drawText(psLabel, {
        x: psBadgeX + 7,
        y: textY - 1,
        size: 6.5,
        font: bold,
        color: ps.text
      })
    }

    // Pintamos las columnas dinámicamente según sea informe global o no
    if (isGlobal) {
      drawColText(0, rowNumber, reg, 7.5, COL.textMuted)
      drawColText(1, `#${sale.id}`, reg, 7.5, COL.textMuted)
      drawColText(2, sale.eventTitle, bold, 7.5, COL.textDark)
      drawColText(3, sale.clientName || 'Cliente', bold, 8, COL.textDark)
      drawColText(4, sale.clientEmail || '-', reg, 7.5, COL.textMuted)
      drawColText(5, sale.ticketQuantity, bold, 8.5, COL.textDark)
      drawColText(6, sale.amount ? `${Number(sale.amount).toFixed(2)} €` : '-', bold, 8.5, COL.primaryDark)
      drawColText(7, methodLabel(sale.paymentMethod), reg, 7.5, COL.textMuted)
      drawBadge(8, sale.status)
    } else {
      drawColText(0, rowNumber, reg, 7.5, COL.textMuted)
      drawColText(1, `#${sale.id}`, reg, 7.5, COL.textMuted)
      drawColText(2, sale.clientName || 'Cliente', bold, 8, COL.textDark)
      drawColText(3, sale.clientEmail || '-', reg, 7.5, COL.textMuted)
      drawColText(4, sale.ticketQuantity, bold, 8.5, COL.textDark)
      drawColText(5, sale.amount ? `${Number(sale.amount).toFixed(2)} €` : '-', bold, 8.5, COL.primaryDark)
      drawColText(6, methodLabel(sale.paymentMethod), reg, 7.5, COL.textMuted)
      drawBadge(7, sale.status)
    }
    
    // Línea separadora inferior
    page.drawLine({ 
      start: { x: MARGIN, y: y - ROW_H + 3 }, 
      end: { x: PW - MARGIN, y: y - ROW_H + 3 }, 
      thickness: 0.3, 
      color: COL.border 
    })
  }

  function drawTotalGeneral(page, y) {
    // ¡AQUÍ ESTABA EL BUG DE LAS COORDENADAS SUPERPUESTAS! 
    const boxY = y - 42 
    const boxH = 42
    
    page.drawLine({ 
      start: { x: MARGIN, y: boxY - 5 }, 
      end: { x: PW - MARGIN, y: boxY - 5 }, 
      thickness: 1, 
      color: COL.border 
    })
    
    page.drawRectangle({ 
      x: MARGIN, 
      y: boxY, 
      width: TABLE_W, 
      height: boxH, 
      color: COL.primaryBg 
    })
    
    page.drawText('TOTAL GENERAL', { 
      x: MARGIN + 20, 
      y: boxY + 26, 
      size: 10, 
      font: bold, 
      color: COL.textDark 
    })
    
    page.drawText(`${processedSales.length} venta${processedSales.length !== 1 ? 's' : ''}  |  ${totalTickets} ticket${totalTickets !== 1 ? 's' : ''}`, {
      x: MARGIN + 150, 
      y: boxY + 26, 
      size: 8.5, 
      font: reg, 
      color: COL.textMuted
    })
    
    page.drawText(`${totalAmount.toFixed(2)} €`, {
      x: PW - MARGIN - 85, 
      y: boxY + 28, 
      size: 14, 
      font: bold, 
      color: COL.primary
    })
  }

  // PÁGINA 1
  {
    const page = pdfDoc.addPage([PW, PH])
    page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: COL.white })
    await drawPageHeader(page, 1)
    
    const y = PH - HEADER_H - 15
    await drawSummaryCards(page, y)
    drawFooter(page)
  }

  // PÁGINAS DE TABLA
  if (processedSales.length > 0) {
    let pageNum = 2
    let startIndex = 0
    
    while (startIndex < processedSales.length) {
      const page = pdfDoc.addPage([PW, PH])
      page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: COL.white })
      await drawPageHeader(page, pageNum)
      
      let currentY = TABLE_START_Y
      drawTableHeader(page, currentY)
      currentY -= ROW_H
      
      const endIndex = Math.min(startIndex + ROWS_PER_PAGE, processedSales.length)
      
      for (let i = startIndex; i < endIndex; i++) {
        const sale = processedSales[i]
        const rowNumber = i + 1
        drawTableRow(page, sale, rowNumber, currentY, i % 2 === 0)
        currentY -= ROW_H // Se resta al final de dibujar la fila
      }
      
      if (endIndex >= processedSales.length) {
        // Le pasamos el currentY ya ajustado para que pinte JUSTO DEBAJO y no encima
        drawTotalGeneral(page, currentY) 
      }
      
      drawFooter(page)
      
      startIndex = endIndex
      pageNum++
    }
  } else {
    const page = pdfDoc.addPage([PW, PH])
    page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: COL.white })
    await drawPageHeader(page, 2)
    
    page.drawText('No hay ventas registradas para este evento', {
      x: MARGIN,
      y: TABLE_START_Y - 50,
      size: 12,
      font: reg,
      color: COL.textMuted
    })
    
    drawFooter(page)
  }

  return { pdfDoc, sales: processedSales, totalAmount, totalTickets, totalApproved, countApproved, countRejected, countPending }
}
// Función para descargar el PDF generado
export async function downloadEventReport(params) {
  const { pdfDoc, eventTitle } = await generateEventReportPDF(params)
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const nowDate = new Date()
  const dateStr = nowDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  
  const safeName = safe(eventTitle || 'evento')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

  const filename = `booqi_factura_${safeName}_${dateStr.replace(/\//g, '-')}.pdf`

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function getEventReportPDFUrl(params) {
  const { pdfDoc } = await generateEventReportPDF(params)
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

export async function exportEventReport(params) {
  return downloadEventReport(params)
}