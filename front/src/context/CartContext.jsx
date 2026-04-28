import { createContext, useContext, useState } from 'react'

// context para manejar el carrito de compras, con funciones para añadir, eliminar, actualizar cantidad y limpiar el carrito ---erorrrrrr

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const addToCart = (event) => {
    setCart(prev => {
      const id = event.idEvent || event.id
      const qty = event.qty || 1
      const exists = prev.find(i => (i.idEvent || i.id) === id)
      if (exists) return prev.map(i =>
        (i.idEvent || i.id) === id ? { ...i, qty: (i.qty || 1) + qty } : i
      )
      return [...prev, { ...event, qty }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => (i.idEvent || i.id) !== id))

  const updateQty = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return }
    setCart(prev => prev.map(i => (i.idEvent || i.id) === id ? { ...i, qty } : i))
  }

  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

// // hook -----------REVISAR
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider")
  return context
}