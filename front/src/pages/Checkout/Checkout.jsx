import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { createBooking } from '../../api/bookingService'
import { processPayment } from '../../api/paymentService'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'  // Navbar
import './CheckoutStyle.css'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300&q=70'
const LOGO_PATH   = '/src/assets/logo_entrada.png' //este es el logo de la entrada digital

const METHODS = [
  { id: 'CREDIT_CARD', icon: '💳', label: 'Tarjeta crédito' },
  { id: 'DEBIT_CARD',  icon: '🏦', label: 'Tarjeta débito'  },
  { id: 'PAYPAL',      icon: '🅿️', label: 'PayPal'          },
]

// helper:  formato pdf-lib
function c(r, g, b) { return rgb(r / 255, g / 255, b / 255) }

// dibuja un rectángulo con esquinas redondeadas usando drawSvgPath
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

// QR simulado — cuadrícula 21×21 con patrones de esquina fijos
// el área de datos varía según bookingId (cada entrada tiene su propio QR visual)
function drawQR(page, x, y, size, seed) {
  const N    = 21
  const cell = size / N
  const INK  = c(26, 26, 26)
  const BG   = rgb(1, 1, 1)

  // fondo blanco
  page.drawRectangle({ x, y: y - size, width: size, height: size, color: BG })

  const inCorner = (row, col) => {
    const b = (r0, c0) => row >= r0 && row <= r0 + 6 && col >= c0 && col <= c0 + 6
    return b(0, 0) || b(0, 14) || b(14, 0)
  }

  const putCell = (row, col) => {
    page.drawRectangle({
      x:      x + col * cell,
      y:      y - size + (N - 1 - row) * cell,
      width:  cell + 0.4,
      height: cell + 0.4,
      color:  INK,
    })
  }

  // dibuja los tres cuadrados de esquina
  const corner = (r0, c0) => {
    for (let dr = 0; dr <= 6; dr++) for (let dc = 0; dc <= 6; dc++) {
      const outer = dr === 0 || dr === 6 || dc === 0 || dc === 6
      const inner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
      if (outer || inner) putCell(r0 + dr, c0 + dc)
    }
  }
  corner(0, 0); corner(0, 14); corner(14, 0)

  // timing patterns — línea horizontal y vertical alternada
  for (let i = 8; i <= 12; i++) {
    if (i % 2 === 0) { putCell(6, i); putCell(i, 6) }
  }

  // zona de datos pseudoaleatoria
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

// generador principal del ticket — soporta múltiples entradas
async function generateTicketPDF({ bookingId, paymentId, items, user }) {
  const pdfDoc = await PDFDocument.create()
  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const reg    = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Paleta de colores
  const NEAR_BLACK   = c( 26,  26,  26)
  const DARK_GREY    = c( 60,  60,  60)
  const MID_GREY     = c(130, 130, 130)
  const LIGHT_GREY   = c(220, 220, 218)
  const OFF_WHITE    = c(250, 250, 249)
  const WARM_WHITE   = c(255, 255, 255)
  const PURPLE       = c(109,  40, 217)
  const PURPLE_DEEP  = c( 22,   8,  52)
  const PURPLE_MID   = c( 72,  35, 130)
  const PURPLE_LIGHT = c(245, 240, 255)
  const PURPLE_TEXT  = c(124,  58, 237)
  const WHITE        = rgb(1, 1, 1)

  const W = 720, H = 270, R = 16
  const SPLIT  = 520
  const STUB_W = W - SPLIT

  // Crear una página por cada entrada
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx]
    const page = pdfDoc.addPage([W, H])

    // Fondo general blanco
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: c(255, 255, 255) })

    // PANEL PRINCIPAL
    roundRect(page, 0, 0, SPLIT, H, R, WARM_WHITE)

    // Franja izquierda
    const STRIPE_W = 6
    page.drawRectangle({ x: 0, y: R, width: STRIPE_W, height: H - R * 2, color: PURPLE })
    page.drawRectangle({ x: 0, y: 0, width: R, height: R, color: OFF_WHITE })
    roundRect(page, 0, 0, R * 2, R * 2, R, WARM_WHITE)
    page.drawRectangle({ x: 0, y: H - R, width: R, height: R, color: OFF_WHITE })
    roundRect(page, 0, H - R * 2, R * 2, R * 2, R, WARM_WHITE)

    const IMG_START = SPLIT

  // LOGO
  const LOGO_Y = H - 42
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
    // Icono ticket manual + wordmark (sin borderColor/borderWidth)
    page.drawRectangle({ x: STRIPE_W + 14, y: LOGO_Y + 8, width: 16, height: 11, color: PURPLE, opacity: 0.15 })
    page.drawRectangle({ x: STRIPE_W + 14, y: LOGO_Y + 11, width: 16, height: 4, color: PURPLE, opacity: 0.2 })
    page.drawText('booqi', { x: STRIPE_W + 34, y: LOGO_Y + 10, size: 16, font: bold, color: PURPLE })
  }
    // Separador cabecera
    const HDR_SEP = H - 52
    page.drawRectangle({ x: STRIPE_W + 14, y: HDR_SEP, width: IMG_START - STRIPE_W - 28, height: 0.8, color: LIGHT_GREY })

    // Título del evento
    const titleRaw = item.title || 'Evento'
    const tSize = titleRaw.length > 40 ? 11 : titleRaw.length > 28 ? 13.5 : titleRaw.length > 18 ? 16 : 19
    const TITLE_Y = HDR_SEP - 22
    page.drawText(titleRaw.toUpperCase(), {
      x: STRIPE_W + 14, y: TITLE_Y,
      size: tSize, font: bold, color: NEAR_BLACK, maxWidth: IMG_START - STRIPE_W - 30,
    })

    // Fecha y hora
    const rawDate = item.startDate ? new Date(item.startDate) : new Date()
    const dateStr = rawDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).replace(/^\w/, ch => ch.toUpperCase())
    const timeStr = rawDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    const META_Y = TITLE_Y - 16
    page.drawText(`${dateStr}  -  ${timeStr}`, {
      x: STRIPE_W + 14, y: META_Y, size: 8, font: bold, color: DARK_GREY, maxWidth: IMG_START - STRIPE_W - 30,
    })
    if (item.location) {
      page.drawText(item.location, {
        x: STRIPE_W + 14, y: META_Y - 13, size: 7.5, font: reg, color: MID_GREY, maxWidth: IMG_START - STRIPE_W - 30,
      })
    }

    // Separador medio
    const MID_SEP = item.location ? META_Y - 28 : META_Y - 18
    page.drawRectangle({ x: STRIPE_W + 14, y: MID_SEP, width: IMG_START - STRIPE_W - 28, height: 0.8, color: LIGHT_GREY })

    // Datos del ticket
  
    const unitStr = (item.price || 0).toFixed(2)
    const totStr = (item.price || 0).toFixed(2)

    const COL1_X = STRIPE_W + 14
    const COL2_X = COL1_X + 120
    const COL3_X = COL2_X + 90
    const DATA_Y = MID_SEP - 14

    // Titular
    page.drawText('TITULAR', { x: COL1_X, y: DATA_Y, size: 5.5, font: bold, color: MID_GREY })
    page.drawText(`${user.firstName || ''} ${user.lastName || ''}`.trim().toUpperCase() || 'COMPRADOR', {
      x: COL1_X, y: DATA_Y - 13, size: 9.5, font: bold, color: NEAR_BLACK, maxWidth: 100,
    })
    page.drawText(user.contactEmail || '', {
      x: COL1_X, y: DATA_Y - 25, size: 6.5, font: reg, color: MID_GREY, maxWidth: 100,
    })

    // Entradas
    page.drawText('ENTRADA', { x: COL2_X, y: DATA_Y, size: 5.5, font: bold, color: MID_GREY })
    page.drawText(`Entrada ${idx + 1} de ${items.length}`, { x: COL2_X, y: DATA_Y - 13, size: 8, font: bold, color: NEAR_BLACK })
    page.drawText(`${unitStr} EUR`, { x: COL2_X, y: DATA_Y - 25, size: 6.5, font: reg, color: MID_GREY })

    // Total con asiento dentro
    const TOT_BOX_W = 100, TOT_BOX_H = 52
    roundRect(page, COL3_X - 4, DATA_Y - TOT_BOX_H + 6, TOT_BOX_W, TOT_BOX_H, 6, PURPLE_LIGHT)
    page.drawText('TOTAL', { x: COL3_X, y: DATA_Y - 4, size: 5.5, font: bold, color: PURPLE_TEXT })
    page.drawText(`${totStr} EUR`, { x: COL3_X, y: DATA_Y - 19, size: 12, font: bold, color: PURPLE })
    
    // Asiento único por entrada
    const seatLetter = String.fromCharCode(65 + ((bookingId + idx) % 26))
    const seatNumber = `${seatLetter}${((bookingId + idx) % 50) + 1}`
    page.drawText('ASIENTO', { x: COL3_X, y: DATA_Y - 34, size: 5, font: bold, color: PURPLE_TEXT })
    page.drawText(seatNumber, { x: COL3_X + 45, y: DATA_Y - 34, size: 9, font: bold, color: PURPLE })

    // Separador inferior
    const BOT_SEP = DATA_Y - TOT_BOX_H - 2
    page.drawRectangle({ x: STRIPE_W + 14, y: BOT_SEP, width: IMG_START - STRIPE_W - 28, height: 0.8, color: LIGHT_GREY })

    // Pills de referencia
    const PILL_Y = 14, PILL_H = BOT_SEP - 24
    const drawInfoPill = (px, label, value) => {
      const pw = 110
      page.drawRectangle({ x: px, y: PILL_Y, width: pw, height: PILL_H, color: c(245,245,244) })
      page.drawRectangle({ x: px, y: PILL_Y + PILL_H - 3, width: pw, height: 3, color: PURPLE })
      page.drawText(label, { x: px + 8, y: PILL_Y + PILL_H - 12, size: 5.5, font: bold, color: MID_GREY })
      page.drawText(value, { x: px + 8, y: PILL_Y + 4, size: 9, font: bold, color: NEAR_BLACK })
    }
    drawInfoPill(STRIPE_W + 14, 'N. DE RESERVA', `#${String(bookingId).padStart(8, '0')}`)
    drawInfoPill(STRIPE_W + 130, 'ID DE PAGO', `#${String(paymentId).padStart(8, '0')}`)

    // Esquinas inf del panel principal
    page.drawRectangle({ x: SPLIT - R, y: 0, width: R, height: R, color: OFF_WHITE })
    roundRect(page, SPLIT - R * 2, 0, R * 2, R * 2, R, WARM_WHITE)

    // Perforación
    page.drawCircle({ x: SPLIT, y: H + 2, size: 12, color: OFF_WHITE })
    page.drawCircle({ x: SPLIT, y: -2, size: 12, color: OFF_WHITE })
    for (let yy = 16; yy < H - 16; yy += 11) {
      page.drawLine({
        start: { x: SPLIT, y: yy }, end: { x: SPLIT, y: yy + 5.5 },
        thickness: 1.5, color: LIGHT_GREY, opacity: 0.8,
      })
    }

    // STUB DERECHO
    roundRect(page, SPLIT, 0, STUB_W, H, R, PURPLE_DEEP)
    const GS = 30
    for (let i = 0; i < GS; i++) {
      const t = i / GS
      const rr = Math.round(22 + (45 - 22) * t)
      const gg = Math.round(8 + (27 - 8) * t)
      const bb = Math.round(52 + (78 - 52) * t)
      page.drawRectangle({
        x: SPLIT, y: i * (H / GS), width: STUB_W, height: H / GS + 1,
        color: c(rr, gg, bb),
      })
    }
    page.drawRectangle({ x: W - R, y: H - R, width: R, height: R, color: OFF_WHITE })
    roundRect(page, W - R * 2, H - R * 2, R * 2, R * 2, R, c(45, 27, 78))
    page.drawRectangle({ x: W - R, y: 0, width: R, height: R, color: OFF_WHITE })
    roundRect(page, W - R * 2, 0, R * 2, R * 2, R, PURPLE_DEEP)

    // Logo stub
    const SCX = SPLIT + STUB_W / 2
    const STUB_LOGO_Y = H - 36
    page.drawText('booqi', {
      x: SCX - bold.widthOfTextAtSize('booqi', 14) / 2,
      y: STUB_LOGO_Y,
      size: 14, font: bold, color: WHITE,
    })
    page.drawRectangle({ x: SCX - 22, y: STUB_LOGO_Y - 6, width: 44, height: 1.5, color: PURPLE, opacity: 0.7 })

    // Círculos decorativos
    page.drawCircle({ x: SCX, y: H * 0.43, size: 72, color: PURPLE_MID, opacity: 0.18 })
    page.drawCircle({ x: SCX, y: H * 0.43, size: 52, color: PURPLE_MID, opacity: 0.14 })

    // QR
    const QR_SIZE = 96
    const QR_X = SPLIT + (STUB_W - QR_SIZE) / 2
    const QR_TOP = H - 50

    page.drawRectangle({ x: QR_X - 8, y: QR_TOP - QR_SIZE - 8, width: QR_SIZE + 16, height: QR_SIZE + 16, color: PURPLE_MID, opacity: 0.3 })
    page.drawRectangle({ x: QR_X - 5, y: QR_TOP - QR_SIZE - 5, width: QR_SIZE + 10, height: QR_SIZE + 10, color: WHITE })
    drawQR(page, QR_X, QR_TOP, QR_SIZE, (bookingId * 31 + paymentId + idx))

    // Referencia bajo QR
    const refVal = `#${String(bookingId).padStart(8, '0')}`
    const rvW = bold.widthOfTextAtSize(refVal, 8)
    const refLbl = 'N. DE RESERVA'
    const rlW = reg.widthOfTextAtSize(refLbl, 6)

    page.drawText(refLbl, { x: SCX - rlW / 2, y: QR_TOP - QR_SIZE - 20, size: 6, font: reg, color: c(150, 120, 200) })
    page.drawText(refVal, { x: SCX - rvW / 2, y: QR_TOP - QR_SIZE - 32, size: 8, font: bold, color: WHITE })

    // Pie stub
    page.drawRectangle({ x: SPLIT, y: 0, width: STUB_W, height: 22, color: PURPLE, opacity: 0.25 })
    const footTxt = 'CONSERVE ESTA ENTRADA'
    const ftW = reg.widthOfTextAtSize(footTxt, 5.5)
    page.drawText(footTxt, { x: SCX - ftW / 2, y: 7.5, size: 5.5, font: reg, color: c(180, 150, 230) })
  }

  return await pdfDoc.save()
}



function downloadPDF(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function Checkout() {
  const { cart, clearCart } = useCart()
  const { user }            = useAuth()
  const navigate            = useNavigate()

  const [step,          setStep]          = useState(1)
  const [method,        setMethod]        = useState('CREDIT_CARD')
  const [loading,       setLoading]       = useState(false)
  const [pdfLoading,    setPdfLoading]    = useState(false)
  const [error,         setError]         = useState('')
  const [paymentResult, setPaymentResult] = useState(null)
  const [confirmedData, setConfirmedData] = useState(null)

  const [form, setForm] = useState({
    cardNumber: '',
    cardHolder: user ? `${user.firstName} ${user.lastName}` : '',
    expiry:     '',
    cvv:        '',
  })

  const subtotal   = cart?.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0) || 0
  const serviceFee = parseFloat((subtotal * 0.05).toFixed(2))
  const total      = parseFloat((subtotal + serviceFee).toFixed(2))

  const handleForm = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const formatCard = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)

  const handlePay = async () => {
    if (!user) { navigate('/login'); return }
    setError(''); setLoading(true)
    try {
      const bookings = await Promise.all(cart.map(item =>
        createBooking({
          userId: user.idUser, userFirstName: user.firstName, userLastName: user.lastName,
          userEmail: user.contactEmail, eventId: item.idEvent || item.id, eventTitle: item.title,
          eventDescription: item.description || '', eventStartDate: item.startDate || new Date().toISOString(),
          eventLocation: item.location || '', ticketQuantity: item.qty || 1,
          basePrice: item.price || 0, totalPrice: (item.price || 0) * (item.qty || 1),
        })
      ))
      const payments = await Promise.all(bookings.map((b, i) => {
        const it = cart[i]
        return processPayment({
          bookingId: b.data.bookingId, userId: user.idUser, eventId: it.idEvent || it.id,
          ticketQuantity: it.qty || 1, totalPrice: (it.price || 0) * (it.qty || 1),
          paymentMethod: method, cardNumber: method !== 'PAYPAL' ? form.cardNumber.replace(/\s/g, '') : null,
        })
      }))
      const fp = payments[0]?.data
      if (fp?.status === 'APPROVED') {
        setConfirmedData({ cartSnapshot: [...cart], bookings: bookings.map(b => b.data), paymentId: fp.paymentId })
        setPaymentResult({ ...fp, success: true }); clearCart(); setStep(3)
      } else if (fp?.status === 'REJECTED') {
        setError(fp.errorMessage || 'Tu pago ha sido rechazado.')
        setPaymentResult({ ...fp, success: false }); setStep(3)
      } else {
        setError('Respuesta inesperada del servidor.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error procesando el pago.')
    } finally { setLoading(false) }
  }

  const handleDownloadTickets = async () => {
    if (!confirmedData) return
    setPdfLoading(true)
    try {
      const { cartSnapshot, bookings, paymentId } = confirmedData
      
      // Expandir cada item en entradas individuales
      const expandedTickets = []
      for (let i = 0; i < cartSnapshot.length; i++) {
        const item = cartSnapshot[i]
        const qty = item.qty || 1
        for (let j = 0; j < qty; j++) {
          expandedTickets.push({
            ...item,
            qty: 1,
            price: item.price,
          })
        }
      }
      
      // Generar UN solo PDF con todas las entradas
      const pdfBytes = await generateTicketPDF({
        bookingId: bookings[0]?.bookingId || `BK${Date.now()}`,
        paymentId: paymentId || `PAY${Date.now()}`,
        items: expandedTickets,
        user,
      })
      
      downloadPDF(pdfBytes, `booqi-entradas-${new Date().getTime()}.pdf`)
      
    } catch (err) {
      console.error('error generando el pdf:', err)
      alert('No se pudo generar la entrada.')
    } finally {
      setPdfLoading(false)
    }
  }
  const previewCard = form.cardNumber
    ? form.cardNumber.padEnd(19, '•').replace(/(.{4})/g, '$1 ').trim()
    : '•••• •••• •••• ••••'

  if (!cart || (cart.length === 0 && step !== 3)) {
    return (
      <div className="chk-root">
        <Navbar />  {/* ← CAMBIADO */}
        <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: '1.5rem' }}>No hay eventos en tu carrito.</p>
          <Link to="/events" style={{ color: '#7c3aed', fontWeight: 600 }}>← Explorar eventos</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="chk-root">
      <Navbar />
      <div className="chk-page" style={{ paddingTop: '88px' }}>

        {step !== 3 && (
          <div className="chk-steps">
            <div className={`chk-step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
              <div className="chk-step-dot">{step > 1 ? '✓' : '1'}</div>
              <div className="chk-step-label">Resumen</div>
            </div>
            <div className={`chk-step-line ${step > 1 ? 'done' : ''}`} />
            <div className={`chk-step ${step >= 2 ? 'active' : ''}`}>
              <div className="chk-step-dot">2</div>
              <div className="chk-step-label">Pago</div>
            </div>
            <div className="chk-step-line" />
            <div className="chk-step">
              <div className="chk-step-dot">3</div>
              <div className="chk-step-label">Confirmation</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`chk-success ${paymentResult?.success === false ? 'chk-rejected' : ''}`}>
            <div className="chk-success-icon">{paymentResult?.success === false ? '❌' : '🎉'}</div>
            <h2>{paymentResult?.success === false ? 'Pago rechazado' : '¡Reserva confirmada!'}</h2>
            <p>
              {paymentResult?.success === false
                ? (paymentResult?.errorMessage || 'Tu pago no ha podido procesarse.')
                : 'Tu reserva se ha procesado correctamente. Recibirás la confirmación en tu correo.'}
            </p>
            {paymentResult?.paymentId && (
              <div className="chk-success-id">
                ID de pago: <span>#{paymentResult.paymentId}</span>{' · '}
                Estado: <span className={paymentResult.success === false ? 'chk-status-rejected' : 'chk-status-approved'}>{paymentResult.status}</span>
              </div>
            )}
            <div className="chk-success-actions">
              {paymentResult?.success === false ? (
                <>
                  <button className="chk-success-btn chk-success-primary" onClick={() => { setStep(2); setError('') }}>Reintentar pago</button>
                  <Link to="/" className="chk-success-btn chk-success-ghost">Ir al inicio</Link>
                </>
              ) : (
                <>
                  <button className="chk-success-btn chk-success-primary" onClick={handleDownloadTickets} disabled={pdfLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {pdfLoading ? <><span className="chk-spinner" /> Generando entrada...</> : <>🎟️ Descargar entrada{confirmedData?.cartSnapshot?.length > 1 ? 's' : ''}</>}
                  </button>
                  <Link to="/" className="chk-success-btn chk-success-ghost">Ir al inicio</Link>
                  <Link to="/events" className="chk-success-btn chk-success-ghost">Ver más eventos</Link>
                </>
              )}
            </div>
          </div>
        )}

        {step !== 3 && (
          <div className="chk-layout">
            <div>
              {step === 1 && (
                <div className="chk-panel">
                  <div className="chk-panel-title">Confirma tus eventos</div>
                  {cart.map((item, i) => (
                    <div key={i} className="chk-order-item" style={{ marginBottom: 0 }}>
                      <img src={item.urlImage || PLACEHOLDER} alt={item.title} onError={e => e.target.src = PLACEHOLDER} />
                      <div className="chk-order-item-info">
                        <div className="chk-order-item-title">{item.title}</div>
                        <div className="chk-order-item-sub">{item.location} · ×{item.qty || 1} entrada{(item.qty || 1) > 1 ? 's' : ''}</div>
                      </div>
                      <div className="chk-order-item-price">{((item.price || 0) * (item.qty || 1)).toFixed(2)}€</div>
                    </div>
                  ))}
                  <button className="chk-submit-btn" onClick={() => setStep(2)} style={{ marginTop: '2rem' }}>Continuar al pago →</button>
                </div>
              )}
              {step === 2 && (
                <div className="chk-panel">
                  <div className="chk-panel-title">Datos de pago</div>
                  <div className="chk-card-preview">
                    <div className="chk-card-chip">💳</div>
                    <div className="chk-card-number">{previewCard}</div>
                    <div className="chk-card-bottom">
                      <span>{form.cardHolder || 'NOMBRE APELLIDO'}</span>
                      <span>{form.expiry || 'MM/AA'}</span>
                    </div>
                  </div>
                  <div className="chk-section-title">Método de pago</div>
                  <div className="chk-methods">
                    {METHODS.map(m => (
                      <button key={m.id} className={`chk-method${method === m.id ? ' active' : ''}`} onClick={() => setMethod(m.id)} type="button">
                        <span className="chk-method-icon">{m.icon}</span>{m.label}
                      </button>
                    ))}
                  </div>
                  {method !== 'PAYPAL' && (
                    <>
                      <div className="chk-section-title">Datos de la tarjeta</div>
                      {error && <div className="chk-error">{error}</div>}
                      <div className="chk-field">
                        <label>Número de tarjeta</label>
                        <input name="cardNumber" placeholder="0000 0000 0000 0000" value={form.cardNumber} onChange={e => setForm(f => ({ ...f, cardNumber: formatCard(e.target.value) }))} maxLength={19} />
                      </div>
                      <div className="chk-field">
                        <label>Titular</label>
                        <input name="cardHolder" placeholder="Nombre completo" value={form.cardHolder} onChange={handleForm} />
                      </div>
                      <div className="chk-row">
                        <div className="chk-field">
                          <label>Caducidad</label>
                          <input name="expiry" placeholder="MM/AA" value={form.expiry} maxLength={5} onChange={e => { let v = e.target.value.replace(/\D/g,''); if (v.length >= 3) v = v.slice(0,2)+'/'+v.slice(2,4); setForm(f => ({...f, expiry: v})) }} />
                        </div>
                        <div className="chk-field">
                          <label>CVV</label>
                          <input name="cvv" placeholder="•••" value={form.cvv} maxLength={4} onChange={handleForm} />
                        </div>
                      </div>
                    </>
                  )}
                  {method === 'PAYPAL' && (
                    <>
                      {error && <div className="chk-error">{error}</div>}
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: '0.9rem' }}>🔗 Serás redirigido a PayPal para completar el pago de forma segura.</div>
                    </>
                  )}
                  <button className="chk-submit-btn" onClick={handlePay} disabled={loading}>
                    {loading ? <><span className="chk-spinner" /> Procesando pago...</> : `Pagar ${total.toFixed(2)}€`}
                  </button>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'block', margin: '0.75rem auto 0', fontSize: '0.85rem', color: '#aaa' }}>
                    ← Volver al resumen
                  </button>
                </div>
              )}
            </div>
            <div className="chk-order">
              <h2>Tu pedido</h2>
              {cart.map((item, i) => (
                <div key={i} className="chk-order-item">
                  <img src={item.urlImage || PLACEHOLDER} alt={item.title} onError={e => e.target.src = PLACEHOLDER} />
                  <div className="chk-order-item-info">
                    <div className="chk-order-item-title">{item.title}</div>
                    <div className="chk-order-item-sub">×{item.qty || 1} entrada{(item.qty || 1) > 1 ? 's' : ''}</div>
                  </div>
                  <div className="chk-order-item-price">{((item.price || 0) * (item.qty || 1)).toFixed(2)}€</div>
                </div>
              ))}
              <hr className="chk-order-divider" />
              <div className="chk-order-row"><span>Subtotal</span><span>{subtotal.toFixed(2)}€</span></div>
              <div className="chk-order-row"><span>Gestión (5%)</span><span>{serviceFee.toFixed(2)}€</span></div>
              <div className="chk-order-total"><span>Total</span><span>{total.toFixed(2)}€</span></div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}