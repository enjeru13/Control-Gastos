import { Plus, Wallet } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../lib/currency'

const PIE_DATA = [
  { name: 'Alimentos', value: 50, color: '#1b667c' },
  { name: 'Transporte', value: 25, color: '#64a6bd' },
  { name: 'Ocio', value: 25, color: '#9f99ba' },
]

const CURRENCY_BALANCES = [
  { code: 'VES', label: 'Balance VES', amount: 3500, display: 'Bs. 3,500.00' },
  { code: 'COP', label: 'Balance COP', amount: 4200000, display: '$ 4,200,000' },
  { code: 'USD', label: 'Balance USD', amount: 8500, display: '$ 8,500.00' },
]

const RECENT_TRANSACTIONS = [
  {
    id: 1,
    label: 'Depósito Quincenal',
    time: 'Hoy, 09:00 AM',
    amount: '+$ 1,200.00',
    type: 'income',
  },
  {
    id: 2,
    label: 'Restaurante La Plaza',
    time: 'Ayer, 20:30 PM',
    amount: '-$ 45.00',
    type: 'expense',
  },
  {
    id: 3,
    label: 'Uber Viaje',
    time: 'Lun, 14:15 PM',
    amount: '-$ 12.50',
    type: 'expense',
  },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">

      {/* Hero Balance Card */}
      <section className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary to-tertiary-container text-on-primary">
          <div className="absolute top-[-40%] right-[-8%] w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wider opacity-80 uppercase">
              Saldo Total Estimado
            </span>
            <h2 className="text-4xl font-bold font-currency tracking-tight">
              $ 12,450.00
            </h2>
            <span className="text-xs opacity-70 mt-1">
              Última actualización: hace 5 min
            </span>
          </div>
        </div>

        {/* Currency Mini Cards */}
        <div className="grid grid-cols-3 gap-3">
          {CURRENCY_BALANCES.map(({ code, label, display }) => (
            <div
              key={code}
              className="bg-surface rounded-xl p-3 shadow-card flex flex-col gap-1"
            >
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="text-[10px] font-semibold tracking-wide uppercase">
                  {code}
                </span>
                <Wallet size={13} />
              </div>
              <p className="text-sm font-bold font-currency text-on-surface leading-tight">
                {display}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Charts + Transactions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Pie Chart */}
        <section className="bg-surface rounded-2xl p-5 shadow-card flex flex-col gap-4">
          <h3 className="text-base font-bold text-on-surface">Gastos por Categoría</h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={56}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {PIE_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `${v}%`}
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: 'none',
                      boxShadow: '0 4px 24px rgb(144 168 195/0.2)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {PIE_DATA.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-on-surface">{name}</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">
                    {value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="bg-surface rounded-2xl p-5 shadow-card flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-on-surface">Transacciones</h3>
            <button className="text-xs font-semibold text-primary hover:underline">
              Ver todas
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {RECENT_TRANSACTIONS.map(({ id, label, time, amount, type }) => (
              <div
                key={id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                      type === 'income'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-tertiary-container/30 text-tertiary',
                    ].join(' ')}
                  >
                    {type === 'income' ? '↓' : '↑'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-on-surface leading-tight">
                      {label}
                    </span>
                    <span className="text-xs text-on-surface-variant">{time}</span>
                  </div>
                </div>
                <span
                  className={[
                    'text-sm font-bold shrink-0',
                    type === 'income' ? 'text-primary' : 'text-tertiary',
                  ].join(' ')}
                >
                  {amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FAB */}
      <button
        aria-label="Agregar nueva transacción"
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-primary to-tertiary-container text-on-primary rounded-full shadow-overlay flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Plus size={26} />
      </button>
    </div>
  )
}
