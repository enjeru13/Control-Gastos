import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Landmark } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const CURRENCIES = [
  { code: 'USD', label: 'USD' },
  { code: 'VES', label: 'VES' },
  { code: 'COP', label: 'COP' },
]

export default function Register() {
  const { signUp, user, loading } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [currency, setCurrency]   = useState('USD')
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)
  const [errors, setErrors]       = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  function validate() {
    const e = {}
    if (!fullName.trim()) e.fullName = 'Ingresa tu nombre'
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email inválido'
    if (password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (confirm !== password) e.confirm = 'Las contraseñas no coinciden'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setErrors({})
    try {
      await signUp(email, password, fullName.trim(), currency)
      setSuccess(true)
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(202,226,255,0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(229,222,255,0.4) 0px, transparent 50%)',
        backgroundColor: '#f9f9ff',
      }}
    >
      <main className="w-full max-w-md mx-auto">

        {/* Logo above card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container text-primary mb-4 shadow-sm">
            <Landmark size={32} strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Crea tu cuenta</h1>
          <p className="text-sm text-secondary">Empieza a gestionar tus finanzas hoy mismo</p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl p-6 md:p-8 shadow-[0_8px_32px_rgba(144,168,195,0.15)]"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.4)',
          }}
        >
          {success ? (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail size={28} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-on-surface mb-1">¡Revisa tu email!</h2>
                <p className="text-sm text-on-surface-variant">
                  Enviamos un enlace de confirmación a <strong>{email}</strong>.
                  Confirma tu cuenta para continuar.
                </p>
              </div>
              <Link to="/login" className="text-sm font-bold text-primary hover:underline mt-2">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full name */}
              <Field
                icon={User}
                label="Nombre completo"
                type="text"
                value={fullName}
                onChange={(v) => { setFullName(v); setErrors((x) => ({ ...x, fullName: '' })) }}
                placeholder="Ej. Juan Pérez"
                error={errors.fullName}
              />

              {/* Email */}
              <Field
                icon={Mail}
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(v) => { setEmail(v); setErrors((x) => ({ ...x, email: '' })) }}
                placeholder="tu@correo.com"
                error={errors.email}
              />

              {/* Password */}
              <Field
                icon={Lock}
                label="Contraseña"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(v) => { setPassword(v); setErrors((x) => ({ ...x, password: '' })) }}
                placeholder="••••••••"
                error={errors.password}
                rightAction={
                  <button type="button" onClick={() => setShowPw((s) => !s)}
                    className="text-outline hover:text-on-surface transition-colors">
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />

              {/* Confirm password */}
              <Field
                icon={Lock}
                label="Confirmar contraseña"
                type={showCf ? 'text' : 'password'}
                value={confirm}
                onChange={(v) => { setConfirm(v); setErrors((x) => ({ ...x, confirm: '' })) }}
                placeholder="••••••••"
                error={errors.confirm}
                rightAction={
                  <button type="button" onClick={() => setShowCf((s) => !s)}
                    className="text-outline hover:text-on-surface transition-colors">
                    {showCf ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />

              {/* Currency picker */}
              <div className="pt-1">
                <label className="block text-sm font-semibold text-on-surface mb-3">
                  Moneda principal de uso
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CURRENCIES.map(({ code, label }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCurrency(code)}
                      className={[
                        'flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-sm font-bold transition-all active:scale-[0.96]',
                        currency === code
                          ? 'bg-primary border-primary text-on-primary shadow-sm'
                          : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low',
                      ].join(' ')}
                    >
                      <span className="text-base mb-0.5">
                        {code === 'USD' ? '🇺🇸' : code === 'VES' ? '🇻🇪' : '🇨🇴'}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {errors.general && (
                <p className="text-xs text-error text-center bg-error-container/40 rounded-xl px-4 py-3">
                  {errors.general}
                </p>
              )}

              {/* Submit */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-lg text-sm font-bold text-on-primary flex items-center justify-center active:scale-[0.98] transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(180deg, #1b667c 0%, #004e60 100%)' }}
                >
                  {submitting ? 'Creando cuenta...' : 'Registrarse'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Login link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-secondary">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-sm font-bold text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

      </main>
    </div>
  )
}

// ── Reusable field ─────────────────────────────────────────

function Field({ icon: Icon, label, type, value, onChange, placeholder, error, rightAction }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-on-surface">{label}</label>
      <div className={[
        'relative flex items-center rounded-lg border bg-surface-container-lowest transition-all',
        error
          ? 'border-error focus-within:ring-4 focus-within:ring-error/10'
          : 'border-outline-variant focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10',
      ].join(' ')}>
        <Icon size={17} className={`absolute left-3 ${error ? 'text-error' : 'text-outline'} pointer-events-none shrink-0`} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pl-10 pr-10 bg-transparent text-sm text-on-surface placeholder:text-outline/60 outline-none rounded-lg"
        />
        {rightAction && (
          <div className="absolute right-3">{rightAction}</div>
        )}
      </div>
      {error && <p className="text-xs text-error px-1">{error}</p>}
    </div>
  )
}
