import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import logo from '../../assets/logo_booqi_nuevo.png'
import './NavbarStyle.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { cart } = useCart()

  // añade sombra al navbar cuando el usuario hace scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // total de entradas en el carrito
  const cartCount = cart?.reduce((s, i) => s + (i.qty || 1), 0) || 0

  return (
    <nav className={`nav-root${scrolled ? ' scrolled' : ''}`}>

      {/* logo: imagen del ticket + texto */}
      <Link to="/" className="nav-logo">
        <img src={logo} alt="booqi" className="nav-logo-img" />
        <span className="nav-logo-text">booqi</span>
      </Link>

      {/* links centrales — panel admin solo si el rol es ADMIN */}
      <div className="nav-links">
        <Link to="/">Inicio</Link>
        <Link to="/events">Eventos</Link>
        <Link to="/contact">Contacto</Link>
        {user?.role === 'ADMIN' && (
          <Link to="/admin">Panel Admin</Link>
        )}
      </div>

      {/* acciones de la derecha según sesión */}
      <div className="nav-actions">
        {user ? (
          <>
            <span className="nav-hello">Hola, {user.firstName}</span>
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
