import { useState, useEffect } from 'react'
import { Bell, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'bg-surface/90 backdrop-blur-md shadow-card'
          : 'bg-surface',
      ].join(' ')}
    >
      <div className="flex items-center justify-between px-4 py-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/configuracion')}
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant overflow-hidden shrink-0 hover:ring-2 hover:ring-primary/30 transition-all active:scale-95"
            aria-label="Configuración"
          >
            <User size={20} />
          </button>
          <h1 className="text-xl font-bold text-primary">Hola, Usuario</h1>
        </div>

        <button
          aria-label="Notificaciones"
          className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container transition-colors active:scale-95"
        >
          <Bell size={20} />
        </button>
      </div>
    </header>
  )
}
