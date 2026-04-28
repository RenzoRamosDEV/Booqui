import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllEvents, getEventsByCategory, getEventsByTitle } from '../../api/eventService'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'
import './EventsStyle.css'

const CATEGORIES = ['Todas', 'Música', 'Arte', 'Deporte', 'Gastronomía', 'Tecnología', 'Educación', 'Otros']

const PLACEHOLDER_IMGS = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=70',
  'https://images.unsplash.com/photo-1601924582975-5c6d4e9b1d98?w=400&q=70',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=70',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=70',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=70',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=70',
]

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [searchInput, setSearchInput] = useState('')
  const { cart, addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // recarga cuando cambia la categoría activa
  useEffect(() => {
    const loadEvents = () => {
      setLoading(true)
      const req = activeCategory === 'Todas' ? getAllEvents() : getEventsByCategory(activeCategory)
      req.then(r => setEvents(r.data || [])).catch(() => setEvents([])).finally(() => setLoading(false))
    }
    
    loadEvents()
  }, [activeCategory])

  const loadEvents = () => {
    setLoading(true)
    const req = activeCategory === 'Todas' ? getAllEvents() : getEventsByCategory(activeCategory)
    req.then(r => setEvents(r.data || [])).catch(() => setEvents([])).finally(() => setLoading(false))
  }

  // busca por título, si está vacío recarga todo
  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchInput.trim()) { loadEvents(); return }
    setLoading(true)
    getEventsByTitle(searchInput.trim())
      .then(r => setEvents(r.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }

  const isInCart = (id) => cart?.some(i => i.idEvent === id || i.id === id)

  // si no hay sesión redirige al login antes de añadir
  const handleAdd = (e, event) => {
    e.stopPropagation()
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    addToCart(event)
  }

  return (
    <div className="ev-root">

      {/* navbar compartido */}
      <Navbar />

      {/* hero con imagen y breadcrumb */}
      <section className="ev-hero">
        <div className="ev-hero-bg" />
        <div className="ev-hero-overlay" />
        <div className="ev-hero-content">
          <h1>Eventos</h1>
          <div className="ev-breadcrumb">
            <Link to="/">Inicio</Link>
            <span>›</span>
            Eventos
          </div>
        </div>
      </section>

      {/* barra de filtros por categoría y búsqueda */}
      <div className="ev-toolbar">
        <div className="ev-category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`ev-cat-tab${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="ev-toolbar-right">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="ev-search"
              placeholder="Buscar eventos..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="ev-nav-btn ev-nav-btn-solid" style={{ borderRadius: 8 }}>Buscar</button>
          </form>
          <span className="ev-show-label">{events.length} eventos</span>
        </div>
      </div>

      {/* grid de tarjetas */}
      <div className="ev-grid-wrap">
        <div className="ev-grid">
          {loading
            ? Array(12).fill(0).map((_, i) => (
                <div key={i} style={{ height: 300 }} className="ev-skeleton" />
              ))
            : events.length === 0
              ? (
                <div className="ev-empty">
                  <h3>No hay eventos disponibles</h3>
                  <p>Prueba con otra categoría o búsqueda</p>
                </div>
              )
              : events.map((ev, i) => {
                  const added = isInCart(ev.idEvent)
                  const isNew = i < 3
                  const isSoldOut = ev.availableTickets === 0
                  const isLowStock = ev.availableTickets > 0 && ev.availableTickets <= 10 && !isSoldOut
                  
                  return (
                    <div 
                      key={ev.idEvent || i} 
                      className={`ev-card${isSoldOut ? ' sold-out' : ''}`}
                      onClick={() => navigate(`/events/${ev.idEvent}`)}
                    >
                      <div className="ev-card-img">
                        <img
                          src={ev.urlImage || PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length]}
                          alt={ev.title}
                          onError={e => { e.target.src = PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length] }}
                        />
                        {isSoldOut && <span className="ev-badge ev-badge-soldout">AGOTADO</span>}
                        {!isSoldOut && isLowStock && <span className="ev-badge ev-badge-low">ÚLTIMAS</span>}
                        {!isSoldOut && !isLowStock && isNew && !ev.urlImage && <span className="ev-badge ev-badge-new">New</span>}
                      </div>
                      
                      <div className="ev-card-body">
                        <div className="ev-card-title">{ev.title}</div>
                        <div className="ev-card-location">{ev.location}</div>
                        {ev.startDate && (
                          <div className="ev-card-meta">
                            📅 {new Date(ev.startDate).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' })}
                          </div>
                        )}
                        
                        <div className="ev-card-footer">
                          <div>
                            <div className="ev-stock-info">
                              {isSoldOut ? (
                                <span className="stock-text soldout">Sin entradas</span>
                              ) : (
                                <span className="stock-text">{ev.availableTickets} disponibles</span>
                              )}
                            </div>
                            <span className="ev-card-price">
                              {ev.price === 0 ? 'Gratis' : `${ev.price}€`}
                            </span>
                          </div>
                          
                          <button
                            className={`ev-add-btn${added ? ' added' : ''}${isSoldOut ? ' disabled' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              if (!isSoldOut && !added) handleAdd(e, ev)
                            }}
                            disabled={added || isSoldOut}
                          >
                            {isSoldOut ? 'Agotado' : added ? '✓ Añadido' : '+ Carrito'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
          }
        </div>
      </div>

    </div>
  )
}