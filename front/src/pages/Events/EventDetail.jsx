
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEventById } from '../../api/eventService'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './EventDetailStyle.css'

const PLACEHOLDER_IMGS = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
  'https://images.unsplash.com/photo-1601924582975-5c6d4e9b1d98?w=800&q=80',
]

export default function EventDetail() {
  // sacamos el id del evento de la url (ej: /events/42 -> id = "42")
  const { id } = useParams()
  const navigate = useNavigate()


  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  // cantidad de entradas que quiere comprar el usuario, mínimo 1
  const [quantity, setQuantity] = useState(1)


  const { cart, addToCart } = useCart()
  // el usuario logueado, lo usamos para redirigir al login si no está autenticado
  const { user } = useAuth()

  useEffect(() => {
    const loadEvent = () => {
      setLoading(true)
      getEventById(id)
        .then(r => setEvent(r.data))
        
        .catch(() => navigate('/events'))
        .finally(() => setLoading(false))
    }
    
    loadEvent()
  // se vuelve a ejecutar si cambia el id (navegación entre eventos) o el navigate
  }, [id, navigate])

  // comprobamos si este evento ya está en el carrito para no añadirlo dos veces
  const isInCart = cart?.some(i => i.idEvent === event?.idEvent)
  const isSoldOut = event?.availableTickets === 0
  // aviso de pocas entradas
  const isLowStock = event && event.availableTickets > 0 && event.availableTickets <= 10 && !isSoldOut

  const handleAddToCart = () => {
 
    if (!user) {
      navigate('/login')
      return
    }
    // validación básica: que la cantidad sea válida y no supere el stock disponible
    if (event && quantity > 0 && quantity <= event.availableTickets) {
      addToCart({ ...event, qty: quantity })
    }
  }

  // pantalla de carga
  if (loading) {
    return (
      <div className="evd-root">
        <Navbar />
        <div className="evd-loading">
          <div className="spinner"></div>
          <p>Cargando evento...</p>
        </div>
      </div>
    )
  }

  // si no hay evento después de cargar (raro, pero por si acaso xd) no renderizamos nada
  if (!event) return null

  return (
    <div className="evd-root">
      <Navbar />

      <div className="evd-wrapper">
        {/* barra superior y el botón de volver */}
        <div className="evd-top-bar">
          <div className="evd-breadcrumb">
            <Link to="/">Inicio</Link>
            <i className="bi bi-chevron-right"></i>
            <Link to="/events">Eventos</Link>
            <i className="bi bi-chevron-right"></i>

            <span>{event.category}</span>
          </div>
          
          <button onClick={() => navigate('/events')} className="evd-back-btn">
            <i className="bi bi-arrow-left"></i>
            Volver a eventos
          </button>
        </div>

        <div className="evd-card">
          
          {/* contenedor de la imagen, ocupa toda la altura*/}
          <div className="evd-image-container">
            <img
              src={event.urlImage || PLACEHOLDER_IMGS[0]}
              alt={event.title}
              // si la imagen del evento no carga, usamos el placeholder
              onError={e => { e.target.src = PLACEHOLDER_IMGS[0] }}
              className="evd-image"
            />
            

            {isSoldOut && (
              <div className="evd-overlay-badge sold-out">
                <i className="bi bi-x-circle"></i>
                <span>AGOTADO</span>
              </div>
            )}
            
            {/* badge de pocas entradas, tiene animación */}
            {isLowStock && (
              <div className="evd-overlay-badge low-stock">
                <i className="bi bi-exclamation-triangle"></i>
                <span>ÚLTIMAS {event.availableTickets} ENTRADAS</span>
              </div>
            )}
          </div>

          {/* columna derecha con toda la información del evento */}
          <div className="evd-content">
            
            {/* categoría, título y organizador */}
            <div className="evd-header">
              <div className="evd-category-tag">
                <i className="bi bi-tag"></i>
                {event.category}
              </div>
              <h1 className="evd-title">{event.title}</h1>
              <p className="evd-organizer">
                <i className="bi bi-people"></i>
                Organizado por {event.organized}
              </p>
            </div>


            <div className="evd-info-grid">
              <div className="evd-info-box">
                <div className="evd-info-icon">
                  <i className="bi bi-calendar-event"></i>
                </div>
                <div className="evd-info-text">
                  <span className="evd-info-label">Fecha</span>
                  <span className="evd-info-value">
                    {new Date(event.startDate).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="evd-info-time">
                    {new Date(event.startDate).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div className="evd-info-box">
                <div className="evd-info-icon">
                  <i className="bi bi-geo-alt"></i>
                </div>
                <div className="evd-info-text">
                  <span className="evd-info-label">Ubicación</span>
                  <span className="evd-info-value">{event.location}</span>
                </div>
              </div>


              <div className="evd-info-box">
                <div className="evd-info-icon">
                  <i className="bi bi-ticket-perforated"></i>
                </div>
                <div className="evd-info-text">
                  <span className="evd-info-label">Disponibilidad</span>
                  <span className={`evd-info-value ${isSoldOut ? 'text-danger' : 'text-success'}`}>
                    {isSoldOut ? 'Agotado' : `${event.availableTickets} disponibles`}
                  </span>
                </div>
              </div>

              {/* celda de precio: si es 0 ponemos "gratis" directamente */}
              <div className="evd-info-box">
                <div className="evd-info-icon">
                  <i className="bi bi-currency-euro"></i>
                </div>
                <div className="evd-info-text">
                  <span className="evd-info-label">Precio</span>
                  <span className="evd-info-value evd-price-highlight">
                    {event.price === 0 ? 'GRATIS' : `${event.price}€`}
                  </span>
                </div>
              </div>
            </div>

            {/* descripción del evento, solo se muestra si existe el campo */}
            {event.description && (
              <div className="evd-section">
                <h3 className="evd-section-title">
                  <i className="bi bi-card-text"></i>
                  Sobre el evento
                </h3>
                <p className="evd-description">{event.description}</p>
              </div>
            )}

            {/* datos de contacto del organizador */}
            <div className="evd-section">
              <h3 className="evd-section-title">
                <i className="bi bi-telephone"></i>
                Información de contacto
              </h3>
              <div className="evd-contact-grid">
                <div className="evd-contact-item">
                  <i className="bi bi-envelope"></i>
                  <span>{event.contactEmail}</span>
                </div>
                <div className="evd-contact-item">
                  <i className="bi bi-phone"></i>
                  <span>{event.contactPhone}</span>
                </div>
              </div>
            </div>

         
            <div className="evd-purchase-card">
              <div className="evd-purchase-header">
                {/* precio por entrada a la izquierda */}
                <div className="evd-price-display">
                  <span className="evd-price-label">Precio por entrada</span>
                  <span className="evd-price-amount">
                    {event.price === 0 ? 'GRATIS' : `${event.price}€`}
                  </span>
                </div>

                {/* selector de cantidad solo aparece si quedan entradas */}
                {!isSoldOut && (
                  <div className="evd-quantity-selector">
                    <label>Cantidad</label>
                    <div className="evd-quantity-controls">
                    
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="evd-qty-btn"
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                    
                      <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          setQuantity(Math.min(event.availableTickets, Math.max(1, val)))
                        }}
                        min="1"
                        max={event.availableTickets}
                        className="evd-qty-input"
                      />
                      
                      <button 
                        onClick={() => setQuantity(Math.min(event.availableTickets, quantity + 1))}
                        disabled={quantity >= event.availableTickets}
                        className="evd-qty-btn"
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="evd-total-row">
                <span>Total</span>
                <span className="evd-total-amount">
                  {event.price === 0 ? 'GRATIS' : `${(event.price * quantity).toFixed(2)}€`}
                </span>
              </div>

              {/* botón de añadir al carrito con 3 estados posibles */}
              <button
                className={`evd-add-cart-btn${isInCart ? ' added' : ''}${isSoldOut ? ' disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={isInCart || isSoldOut}
              >
                {/* agotado */}
                {isSoldOut ? (
                  <>
                    <i className="bi bi-lock"></i>
                    Agotado
                  </>
                ) : isInCart ? (
                  // ya añadido
                  <>
                    <i className="bi bi-check-circle"></i>
                    Ya en el carrito
                  </>
                ) : (
                  // dispoo
                  <>
                    <i className="bi bi-cart-plus"></i>
                    Añadir al carrito
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}