import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('booqi_user')) || null 
    } catch { 
      return null 
    }
  })

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('booqi_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('booqi_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
// hook personalizado que da error pero no entiendo, igual arranca la web -----------REVISAR
export const useAuth = () => useContext(AuthContext) 