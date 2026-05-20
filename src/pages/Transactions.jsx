import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, ArrowDown, ArrowUp, CalendarDays } from 'lucide-react'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories'
import { getCurrencySymbol } from '../lib/currency'
import { getIcon } from '../lib/categoryIcons'

const CURRENCIES = ['USD', 'VES', 'COP']

const schema = z.object({
  description: z.string().min(1, 'Requerido'),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  currency: z.enum(['USD', 'VES', 'COP', 'EUR']),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  date: z.string().min(1, 'Requerido'),
  notes: z.string().optional(),
})

const MOCK_TXS = [
  { id: 1, date: '2024-10-24', description: 'Almuerzo Sushi', category: 'Alimentación', categoryIcon: 'UtensilsCrossed', categoryColor: '#ef4444', amount: 35, currency: 'USD', type: 'expense', time: '14:30' },
  { id: 2, date: '2024-10-24', description: 'Pago Proyecto Freelance', category: 'Freelance', categoryIcon: 'Laptop', categoryColor: '#10b981', amount: 850, currency: 'USD', type: 'income', time: '09:15' },
  { id: 3, date: '2024-10-23', description: 'Gasolina', category: 'Transporte', categoryIcon: 'Car', categoryColor: '#f97316', amount: 1250000, currency: 'COP', type: 'expense', time: '18:45' },
  { id: 4, date: '2024-10-23', description: 'Supermercado', category: 'Alimentación', categoryIcon: 'UtensilsCrossed', categoryColor: '#ef4444', amount: 2450, currency: 'VES', type: 'expense', time: '11:20' },
  { id: 5, date: '2024-10-22', description: 'Salario Quincenal', category: 'Salario', categoryIcon: 'Briefcase', categoryColor: '#22c55e', amount: 1200, currency: 'USD', type: 'income', time: '09:00' },
]

function groupByDate(txs) {
  return txs.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = []
    acc[tx.date].push(tx)
    return acc
  }, {})
}

function dateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d >= today) return 'Hoy'
  if (d >= yesterday) return 'Ayer'
  return new Intl.DateTimeFormat('es', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(d)
}

function formatAmt(amount, currency) {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function Transactions() {
  const [txType, setTxType] = useState('expense')
  const [currency, setCurrency] = useState('USD')
  const [filter, setFilter] = useState('all')

  const categories = txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD', date: new Date().toISOString().slice(0, 10) },
  })

  function onSubmit(data) {
    console.log({ ...data, type: txType, currency })
    reset()
  }

  const filtered = MOCK_TXS.filter(
    (tx) => filter === 'all' || tx.type === (filter === 'income' ? 'income' : 'expense')
  )
  const grouped = groupByDate(filtered)

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

      {/* ── FORM ── */}
      <section className="md:col-span-2 flex flex-col gap-0">
        <div className="bg-surface rounded-2xl shadow-card p-5 flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary-container rounded-full blur-3xl opacity-40 pointer-events-none" />

          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center text-sm font-bold">
              +
            </div>
            <h2 className="text-lg font-bold text-on-surface">Registrar</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 relative z-10">

            {/* Type toggle */}
            <div className="flex bg-surface-container-low p-1 rounded-xl">
              {['expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTxType(t)}
                  className={[
                    'flex-1 py-2 text-center rounded-lg text-sm font-semibold transition-all',
                    txType === t
                      ? 'bg-surface shadow-sm text-primary'
                      : 'text-on-surface-variant hover:text-on-surface',
                  ].join(' ')}
                >
                  {t === 'expense' ? 'Egreso' : 'Ingreso'}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                Monto
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-on-surface-variant">
                  {getCurrencySymbol(currency)}
                </span>
                <input
                  {...register('amount')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={[
                    'w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-3.5 text-lg font-bold text-on-surface outline-none transition-all placeholder:text-outline font-currency',
                    errors.amount
                      ? 'border-error focus:ring-2 focus:ring-error/20'
                      : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10',
                  ].join(' ')}
                />
              </div>
              {errors.amount && (
                <span className="text-xs text-error">{errors.amount.message}</span>
              )}
            </div>

            {/* Currency */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                Moneda
              </label>
              <div className="flex gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={[
                      'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                      currency === c
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low',
                    ].join(' ')}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                Descripción
              </label>
              <input
                {...register('description')}
                type="text"
                placeholder="Ej. Almuerzo con cliente"
                className={[
                  'w-full bg-surface-container-low border rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all placeholder:text-outline',
                  errors.description
                    ? 'border-error focus:ring-2 focus:ring-error/20'
                    : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10',
                ].join(' ')}
              />
              {errors.description && (
                <span className="text-xs text-error">{errors.description.message}</span>
              )}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                Categoría
              </label>
              <div className="relative">
                <select
                  {...register('category_id')}
                  className={[
                    'w-full appearance-none bg-surface-container-low border rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all cursor-pointer',
                    errors.category_id
                      ? 'border-error'
                      : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10',
                  ].join(' ')}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                />
              </div>
              {errors.category_id && (
                <span className="text-xs text-error">{errors.category_id.message}</span>
              )}
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                Fecha
              </label>
              <div className="relative">
                <input
                  {...register('date')}
                  type="date"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                Nota <span className="font-normal opacity-60">(Opcional)</span>
              </label>
              <input
                {...register('notes')}
                type="text"
                placeholder="Ej. Compartido con Juan"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-outline"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-4 rounded-xl bg-gradient-to-b from-primary to-surface-tint text-on-primary text-sm font-bold shadow-card hover:shadow-overlay transition-all active:scale-[0.98]"
            >
              Guardar Movimiento
            </button>
          </form>
        </div>
      </section>

      {/* ── HISTORY ── */}
      <section className="md:col-span-3 flex flex-col gap-0">
        <div className="bg-surface rounded-2xl shadow-card flex flex-col h-full overflow-hidden">

          {/* Header */}
          <div className="p-5 border-b border-surface-container-highest flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Historial</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(new Date())}
              </p>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'income', label: 'Ingresos' },
                { key: 'expense', label: 'Egresos' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={[
                    'px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0',
                    filter === key
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="p-4 flex flex-col gap-1 overflow-y-auto max-h-[520px]">
            {Object.entries(grouped).map(([date, txs]) => (
              <div key={date}>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 py-2 mt-2 first:mt-0">
                  {dateLabel(date)}, {new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' }).format(new Date(date + 'T00:00:00'))}
                </div>
                {txs.map((tx) => {
                  const Icon = getIcon(tx.categoryIcon)
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: tx.categoryColor + '1a' }}
                        >
                          <Icon size={18} style={{ color: tx.categoryColor }} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-on-surface leading-tight">
                            {tx.description}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {tx.category} · {tx.time}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div
                          className={[
                            'text-sm font-bold font-currency',
                            tx.type === 'income' ? 'text-primary' : 'text-on-surface',
                          ].join(' ')}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatAmt(tx.amount, tx.currency)}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-semibold">
                          {tx.currency}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
