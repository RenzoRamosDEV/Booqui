// Panel de administración solo funciona si el usuario tiene el rol de Admin (Los roles se gestionan aun desde la bdd xd)

import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllUsers, deleteUser } from '../../api/userService'
import { getAllEvents, deleteEvent } from '../../api/eventService'
import { getAllBookings } from '../../api/bookingService'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'
import PDFPreviewModal from '../../components/PDFPreviewModal/PDFPreviewModal'
import CreateEventModal from '../../components/Admin/CreateEventModal'
import { downloadEventReport, getEventReportPDFUrl } from './exportEventReport'
import './AdminStyle.css'

const TAB_USERS = 'users'
const TAB_EVENTS = 'events'
const TAB_SALES = 'sales'

const FILTER_ALL = 'all'
const FILTER_APPROVED = 'APPROVED'
const FILTER_REJECTED = 'REJECTED'
const FILTER_PENDING = 'PENDING'

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(TAB_USERS)

  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)

  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)
  const [salesLoaded, setSalesLoaded] = useState(false)
  const [salesFilter, setSalesFilter] = useState(FILTER_ALL)

  const [exportingEvent, setExportingEvent] = useState(null)
  const [selectedEventFilter, setSelectedEventFilter] = useState('all')
  
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null)
  const [previewTitle, setPreviewTitle] = useState('')
 
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Función para cargar ventas - MEMORIZADA CON USECALLBACK
  const loadSalesData = useCallback(async () => {
    if (loadingSales) return
    setLoadingSales(true)
    try {
      const [bookingsData, paymentsData] = await Promise.all([
        getAllBookings().then(r => r.data || []).catch(() => []),
        fetch(`${import.meta.env.VITE_PAYMENT_API}`)
          .then(r => r.json())
          .catch(() => [])
      ])
      setBookings(bookingsData)
      setPayments(paymentsData)
      setSalesLoaded(true)
    } catch (err) {
      console.error('Error cargando ventas:', err)
    } finally {
      setLoadingSales(false)
    }
  }, [loadingSales])

  // Cargar usuarios y eventos al montar
  useEffect(() => {
    getAllUsers()
      .then(r => setUsers(r.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false))
    getAllEvents()
      .then(r => setEvents(r.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false))
  }, [])

  // PRECARGAR VENTAS automáticamente al montar el componente (si es admin)
  useEffect(() => {
    if (user?.role === 'ADMIN' && !salesLoaded && !loadingSales) {
      loadSalesData()
    }
  }, [user, salesLoaded, loadingSales, loadSalesData])

  // Cargar ventas solo cuando se accede a la pestaña de ventas (por si acaso)
  useEffect(() => {
    if (tab === TAB_SALES && !salesLoaded && !loadingSales) {
      loadSalesData()
    }
  }, [tab, salesLoaded, loadingSales, loadSalesData])

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`¿Eliminar usuario ${email}?`)) return
    try {
      await deleteUser(email)
      setUsers(prev => prev.filter(u => u.contactEmail !== email))
    } catch {
      alert('Error al eliminar usuario.')
    }
  }

  const handleDeleteEvent = async (email) => {
    if (!window.confirm(`¿Eliminar este evento?`)) return
    try {
      await deleteEvent(email)
      setEvents(prev => prev.filter(e => e.contactEmail !== email))
    } catch {
      alert('Error al eliminar evento.')
    }
  }

  const handleLogout = () => { 
    logout()
    navigate('/login')
  }

  const refreshEvents = () => {
    setLoadingEvents(true)
    getAllEvents()
      .then(r => setEvents(r.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false))
  }

  const handleEventCreated = (newEvent) => {
    refreshEvents()
    console.log('Evento creado:', newEvent)
  }

  const admins = users.filter(u => u.role === 'ADMIN').length
  const customers = users.filter(u => u.role === 'CUSTOMER').length

  const salesRows = payments.map(p => {
    const booking = bookings.find(b => b.bookingId === p.bookingId) || {}
    return { ...p, booking }
  })

  const filteredSales = salesRows
    .filter(r => salesFilter === FILTER_ALL || r.paymentStatus === salesFilter || r.status === salesFilter)
    .filter(r => selectedEventFilter === 'all' || r.booking?.eventId === selectedEventFilter || r.booking?.eventTitle === selectedEventFilter)

  const totalApproved = salesRows
    .filter(r => r.paymentStatus === 'APPROVED' || r.status === 'APPROVED')
    .reduce((sum, r) => sum + (r.amount || r.booking?.totalPrice || 0), 0)

  const totalRejected = salesRows
    .filter(r => r.paymentStatus === 'REJECTED' || r.status === 'REJECTED')
    .reduce((sum, r) => sum + (r.amount || r.booking?.totalPrice || 0), 0)

  const totalPending = salesRows
    .filter(r => r.paymentStatus === 'PENDING' || r.status === 'PENDING')
    .reduce((sum, r) => sum + (r.amount || r.booking?.totalPrice || 0), 0)

  const eventOptions = Array.from(
    salesRows.reduce((map, r) => {
      const id = r.booking?.eventId || r.booking?.eventTitle || null
      const title = r.booking?.eventTitle || null
      if (id && title && !map.has(id)) map.set(id, title)
      return map
    }, new Map())
  )

  const getEventSales = (eventId, eventTitle) => {
    if (!salesLoaded) return []
    const filtered = salesRows.filter(r => 
      String(r.booking?.eventId) === String(eventId) || 
      r.booking?.eventTitle === eventTitle
    )
    
    return filtered.map(sale => {
      const booking = sale.booking || {}
      return {
        paymentId: sale.paymentId,
        id: sale.paymentId,
        status: sale.paymentStatus || sale.status || 'APPROVED',
        paymentStatus: sale.paymentStatus || sale.status || 'APPROVED',
        amount: sale.amount || booking.totalPrice || 0,
        totalPrice: sale.amount || booking.totalPrice || 0,
        paymentMethod: sale.paymentMethod || 'CREDIT_CARD',
        ticketQuantity: booking.ticketQuantity || 1,
        booking: {
          firstName: booking.userFirstName || booking.firstName || 'Cliente',
          lastName: booking.userLastName || booking.lastName || '',
          email: booking.userEmail || booking.email || '',
          userFirstName: booking.userFirstName || booking.firstName || 'Cliente',
          userLastName: booking.userLastName || booking.lastName || '',
          userEmail: booking.userEmail || booking.email || '',
          ticketQuantity: booking.ticketQuantity || 1,
          totalPrice: sale.amount || booking.totalPrice || 0,
          eventId: booking.eventId || eventId,
          eventTitle: booking.eventTitle || eventTitle
        }
      }
    })
  }

  const handlePreviewEventReport = async (eventId, eventTitle, salesData = null) => {
    setExportingEvent(eventId)
    try {
      let eventSales = salesData
      if (!eventSales) {
        eventSales = getEventSales(eventId, eventTitle)
      }
      
      if (eventSales.length === 0) {
        alert('No hay ventas registradas para este evento.')
        setExportingEvent(null)
        return
      }
      
      const pdfUrl = await getEventReportPDFUrl({
        eventTitle,
        eventId,
        sales: eventSales,
        generatedBy: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Administrador',
      })
      
      setPreviewPdfUrl(pdfUrl)
      setPreviewTitle(`Informe: ${eventTitle}`)
      setPreviewModalOpen(true)
    } catch (err) {
      console.error('Error generando previsualización:', err)
      alert('Error al generar la previsualización del informe.')
    } finally {
      setExportingEvent(null)
    }
  }

  const handleDownloadEventReport = async (eventId, eventTitle, salesData = null) => {
    setExportingEvent(eventId)
    try {
      let eventSales = salesData
      if (!eventSales) {
        eventSales = getEventSales(eventId, eventTitle)
      }
      
      if (eventSales.length === 0) {
        alert('No hay ventas registradas para este evento.')
        setExportingEvent(null)
        return
      }
      
      await downloadEventReport({
        eventTitle,
        eventId,
        sales: eventSales,
        generatedBy: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Administrador',
      })
    } catch (err) {
      console.error('Error generando informe:', err)
      alert('Error al generar el informe PDF.')
    } finally {
      setExportingEvent(null)
    }
  }

  const handleExportAllReport = async () => {
    if (filteredSales.length === 0) {
      alert('No hay ventas con los filtros seleccionados.')
      return
    }
    
    setExportingEvent('__all__')
    try {
      await downloadEventReport({
        eventTitle: 'Todos los eventos',
        eventId: 'GLOBAL',
        sales: filteredSales,
        generatedBy: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Administrador',
      })
    } catch (err) {
      console.error('Error generando informe:', err)
      alert('Error al generar el informe PDF.')
    } finally {
      setExportingEvent(null)
    }
  }

  const handlePreviewAllReport = async () => {
    if (filteredSales.length === 0) {
      alert('No hay ventas con los filtros seleccionados.')
      return
    }
    
    setExportingEvent('__all_preview__')
    try {
      const pdfUrl = await getEventReportPDFUrl({
        eventTitle: 'Todos los eventos',
        eventId: 'GLOBAL',
        sales: filteredSales,
        generatedBy: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Administrador',
      })
      
      setPreviewPdfUrl(pdfUrl)
      setPreviewTitle('Informe Global - Todos los eventos')
      setPreviewModalOpen(true)
    } catch (err) {
      console.error('Error generando previsualización:', err)
      alert('Error al generar la previsualización del informe.')
    } finally {
      setExportingEvent(null)
    }
  }

  return (
    <div className="adm-root">
      <Navbar />

      <PDFPreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false)
          if (previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl)
            setPreviewPdfUrl(null)
          }
        }}
        pdfUrl={previewPdfUrl}
        title={previewTitle}
      />

      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <aside className="adm-sidebar">
        <div className="adm-sidebar-label">Panel</div>

        <button className={`adm-sidebar-item${tab === TAB_USERS ? ' active' : ''}`} onClick={() => setTab(TAB_USERS)}>
          <i className="bi bi-people-fill"></i> Usuarios
        </button>

        <button className={`adm-sidebar-item${tab === TAB_EVENTS ? ' active' : ''}`} onClick={() => setTab(TAB_EVENTS)}>
          <i className="bi bi-calendar-event-fill"></i> Eventos
        </button>

        <button className={`adm-sidebar-item${tab === TAB_SALES ? ' active' : ''}`} onClick={() => setTab(TAB_SALES)}>
          <i className="bi bi-currency-dollar"></i> Ventas
        </button>

        <div className="adm-sidebar-label">Navegación</div>

        <Link to="/" className="adm-sidebar-item">
          <i className="bi bi-house-door"></i> Inicio
        </Link>

        <Link to="/events" className="adm-sidebar-item">
          <i className="bi bi-search"></i> Ver eventos
        </Link>

        <div className="adm-sidebar-bottom">
          <button className="adm-logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left"></i> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-topbar">
          <h1>Panel de administración</h1>
          <div className="adm-topbar-user">
            <i className="bi bi-person-circle me-2"></i>
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
        </div>

        <div className="adm-stats">
          <div className="adm-stat">
            <div className="adm-stat-icon"><i className="bi bi-people text-primary"></i></div>
            <div className="adm-stat-label">Usuarios totales</div>
            <div className="adm-stat-value">{loadingUsers ? '—' : users.length}</div>
            <div className="adm-stat-sub">{admins} admin · {customers} clientes</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-icon"><i className="bi bi-ticket-perforated text-success"></i></div>
            <div className="adm-stat-label">Eventos totales</div>
            <div className="adm-stat-value">{loadingEvents ? '—' : events.length}</div>
            <div className="adm-stat-sub">En catálogo activo</div>
          </div>
          <div className="adm-stat">
            <div className="adm-stat-icon"><i className="bi bi-tags text-warning"></i></div>
            <div className="adm-stat-label">Categorías</div>
            <div className="adm-stat-value">{loadingEvents ? '—' : new Set(events.map(e => e.category)).size}</div>
            <div className="adm-stat-sub">Tipos de evento</div>
          </div>
          {tab === TAB_SALES ? (
            <div className="adm-stat">
              <div className="adm-stat-icon"><i className="bi bi-cash-stack text-info"></i></div>
              <div className="adm-stat-label">Ingresos aprobados</div>
              <div className="adm-stat-value">{loadingSales ? '—' : `${totalApproved.toFixed(0)}€`}</div>
              <div className="adm-stat-sub">{salesRows.length} pagos en total</div>
            </div>
          ) : (
            <div className="adm-stat">
              <div className="adm-stat-icon"><i className="bi bi-graph-up text-info"></i></div>
              <div className="adm-stat-label">Precio medio</div>
              <div className="adm-stat-value">
                {loadingEvents || events.length === 0 ? '—' :
                  `${(events.reduce((s, e) => s + (e.price || 0), 0) / events.length).toFixed(0)}€`}
              </div>
              <div className="adm-stat-sub">Por evento</div>
            </div>
          )}
        </div>

        <div className="adm-tabs">
          <button className={`adm-tab${tab === TAB_USERS ? ' active' : ''}`} onClick={() => setTab(TAB_USERS)}>
            <i className="bi bi-person-lines-fill me-2"></i> Usuarios ({users.length})
          </button>
          <button className={`adm-tab${tab === TAB_EVENTS ? ' active' : ''}`} onClick={() => setTab(TAB_EVENTS)}>
            <i className="bi bi-calendar3 me-2"></i> Eventos ({events.length})
          </button>
          <button className={`adm-tab${tab === TAB_SALES ? ' active' : ''}`} onClick={() => setTab(TAB_SALES)}>
            <i className="bi bi-cart-check-fill me-2"></i> Ventas {salesLoaded ? `(${salesRows.length})` : '(cargando...)'}
          </button>
        </div>

        {tab === TAB_USERS && (
          <div className="adm-card">
            <div className="adm-card-header">
              <h2><i className="bi bi-person-badge me-2"></i>Usuarios registrados</h2>
              <span className="adm-card-count">{users.length} total</span>
            </div>
            {loadingUsers ? (
              <div className="adm-loading">
                <div className="adm-skeleton" />
                <div className="adm-skeleton" />
              </div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Rol</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.idUser}>
                      <td style={{ color: '#ccc', fontSize: '0.78rem' }}>#{u.idUser}</td>
                      <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                      <td>{u.contactEmail}</td>
                      <td>{u.contactPhone || '—'}</td>
                      <td>
                        <span className={`adm-badge ${u.role === 'ADMIN' ? 'adm-badge-admin' : 'adm-badge-customer'}`}>
                          <i className={u.role === 'ADMIN' ? 'bi bi-shield-lock me-1' : 'bi bi-person me-1'}></i>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.contactEmail !== user?.contactEmail && (
                          <button className="adm-delete-btn" onClick={() => handleDeleteUser(u.contactEmail)}>
                            <i className="bi bi-trash3"></i> Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === TAB_EVENTS && (
          <div className="adm-card">
            <div className="adm-card-header">
              <h2><i className="bi bi-calendar-check me-2"></i>Eventos en catálogo</h2>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="adm-card-count">{events.length} total</span>
                <button 
                  className="adm-create-event-btn"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <i className="bi bi-plus-circle"></i>
                  Nuevo evento
                </button>
              </div>
            </div>
            {loadingEvents ? (
              <div className="adm-loading">
                <div className="adm-skeleton" />
              </div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Título</th><th>Categoría</th><th>Ubicación</th>
                    <th>Precio</th><th>Tickets</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => {
                    const eventSales = getEventSales(ev.idEvent, ev.title)
                    const hasSales = eventSales.length > 0
                    
                    return (
                      <tr key={ev.idEvent}>
                        <td style={{ color: '#ccc', fontSize: '0.78rem' }}>#{ev.idEvent}</td>
                        <td style={{ fontWeight: 500, maxWidth: 200 }}>{ev.title}</td>
                        <td><span className="adm-badge adm-badge-customer">{ev.category}</span></td>
                        <td><i className="bi bi-geo-alt me-1"></i>{ev.location}</td>
                        <td>{ev.price === 0 ? 'Gratis' : `${ev.price}€`}</td>
                        <td><i className="bi bi-ticket-detailed me-1"></i>{ev.availableTickets}</td>
                        <td style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {salesLoaded ? (
                            hasSales ? (
                              <>
                                <button
                                  className="adm-preview-btn"
                                  onClick={() => handlePreviewEventReport(ev.idEvent, ev.title, eventSales)}
                                  disabled={exportingEvent === ev.idEvent}
                                  title="Vista previa del informe"
                                >
                                  <i className="bi bi-eye"></i> Ver
                                </button>
                                <button
                                  className="adm-export-btn"
                                  onClick={() => handleDownloadEventReport(ev.idEvent, ev.title, eventSales)}
                                  disabled={exportingEvent === ev.idEvent}
                                  title="Descargar informe"
                                >
                                  {exportingEvent === ev.idEvent
                                    ? <><span className="adm-export-spinner"></span></>
                                    : <><i className="bi bi-download"></i> PDF</>
                                  }
                                </button>
                              </>
                            ) : (
                              <span className="adm-no-sales-badge" style={{ fontSize: '0.7rem', color: '#999' }}>
                                <i className="bi bi-info-circle me-1"></i> Sin ventas
                              </span>
                            )
                          ) : (
                            <span className="adm-loading-badge" style={{ fontSize: '0.7rem', color: '#7c3aed' }}>
                              <span className="adm-export-spinner" style={{ marginRight: '4px' }}></span>
                              Cargando...
                            </span>
                          )}
                          <button className="adm-delete-btn" onClick={() => handleDeleteEvent(ev.contactEmail)}>
                            <i className="bi bi-trash3"></i>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === TAB_SALES && (
          <div className="adm-card">
            <div className="adm-card-header">
              <h2><i className="bi bi-receipt-cutoff me-2"></i>Ventas y facturas</h2>

              <div className="adm-sales-header-controls">
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {[
                    { key: FILTER_ALL, label: 'Todos', icon: 'bi-funnel' },
                    { key: FILTER_APPROVED, label: 'Aprobados', icon: 'bi-check-circle' },
                    { key: FILTER_REJECTED, label: 'Rechazados', icon: 'bi-x-circle' },
                    { key: FILTER_PENDING, label: 'Pendientes', icon: 'bi-clock-history' },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setSalesFilter(f.key)}
                      className={`adm-tab${salesFilter === f.key ? ' active' : ''}`}
                      style={{ padding: '3px 12px', fontSize: '0.78rem' }}
                    >
                      <i className={`${f.icon} me-1`}></i> {f.label}
                    </button>
                  ))}
                </div>

                {eventOptions.length > 0 && (
                  <select
                    className="adm-event-select"
                    value={selectedEventFilter}
                    onChange={e => setSelectedEventFilter(e.target.value)}
                    title="Filtrar por evento"
                  >
                    <option value="all">Todos los eventos</option>
                    {eventOptions.map(([id, title]) => (
                      <option key={id} value={id}>{title}</option>
                    ))}
                  </select>
                )}

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {selectedEventFilter !== 'all' && (
                    <>
                      <button
                        className="adm-preview-btn"
                        onClick={() => {
                          const found = eventOptions.find(([id]) => id === selectedEventFilter)
                          if (found) handlePreviewEventReport(found[0], found[1], filteredSales)
                        }}
                        disabled={!!exportingEvent || filteredSales.length === 0}
                        title="Previsualizar informe del evento seleccionado"
                      >
                        <i className="bi bi-eye me-1"></i> Ver
                      </button>
                      <button
                        className="adm-export-btn"
                        onClick={() => {
                          const found = eventOptions.find(([id]) => id === selectedEventFilter)
                          if (found) handleDownloadEventReport(found[0], found[1], filteredSales)
                        }}
                        disabled={!!exportingEvent || filteredSales.length === 0}
                        title="Descargar informe del evento seleccionado"
                      >
                        {exportingEvent && exportingEvent !== '__all__' && exportingEvent !== '__all_preview__'
                          ? <><span className="adm-export-spinner"></span></>
                          : <><i className="bi bi-download me-1"></i> PDF</>
                        }
                      </button>
                    </>
                  )}

                  <button
                    className="adm-preview-btn adm-preview-btn-outline"
                    onClick={handlePreviewAllReport}
                    disabled={!!exportingEvent || filteredSales.length === 0}
                    title="Previsualizar informe global"
                  >
                    <i className="bi bi-eye me-1"></i> Ver todo
                  </button>

                  <button
                    className="adm-export-btn adm-export-btn-outline"
                    onClick={handleExportAllReport}
                    disabled={!!exportingEvent || filteredSales.length === 0}
                    title="Descargar informe global"
                  >
                    {exportingEvent === '__all__'
                      ? <><span className="adm-export-spinner"></span></>
                      : <><i className="bi bi-download me-1"></i> Descargar todo</>
                    }
                  </button>
                </div>
              </div>
            </div>

            {loadingSales ? (
              <div className="adm-loading">
                <div className="adm-skeleton" />
                <div style={{ textAlign: 'center', padding: '1rem', color: '#7c3aed' }}>
                  <span className="adm-export-spinner" style={{ marginRight: '8px' }}></span>
                  Cargando datos de ventas...
                </div>
              </div>
            ) : filteredSales.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#bbb' }}>
                <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}></i>
                No hay ventas con ese filtro
              </div>
            ) : (
              <>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Evento</th>
                      <th>Tickets</th>
                      <th>Importe</th>
                      <th>Método</th>
                      <th>Pago</th>
                      <th>Reserva</th>
                      <th>Informe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map(row => {
                      const b = row.booking
                      const amount = row.amount || b?.totalPrice || 0
                      const payStatus = row.paymentStatus || row.status || '—'

                      const payColor = payStatus === 'APPROVED' ? 'adm-badge-approved'
                        : payStatus === 'REJECTED' ? 'adm-badge-rejected'
                        : 'adm-badge-pending'

                      const bookingStatus = b?.status || '—'
                      const bookingColor = bookingStatus === 'CONFIRMED' ? 'adm-badge-approved'
                        : bookingStatus === 'CANCELLED' ? 'adm-badge-rejected'
                        : 'adm-badge-pending'

                      const evId = b?.eventId || b?.eventTitle
                      const evTitle = b?.eventTitle || '—'

                      return (
                        <tr key={row.paymentId || row.id}>
                          <td style={{ color: '#ccc', fontSize: '0.78rem' }}>#{row.paymentId || row.id}</td>
                          <td style={{ fontWeight: 500 }}>
                            {b?.userFirstName ? `${b.userFirstName} ${b.userLastName || ''}` : b?.userEmail || '—'}
                          </td>
                          <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {evTitle}
                          </td>
                          <td style={{ textAlign: 'center' }}>{b?.ticketQuantity || '—'}</td>
                          <td style={{ fontWeight: 600 }}>{amount ? `${Number(amount).toFixed(2)}€` : '—'}</td>
                          <td><i className="bi bi-credit-card me-1"></i> {row.paymentMethod || '—'}</td>
                          <td><span className={`adm-badge ${payColor}`}>{payStatus}</span></td>
                          <td><span className={`adm-badge ${bookingColor}`}>{bookingStatus}</span></td>
                          <td>
                            {evId ? (
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                <button
                                  className="adm-preview-btn-row"
                                  onClick={() => handlePreviewEventReport(evId, evTitle, [row])}
                                  disabled={exportingEvent === evId}
                                  title="Vista previa"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button
                                  className="adm-export-btn-row"
                                  onClick={() => handleDownloadEventReport(evId, evTitle, [row])}
                                  disabled={exportingEvent === evId}
                                  title="Descargar factura"
                                >
                                  {exportingEvent === evId
                                    ? <span className="adm-export-spinner"></span>
                                    : <i className="bi bi-download"></i>
                                  }
                                </button>
                              </div>
                            ) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <div className="adm-sales-summary">
                  <div className="adm-sales-sum-item adm-sum-approved">
                    <span><i className="bi bi-check-lg"></i> Aprobados</span>
                    <strong>{totalApproved.toFixed(2)}€</strong>
                  </div>
                  <div className="adm-sales-sum-item adm-sum-pending">
                    <span><i className="bi bi-hourglass-split"></i> Pendientes</span>
                    <strong>{totalPending.toFixed(2)}€</strong>
                  </div>
                  <div className="adm-sales-sum-item adm-sum-rejected">
                    <span><i className="bi bi-x-lg"></i> Rechazados</span>
                    <strong>{totalRejected.toFixed(2)}€</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}