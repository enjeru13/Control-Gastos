import { useState } from 'react'
import {
  Plus, MoreVertical, ChevronRight,
  Smartphone, Plane, Shield, Sofa, Headphones,
  BookOpen, Star, TrendingUp, PiggyBank,
  CreditCard, User, Home, Car, Receipt, AlertCircle,
} from 'lucide-react'

// ── Mock data ──────────────────────────────────────────────

const SAVINGS_GOALS = [
  { id: 1, name: 'Nuevo Celular',      category: 'Electrónica',  Icon: Smartphone, bgColor: '#cfe5ff', iconColor: '#314960', current: 800,  target: 1200, currency: 'USD' },
  { id: 2, name: 'Viaje a Europa',     category: 'Experiencias', Icon: Plane,       bgColor: '#cae2ff', iconColor: '#4d657d', current: 4250, target: 5000, currency: 'USD' },
  { id: 3, name: 'Fondo de Emergencia',category: 'Seguridad',    Icon: Shield,      bgColor: '#e5deff', iconColor: '#474360', current: 1500, target: 3000, currency: 'USD' },
  { id: 4, name: 'Laptop Nueva',       category: 'Trabajo',      Icon: TrendingUp,  bgColor: '#b6ebff', iconColor: '#004e60', current: 200,  target: 1800, currency: 'USD' },
]

const WISHLIST_ITEMS = [
  { id: 1, name: 'Silla Ergonómica',           priority: 'high',   category: 'Oficina',    price: 450, currency: 'USD', Icon: Sofa,       bgColor: '#e5deff' },
  { id: 2, name: 'Audífonos Noise Cancelling', priority: 'medium', category: 'Tech',       price: 299, currency: 'USD', Icon: Headphones, bgColor: '#d8e3fb' },
  { id: 3, name: 'Colección de Libros Diseño', priority: 'low',    category: 'Educación',  price: 120, currency: 'USD', Icon: BookOpen,   bgColor: '#e7eeff' },
]

const DEBT_TYPE_META = {
  credit_card:    { label: 'Tarjeta de Crédito', Icon: CreditCard, color: '#ba1a1a' },
  personal_loan:  { label: 'Préstamo Personal',  Icon: User,       color: '#f97316' },
  mortgage:       { label: 'Hipoteca',           Icon: Home,       color: '#8b5cf6' },
  car_loan:       { label: 'Préstamo Vehicular', Icon: Car,        color: '#3b82f6' },
  student_loan:   { label: 'Préstamo Estudiantil',Icon: BookOpen,  color: '#14b8a6' },
  other:          { label: 'Otra Deuda',         Icon: Receipt,    color: '#6b7280' },
}

const DEBTS = [
  { id: 1, name: 'Tarjeta Visa',      type: 'credit_card',   total: 2500, paid: 800,  currency: 'USD', interest_rate: 24.5, due_date: '2025-12-01' },
  { id: 2, name: 'Préstamo Personal', type: 'personal_loan', total: 5000, paid: 2000, currency: 'USD', interest_rate: null, due_date: null },
  { id: 3, name: 'Auto',              type: 'car_loan',      total: 8000, paid: 3200, currency: 'USD', interest_rate: 12,   due_date: '2026-06-01' },
]

// ── Helpers ────────────────────────────────────────────────

function fmtAmt(amount, currency = 'USD') {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency', currency,
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount)
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const PRIORITY_BADGE = {
  high:   { label: 'Alta',  className: 'bg-error-container text-on-error-container' },
  medium: { label: 'Media', className: 'bg-surface-variant text-on-surface-variant' },
  low:    { label: 'Baja',  className: 'bg-surface text-on-surface-variant border border-outline-variant' },
}

// ── Sub-components ─────────────────────────────────────────

function GoalCard({ goal }) {
  const { name, category, Icon, bgColor, iconColor, current, target, currency } = goal
  const pct = Math.min(Math.round((current / target) * 100), 100)
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-card border border-surface-container hover:shadow-overlay transition-shadow duration-300 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bgColor }}>
            <Icon size={18} style={{ color: iconColor }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">{name}</h3>
            <p className="text-xs text-on-surface-variant">{category}</p>
          </div>
        </div>
        <button className="text-outline hover:text-on-surface transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-surface-container">
          <MoreVertical size={16} />
        </button>
      </div>
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-xl font-bold font-currency text-on-surface">{fmtAmt(current, currency)}</span>
          <span className="text-xs text-on-surface-variant">de {fmtAmt(target, currency)}</span>
        </div>
        <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-tertiary-fixed-dim to-primary transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 text-right">
          <span className="text-xs font-bold text-primary">{pct}%</span>
        </div>
      </div>
    </div>
  )
}

function WishlistItem({ item }) {
  const { name, priority, category, price, currency, Icon, bgColor } = item
  const badge = PRIORITY_BADGE[priority]
  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group border-b border-surface-container-high/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bgColor }}>
          <Icon size={22} className="text-on-surface-variant" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>{badge.label}</span>
            {category && <span className="text-xs text-on-surface-variant">{category}</span>}
          </div>
        </div>
      </div>
      <span className="text-base font-bold text-on-surface shrink-0 ml-2">{fmtAmt(price, currency)}</span>
    </div>
  )
}

function DebtCard({ debt }) {
  const { name, type, total, paid, currency, interest_rate, due_date } = debt
  const meta = DEBT_TYPE_META[type] ?? DEBT_TYPE_META.other
  const { Icon, color, label } = meta
  const remaining = total - paid
  const pct = Math.min(Math.round((paid / total) * 100), 100)
  const days = daysUntil(due_date)
  const urgent = days !== null && days <= 30

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-surface-container overflow-hidden hover:shadow-overlay transition-shadow duration-300">
      {/* Left accent bar */}
      <div className="flex">
        <div className="w-1 shrink-0 rounded-l-2xl" style={{ backgroundColor: color }} />
        <div className="flex-1 p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: color + '1a' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">{name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-on-surface-variant">{label}</span>
                  {interest_rate && (
                    <span className="text-[10px] font-bold bg-error-container/50 text-on-error-container px-1.5 py-0.5 rounded-full">
                      {interest_rate}% anual
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button className="text-outline hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-container">
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Amounts */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Restante</p>
              <p className="text-xl font-bold font-currency" style={{ color }}>{fmtAmt(remaining, currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant mb-0.5">Pagado</p>
              <p className="text-sm font-bold text-success font-currency">{fmtAmt(paid, currency)}</p>
            </div>
          </div>

          {/* Progress bar (inverted — rojo a verde al pagar) */}
          <div>
            <div className="w-full h-3 bg-error/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-error to-success transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-on-surface-variant">Total {fmtAmt(total, currency)}</span>
              <span className="text-xs font-bold text-success">{pct}% pagado</span>
            </div>
          </div>

          {/* Due date warning */}
          {due_date && (
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl ${urgent ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'}`}>
              <AlertCircle size={13} />
              {urgent ? `Vence en ${days} días` : `Vence: ${new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(due_date + 'T00:00:00'))}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────

const TABS = [
  { key: 'goals',    label: 'Ahorros'  },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'debts',    label: 'Deudas'   },
]

export default function Metas() {
  const [activeTab, setActiveTab] = useState('goals')

  const totalSavings  = SAVINGS_GOALS.reduce((s, g) => s + g.current, 0)
  const wishlistTotal = WISHLIST_ITEMS.reduce((s, i) => s + i.price, 0)
  const totalDebt     = DEBTS.reduce((s, d) => s + (d.total - d.paid), 0)

  const nearestGoal = [...SAVINGS_GOALS].sort((a, b) => b.current / b.target - a.current / a.target)[0]
  const nearestPct  = Math.round((nearestGoal.current / nearestGoal.target) * 100)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Summary Bento ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 bg-primary-container text-on-primary-container rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-card">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-fixed opacity-30 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 opacity-90">
              <PiggyBank size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Ahorro Total</span>
            </div>
            <div className="text-4xl font-bold font-currency mt-1">{fmtAmt(totalSavings, 'USD')}</div>
          </div>
          <div className="relative z-10 mt-5">
            <button className="bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm">
              <Plus size={16} /> Aportar
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-surface rounded-2xl p-4 shadow-card flex items-center gap-3 flex-1 border border-surface-container-high/40">
            <div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <Plane size={20} />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-on-surface-variant mb-0.5 uppercase tracking-wide">Próxima Meta</div>
              <div className="text-sm font-bold text-on-surface">{nearestGoal.name}</div>
              <div className="text-xs font-semibold text-primary mt-0.5">{nearestPct}% completado</div>
            </div>
          </div>

          <div className="bg-error-container/40 rounded-2xl p-4 shadow-card flex items-center gap-3 flex-1 border border-error-container">
            <div className="w-11 h-11 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-on-surface-variant mb-0.5 uppercase tracking-wide">Total Deudas</div>
              <div className="text-sm font-bold text-error">{fmtAmt(totalDebt, 'USD')}</div>
              <div className="text-xs font-semibold text-on-surface-variant mt-0.5">{DEBTS.length} deudas activas</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tab switcher ── */}
      <div className="flex bg-surface-container-low p-1 rounded-xl">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={[
              'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all',
              activeTab === key
                ? 'bg-surface shadow-sm text-primary'
                : 'text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Savings Goals ── */}
      {activeTab === 'goals' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface">Metas de Ahorro</h2>
              <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-[10px] font-bold">
                {SAVINGS_GOALS.length} Activas
              </span>
            </div>
            <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Ver todas <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAVINGS_GOALS.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
          </div>
          <button
            aria-label="Nueva meta"
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-primary to-tertiary-container text-on-primary rounded-full shadow-overlay flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
            style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
          >
            <Plus size={26} />
          </button>
        </section>
      )}

      {/* ── Wishlist ── */}
      {activeTab === 'wishlist' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface">Wishlist</h2>
              <Star size={16} className="text-tertiary" fill="currentColor" />
            </div>
            <button className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-surface-variant transition-colors active:scale-95">
              <Plus size={18} />
            </button>
          </div>
          <div className="bg-surface rounded-3xl shadow-card border border-surface-container overflow-hidden">
            {WISHLIST_ITEMS.map((item) => <WishlistItem key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* ── Deudas ── */}
      {activeTab === 'debts' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface">Mis Deudas</h2>
              <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                {DEBTS.length} activas
              </span>
            </div>
            <button className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-surface-variant transition-colors active:scale-95">
              <Plus size={18} />
            </button>
          </div>

          {/* Debt total summary */}
          <div className="bg-error-container/30 border border-error-container rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Deuda Total Pendiente</p>
              <p className="text-2xl font-bold text-error font-currency mt-0.5">{fmtAmt(totalDebt, 'USD')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant">Pagado</p>
              <p className="text-sm font-bold text-success font-currency">
                {fmtAmt(DEBTS.reduce((s, d) => s + d.paid, 0), 'USD')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {DEBTS.map((debt) => <DebtCard key={debt.id} debt={debt} />)}
          </div>

          <button
            aria-label="Nueva deuda"
            className="fixed right-4 w-14 h-14 bg-gradient-to-br from-error to-tertiary text-on-primary rounded-full shadow-overlay flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
            style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
          >
            <Plus size={26} />
          </button>
        </section>
      )}

    </div>
  )
}
