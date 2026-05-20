import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Target, Calculator } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio',       icon: LayoutDashboard, end: true },
  { to: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { to: '/metas',       label: 'Metas',       icon: Target },
  { to: '/herramientas',label: 'Herramientas',icon: Calculator },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface-container/95 backdrop-blur-md border-t border-outline-variant/30 rounded-t-2xl shadow-[0_-4px_24px_0_rgb(144_168_195/0.15)]">
      <div
        className="flex items-center justify-around px-4 pt-2 max-w-3xl mx-auto"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-200',
                isActive
                  ? 'text-primary scale-110'
                  : 'text-on-surface-variant opacity-60 hover:opacity-100 scale-100',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={['leading-none transition-all duration-200', isActive ? 'text-[11px] font-bold' : 'text-[10px] font-semibold'].join(' ')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
