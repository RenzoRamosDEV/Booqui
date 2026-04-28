
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserBookings } from '../../api/bookingService.js'
import { generateTicketPDF, downloadPDF } from '../../utils/ticketGenerator'
import Navbar from '../../components/Navbar/Navbar'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './MyBookingsStyle.css'

export default function MyBookings() {
  const { user } = useAuth()
  const [groupedBookings, setGroupedBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingEventId, setDownloadingEventId] = useState(null)
  const [expandedEvents, setExpandedEvents] = useState({})

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await getUserBookings(user.idUser)
        console.log('Respuesta completa:', response)
        
        let bookingsData = []
        if (response.data) {
          bookingsData = Array.isArray(response.data) ? response.data : 
                        (response.data.data ? response.data.data : [])
        } else if (Array.isArray(response)) {
          bookingsData = response
        }
        
        // Agrupar por evento (usando eventId como clave)
        const grouped = bookingsData.reduce((acc, booking) => {
          const eventKey = booking.eventId
          if (!acc[eventKey]) {
            acc[eventKey] = {
              eventId: booking.eventId,
              eventTitle: booking.eventTitle,
              eventDescription: booking.eventDescription,
              eventStartDate: booking.eventStartDate,
              eventLocation: booking.eventLocation,
              eventImage: booking.eventImage,
              bookings: [],
              totalTickets: 0,
              totalSpent: 0,
              status: booking.status
            }
          }
          acc[eventKey].bookings.push(booking)
          acc[eventKey].totalTickets += (booking.ticketQuantity || 1)
          acc[eventKey].totalSpent += (booking.totalPrice || (booking.basePrice * booking.ticketQuantity) || 0)
          return acc
        }, {})
        
        const groupedArray = Object.values(grouped)
        setGroupedBookings(groupedArray)
        
        // Auto-expandir eventos con múltiples reservas
        const initialExpand = {}
        groupedArray.forEach(event => {
          if (event.bookings.length > 1) {
            initialExpand[event.eventId] = false // Cerrado por defecto
          }
        })
        setExpandedEvents(initialExpand)
        
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError(err.response?.data?.message || 'No se pudieron cargar tus reservas')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookings()
  }, [user])

  const toggleEventExpand = (eventId) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }))
  }

  const handleDownloadAllTickets = async (event) => {
    setDownloadingEventId(event.eventId)
    try {
      // Recolectar todas las entradas de todas las reservas de este evento
      const allTickets = []
      for (const booking of event.bookings) {
        for (let i = 0; i < (booking.ticketQuantity || 1); i++) {
          allTickets.push({
            title: booking.eventTitle || event.eventTitle,
            startDate: booking.eventStartDate || event.eventStartDate,
            location: booking.eventLocation || event.eventLocation,
            price: booking.basePrice || 0,
            description: booking.eventDescription || event.eventDescription,
            urlImage: booking.eventImage || event.eventImage,
            bookingId: booking.bookingId
          })
        }
      }
      
      const pdfBytes = await generateTicketPDF({
        bookingId: event.bookings[0]?.bookingId || `EVT${event.eventId}`,
        paymentId: `PAY${event.bookings[0]?.bookingId || event.eventId}`,
        items: allTickets,
        user: {
          firstName: event.bookings[0]?.userFirstName || user?.firstName || '',
          lastName: event.bookings[0]?.userLastName || user?.lastName || '',
          contactEmail: event.bookings[0]?.userEmail || user?.contactEmail || ''
        }
      })
      
      downloadPDF(pdfBytes, `booqi-${event.eventTitle}-entradas.pdf`)
    } catch (err) {
      console.error('Error generando tickets:', err)
      alert('No se pudo generar las entradas. Intenta de nuevo.')
    } finally {
      setDownloadingEventId(null)
    }
  }

  const handleDownloadSingleTicket = async (booking) => {
    setDownloadingEventId(booking.bookingId)
    try {
      const tickets = []
      for (let i = 0; i < (booking.ticketQuantity || 1); i++) {
        tickets.push({
          title: booking.eventTitle,
          startDate: booking.eventStartDate,
          location: booking.eventLocation,
          price: booking.basePrice,
          description: booking.eventDescription,
          urlImage: booking.eventImage
        })
      }
      
      const pdfBytes = await generateTicketPDF({
        bookingId: booking.bookingId,
        paymentId: booking.paymentId || `PAY${booking.bookingId}`,
        items: tickets,
        user: {
          firstName: booking.userFirstName || user?.firstName || '',
          lastName: booking.userLastName || user?.lastName || '',
          contactEmail: booking.userEmail || user?.contactEmail || ''
        }
      })
      
      downloadPDF(pdfBytes, `booqi-entrada-${booking.bookingId}.pdf`)
    } catch (err) {
      console.error('Error generando ticket:', err)
      alert('No se pudo generar la entrada. Intenta de nuevo.')
    } finally {
      setDownloadingEventId(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha por confirmar'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="mybookings-root">
        <Navbar />
        <div className="mybookings-container">
          <div className="mybookings-login-prompt">
            <i className="bi bi-shield-lock"></i>
            <h2>Inicia sesión para ver tus reservas</h2>
            <p>Accede a tu cuenta para consultar todas tus compras y entradas</p>
            <Link to="/login" className="mybookings-login-btn">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mybookings-root">
      <Navbar />
      
      <div className="mybookings-container">
        <div className="mybookings-header">
          <h1>
            <i className="bi bi-ticket-perforated"></i>
            Mis Reservas
          </h1>
          <p>Gestiona tus entradas y descarga tus boletos</p>
        </div>

        {loading ? (
          <div className="mybookings-loading">
            <div className="mybookings-spinner"></div>
            <p>Cargando tus reservas...</p>
          </div>
        ) : error ? (
          <div className="mybookings-error">
            <i className="bi bi-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="mybookings-retry-btn">
              Reintentar
            </button>
          </div>
        ) : groupedBookings.length === 0 ? (
          <div className="mybookings-empty">
            <i className="bi bi-inbox"></i>
            <h3>No tienes reservas aún</h3>
            <p>¡Explora nuestros eventos y consigue tus entradas!</p>
            <Link to="/events" className="mybookings-explore-btn">
              Explorar eventos
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        ) : (
          <div className="mybookings-grid">
            {groupedBookings.map((event) => {
              const isExpanded = expandedEvents[event.eventId]
              const hasMultipleBookings = event.bookings.length > 1
              const allConfirmed = event.bookings.every(b => b.status === 'CONFIRMED')
              
              return (
                <div key={event.eventId} className="mybookings-card">
                  {/* Cabecera del evento */}
                  <div className="mybookings-card-header">
                    <div className="mybookings-card-status">
                      <span className={`mybookings-status-badge ${allConfirmed ? 'confirmed' : 'pending'}`}>
                        {allConfirmed ? 'Confirmada' : 'Pendiente'}
                      </span>
                      <span className="mybookings-date">
                        <i className="bi bi-calendar"></i>
                        {formatDate(event.eventStartDate)}
                      </span>
                    </div>
                    <h3 className="mybookings-card-title">{event.eventTitle}</h3>
                    <p className="mybookings-card-description">{event.eventDescription?.substring(0, 100)}...</p>
                  </div>
                  
                  {/* Cuerpo del evento */}
                  <div className="mybookings-card-body">
                    <div className="mybookings-info-row">
                      <i className="bi bi-geo-alt"></i>
                      <span>{event.eventLocation || 'Ubicación no especificada'}</span>
                    </div>
                    <div className="mybookings-info-row">
                      <i className="bi bi-clock"></i>
                      <span>{formatDate(event.eventStartDate)} - {formatTime(event.eventStartDate)}</span>
                    </div>
                    <div className="mybookings-info-row">
                      <i className="bi bi-ticket"></i>
                      <span>{event.totalTickets} entrada{event.totalTickets !== 1 ? 's' : ''} totales</span>
                    </div>
                    <div className="mybookings-info-row">
                      <i className="bi bi-cash"></i>
                      <span>{event.totalSpent.toFixed(2)} € total gastado</span>
                    </div>
                  </div>
                  
                  {/* Reservas individuales (expandible) */}
                  {hasMultipleBookings && (
                    <div className="mybookings-expand-section">
                      <button 
                        className="mybookings-expand-btn"
                        onClick={() => toggleEventExpand(event.eventId)}
                      >
                        <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        {isExpanded ? 'Ocultar reservas' : `Ver ${event.bookings.length} reservas`}
                      </button>
                      
                      {isExpanded && (
                        <div className="mybookings-sub-bookings">
                          {event.bookings.map((booking) => (
                            <div key={booking.bookingId} className="mybookings-sub-booking">
                              <div className="mybookings-sub-booking-header">
                                <span className="mybookings-sub-booking-id">
                                  <i className="bi bi-upc-scan"></i>
                                  #{String(booking.bookingId).slice(-8)}
                                </span>
                                <span className="mybookings-sub-booking-date">
                                  {new Date(booking.purchaseDate || booking.bookingDate).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                              <div className="mybookings-sub-booking-details">
                                <span><i className="bi bi-ticket"></i> {booking.ticketQuantity} entrada{booking.ticketQuantity !== 1 ? 's' : ''}</span>
                                <span><i className="bi bi-cash"></i> {(booking.totalPrice || booking.basePrice * booking.ticketQuantity).toFixed(2)} €</span>
                              </div>
                              <button 
                                className="mybookings-sub-download-btn"
                                onClick={() => handleDownloadSingleTicket(booking)}
                                disabled={downloadingEventId === booking.bookingId || booking.status === 'CANCELLED'}
                              >
                                {downloadingEventId === booking.bookingId ? (
                                  <><div className="mybookings-btn-spinner-small"></div> Generando...</>
                                ) : (
                                  <><i className="bi bi-download"></i> Esta reserva</>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Footer con botón principal */}
                  <div className="mybookings-card-footer">
                    <button 
                      className="mybookings-download-btn"
                      onClick={() => handleDownloadAllTickets(event)}
                      disabled={downloadingEventId === event.eventId}
                    >
                      {downloadingEventId === event.eventId ? (
                        <>
                          <div className="mybookings-btn-spinner"></div>
                          Generando {event.totalTickets} entrada{event.totalTickets !== 1 ? 's' : ''}...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-download"></i>
                          Descargar todas las entradas ({event.totalTickets})
                        </>
                      )}
                    </button>
                    
                    {!hasMultipleBookings && (
                      <div className="mybookings-booking-id">
                        <i className="bi bi-upc-scan"></i>
                        <span>ID: #{String(event.bookings[0]?.bookingId).slice(-8)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}