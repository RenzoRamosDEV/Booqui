import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import logo from '../../assets/logo_booqi_nuevo.png'
import './NavbarStyle.css'

const S = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', flexWrap: 'nowrap',
    height: '68px', padding: '0 3rem',
    background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.3s',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', flexShrink: 0 },
  links: { display: 'flex', alignItems: 'center', gap: '2rem', flex: 1, justifyContent: 'center', listStyle: 'none', margin: 0, padding: 0 },
  actions: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 },
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { cart } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const cartCount = cart?.reduce((s, i) => s + (i.qty || 1), 0) || 0

  return (
    <nav
      id="booqi-navbar"
      className={`nav-root${scrolled ? ' scrolled' : ''}`}
      style={scrolled ? { ...S.nav, boxShadow: '0 2px 20px rgba(0,0,0,0.08)' } : S.nav}
    >
      <Link to="/" className="nav-logo" style={S.logo}>
        <img src={logo} alt="booqi" className="nav-logo-img" />
        <span className="nav-logo-text">booqi</span>
      </Link>

      <div className="nav-links" style={S.links}>
        <Link to="/">Inicio</Link>
        <Link to="/events">Eventos</Link>
        <Link to="/contact">Contacto</Link>
        {user?.role === 'ADMIN' && <Link to="/admin">Panel Admin</Link>}
      </div>

      <div className="nav-actions" style={S.actions}>
        {user ? (
          <>
            <span className="nav-hello">Hola, {user.firstName}</span>
            <Link to="/my-bookings" className="nav-btn nav-btn-ghost">🎫 Mis reservas</Link>
            <Link to="/cart" className="nav-btn nav-btn-ghost">
              🛒 {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </Link>
            <button className="nav-btn nav-btn-ghost" onClick={logout}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn nav-btn-ghost">Iniciar sesión</Link>
            <Link to="/register" className="nav-btn nav-btn-solid">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  )
}
