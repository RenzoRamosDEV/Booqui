import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUser } from '../../api/userService'
import './RegisterStyle.css'

const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80',
    title: <>Descubre eventos<br />que te <em>inspiran.</em></>,
    sub: 'Únete a miles de personas que ya disfrutan de los mejores eventos.',
  },
  {
    url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
    title: <>Tu próxima<br /><em>aventura</em> te espera.</>,
    sub: 'Conciertos, talleres, festivales y mucho más a un clic de distancia.',
  },
  {
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    title: <>Vive momentos<br />que <em>importan.</em></>,
    sub: 'Crea recuerdos únicos con las personas que más quieres.',
  },
]

export default function Register() {
  const [current, setCurrent] = useState(0)
  const [textVisible, setTextVisible] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '',
    contactEmail: '', contactPhone: '', password: '', confirm: '',
    role: 'CUSTOMER',
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTextVisible(false)
      setTimeout(() => { setCurrent(prev => (prev + 1) % SLIDES.length); setTextVisible(true) }, 400)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const goTo = (i) => { setTextVisible(false); setTimeout(() => { setCurrent(i); setTextVisible(true) }, 300) }
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.firstName || !form.lastName || !form.contactEmail || !form.password || !form.dateOfBirth) {
      setError('Por favor completa todos los campos obligatorios.'); return
    }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)
    try {
      await createUser({
        firstName: form.firstName, lastName: form.lastName, dateOfBirth: form.dateOfBirth,
        contactEmail: form.contactEmail, contactPhone: form.contactPhone || null,
        password: form.password, role: form.role,
      })
      setSuccess('¡Cuenta creada correctamente! Redirigiendo...')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      if (err.response?.status === 409) setError('Este email ya está registrado.')
      else if (err.response?.status === 400) setError('Datos inválidos. Revisa los campos.')
      else setError('Error de conexión. ¿Está el servidor arriba?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reg-root">

      {/* LEFT */}
      <div className="reg-left">
        {SLIDES.map((s, i) => (
          <div key={i} className={`reg-slide${i === current ? ' active' : ''}`}
            style={{ backgroundImage: `url('${s.url}')` }} />
        ))}
        <div className="reg-left-overlay" />
        <div className="reg-left-content">
          <span className="reg-left-top-label">booqi — eventos</span>
          <div className="reg-tagline">
            <h2 style={{ opacity: textVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
              {SLIDES[current].title}
            </h2>
            <p style={{ opacity: textVisible ? 1 : 0, transition: 'opacity 0.4s ease 0.1s' }}>
              {SLIDES[current].sub}
            </p>
          </div>
          <div className="reg-dots">
            {SLIDES.map((_, i) => (
              <button key={i} className={`reg-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="reg-right">
        <Link to="/" className="reg-logo-top">
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '3rem', color: '#6d28d9', letterSpacing: '-2px', lineHeight: 1 }}>
            booqi
          </span>
        </Link>

        <div className="reg-form-wrapper">
          <div className="reg-form-header">
            <h1>Crear cuenta</h1>
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="reg-error">{error}</div>}
            {success && <div className="reg-success">{success}</div>}

            <div className="reg-row">
              <div className="reg-field">
                <label>Nombre *</label>
                <input name="firstName" placeholder="Ana" value={form.firstName} onChange={handleChange} />
              </div>
              <div className="reg-field">
                <label>Apellido *</label>
                <input name="lastName" placeholder="García" value={form.lastName} onChange={handleChange} />
              </div>
            </div>

            <div className="reg-field">
              <label>Email *</label>
              <input name="contactEmail" type="email" placeholder="tu@email.com" value={form.contactEmail} onChange={handleChange} />
            </div>

            <div className="reg-row">
              <div className="reg-field">
                <label>Fecha de nacimiento *</label>
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
              </div>
              <div className="reg-field">
                <label>Teléfono</label>
                <input name="contactPhone" placeholder="+34 600 000 000" value={form.contactPhone} onChange={handleChange} />
              </div>
            </div>

            <div className="reg-row">
              <div className="reg-field">
                <label>Contraseña *</label>
                <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
              </div>
              <div className="reg-field">
                <label>Confirmar *</label>
                <input name="confirm" type="password" placeholder="••••••••" value={form.confirm} onChange={handleChange} />
              </div>
            </div>

            <button className="reg-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="reg-btn-loading"><span className="reg-spinner" />Creando cuenta...</span>
              ) : 'Crear cuenta'}
            </button>
          </form>

          <div className="reg-login-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </div>
      </div>

    </div>
  )
}