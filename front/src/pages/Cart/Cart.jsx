import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'
import './CartStyle.css'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&q=60'

export default function Cart() {
  const { cart, removeFromCart, updateQty } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Cálculo de totales con la comisión del 5%
  const subtotal = cart?.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0) || 0
  const serviceFee = cart?.length > 0 ? parseFloat((subtotal * 0.05).toFixed(2)) : 0
  const total = parseFloat((subtotal + serviceFee).toFixed(2))

  const handleCheckout = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="cart-root">
      <Navbar />

      <div className="cart-hero">
        <h1>Carrito</h1>
        <div className="cart-breadcrumb">
          <Link to="/">Inicio</Link>
          <span>›</span>
          <span>Carrito</span>
        </div>
      </div>

      <div className="cart-main">
        {!cart || cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>Aún no has añadido ningún evento.</p>
            <Link to="/events" className="cart-empty-btn">Explorar eventos</Link>
          </div>
        ) : (
          <>
            <div className="cart-table-wrap">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Entrada</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => {
                    const id = item.idEvent || item.id
                    const qty = item.qty || 1
                    const lineTotal = ((item.price || 0) * qty).toFixed(2)
                    
                    return (
                      <tr key={id || i}>
                        <td>
                          <div className="cart-item-cell">
                            <img 
                              className="cart-item-img" 
                              src={item.urlImage || PLACEHOLDER} 
                              alt={item.title} 
                              onError={e => { e.target.src = PLACEHOLDER }} 
                            />
                            <div>
                              <div className="cart-item-name">{item.title}</div>
                              <div className="cart-item-location">{item.location}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="cart-price">
                            {item.price === 0 ? 'Gratis' : `${item.price}€`}
                          </span>
                        </td>
                        <td>
                          <div className="cart-qty-wrap">
                            <button className="cart-qty-btn" onClick={() => updateQty(id, qty - 1)}>−</button>
                            <span className="cart-qty-num">{qty}</span>
                            <button className="cart-qty-btn" onClick={() => updateQty(id, qty + 1)}>+</button>
                          </div>
                        </td>
                        <td><span className="cart-total-cell">{lineTotal}€</span></td>
                        <td>
                          <button className="cart-delete-btn" onClick={() => removeFromCart(id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="cart-summary">
              <h2>Total</h2>
              {cart.map((item, i) => (
                <div className="cart-summary-row" key={i}>
                  <span>{item.title}</span>
                  <span>{((item.price || 0) * (item.qty || 1)).toFixed(2)}€</span>
                </div>
              ))}
              {serviceFee > 0 && (
                <div className="cart-summary-row">
                  <span>Gestión (5%)</span>
                  <span>{serviceFee.toFixed(2)}€</span>
                </div>
              )}
              <div className="cart-summary-total">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
              <button className="cart-buy-btn" onClick={handleCheckout}>Comprar</button>
              <Link to="/events" className="cart-continue-link">← Seguir explorando</Link>
            </div>
          </>
        )}
      </div>

      {/* Footer y Features omitidos por brevedad pero mantenidos igual que tu original */}
    </div>
  )
}