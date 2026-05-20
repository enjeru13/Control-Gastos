import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Target, Calculator } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { to: '/metas', label: 'Metas', icon: Target },
  { to: '/herramientas', label: 'Herramientas', icon: Calculator },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface-container/95 backdrop-blur-md border-t border-outline-variant/30 rounded-t-2xl shadow-[0_-4px_24px_0_rgb(144_168_195/0.15)]">
      <div className="flex items-center justify-around px-4 pt-2 max-w-3xl mx-auto" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 transition-all duration-200 active:scale-90',
                isActive
                  ? 'bg-primary-container text-on-primary-container rounded-full px-5 py-1.5 min-w-[72px]'
                  : 'text-on-surface-variant opacity-70 hover:opacity-100 w-16 py-1.5 rounded-xl hover:bg-surface-container-high',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
