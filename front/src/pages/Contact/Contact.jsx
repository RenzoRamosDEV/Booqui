import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import './ContactStyle.css'

const CONFETTI_COLORS = ['#7c3aed','#a78bfa','#4a1a6b','#f0abfc','#fbbf24','#34d399','#60a5fa']

// iconos de las secciones de features de abajo
const features = [
  {
    title: 'Eventos Premium',
    desc: 'Selección exclusiva de experiencias.',
    icon: <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="22" cy="22" r="18"/><path d="M22 10l3.09 6.26L32 17.27l-5 4.87 1.18 6.86L22 25.77l-6.18 3.23L17 22.14l-5-4.87 6.91-1.01L22 10z"/></svg>,
  },
  {
    title: 'Reserva segura',
    desc: 'Garantía de acceso y protección de datos.',
    icon: <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="22" cy="22" r="18"/><path d="M15 22l5 5 9-10" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    title: 'Entrada digital',
    desc: 'Recibe tus tickets al instante en tu email.',
    icon: <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="6" y="12" width="32" height="20" rx="3"/><path d="M6 20h32"/><circle cx="22" cy="26" r="2" fill="currentColor"/></svg>,
  },
  {
    title: 'Soporte 24/7',
    desc: 'Estamos aquí para ayudarte en cualquier momento.',
    icon: <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="22" cy="22" r="18"/><path d="M15 18a7 7 0 0114 0c0 5-7 8-7 8" strokeLinecap="round"/><circle cx="22" cy="33" r="1.2" fill="currentColor"/></svg>,
  },
]

// confeti animado para el modal de éxito
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.6}s`,
    duration: `${0.9 + Math.random() * 0.8}s`,
    size: `${6 + Math.random() * 8}px`,
  }))

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{ left: p.left, top: 0, width: p.size, height: p.size, background: p.color, animationDuration: p.duration, animationDelay: p.delay }}
        />
      ))}
    </>
  )
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // simula envío con timeout
  const handleSubmit = e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setTimeout(() => {
      setSent(true)
      setLoading(false)
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 900)
  }

  return (
    <div className="contact-page">

      {/* navbar compartido */}
      <Navbar />

      {/* espaciado para el navbar fijo */}
      <div className="contact-hero-spacer" />
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contacto</h1>
          <div className="contact-breadcrumb">
            <Link to="/">Inicio</Link>
            <span>›</span>
            <span>Contacto</span>
          </div>
        </div>
      </div>

      {/* layout principal: foto a la izquierda, formulario a la derecha */}
      <div className="contact-main">
        <div className="contact-image-wrapper">
          <img
            className="contact-image"
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
            alt="Grupo de amigos"
          />
        </div>

        <div className="contact-form-side">
          <p className="contact-eyebrow">Estamos aquí para ti</p>
          <h2>Ponte en contacto<br />con nosotros</h2>
          <p>
            Para más información sobre nuestros productos y servicios, no dudes
            en enviarnos un mensaje. ¡Nuestro equipo siempre estará ahí para ayudarte!
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="contact-fields-row">
              <div className="contact-field">
                <label htmlFor="name">Tu nombre</label>
                <input id="name" name="name" type="text" placeholder="Abc" value={form.name} onChange={handleChange} />
              </div>
              <div className="contact-field">
                <label htmlFor="email">Correo electrónico</label>
                <input id="email" name="email" type="email" placeholder="Abc@def.com" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="subject">Asunto <span style={{color:'#bbb',fontWeight:300}}>(opcional)</span></label>
              <input id="subject" name="subject" type="text" placeholder="¿En qué podemos ayudarte?" value={form.subject} onChange={handleChange} />
            </div>

            <div className="contact-field">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" name="message" placeholder="Escribe tu mensaje aquí..." value={form.message} onChange={handleChange} />
            </div>

            <button className="contact-submit" type="submit" disabled={loading}>
              {loading ? 'Enviando...' : '✉ Enviar mensaje'}
            </button>
          </form>
        </div>
      </div>

      {/* features de confianza */}
      <div className="contact-features">
        {features.map((f, i) => (
          <div className="contact-feature" key={i}>
            <div className="contact-feature-icon">{f.icon}</div>
            <div><h4>{f.title}</h4><p>{f.desc}</p></div>
          </div>
        ))}
      </div>

      {/* footer */}
      <footer>
        <div className="contact-footer">
          <Link to="/" className="contact-footer-logo">booqi</Link>
          <div className="contact-footer-links">
            <h5>Enlaces</h5>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/events">Eventos</Link></li>
              <li><Link to="/events">Categorías</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
            </ul>
          </div>
        </div>
        <div className="contact-footer-bottom">2026 booqi. Todos los derechos reservados</div>
      </footer>

      {/* modal de confirmación con confeti */}
      {sent && (
        <div className="contact-success-overlay" onClick={() => setSent(false)}>
          <div className="contact-success-card" onClick={e => e.stopPropagation()}>
            <Confetti />
            <div className="contact-success-icon">🎉</div>
            <h3>¡Mensaje enviado!</h3>
            <p>
              Gracias por contactarnos. Nuestro equipo revisará tu mensaje
              y te responderá lo antes posible.
            </p>
            <button className="contact-success-close" onClick={() => setSent(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
