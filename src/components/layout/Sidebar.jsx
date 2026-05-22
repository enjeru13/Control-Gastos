import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Heart,
  BarChart3,
  Settings,
  Wallet,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transacciones", label: "Transacciones", icon: ArrowLeftRight },
  { to: "/ahorros", label: "Ahorros", icon: PiggyBank },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/configuracion", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-65 shrink-0 min-h-screen bg-surface/50 backdrop-blur-xl border-r border-outline-variant/20 px-4 py-8 z-40">
      {/* ── Logo / Brand ── */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-tertiary-container flex items-center justify-center text-on-primary shadow-lg shadow-primary/30">
          <Wallet size={20} strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-black text-on-surface tracking-tight">
          Finanzas
        </span>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex flex-col gap-2 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm transition-all duration-300 outline-none",
                isActive
                  ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20"
                  : "text-on-surface-variant font-semibold hover:bg-surface-container-high hover:text-on-surface hover:translate-x-1",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={[
                    "transition-transform duration-300",
                    isActive
                      ? "scale-110"
                      : "group-hover:scale-110 group-hover:-rotate-3",
                  ].join(" ")}
                />
                <span className="tracking-wide">{label}</span>

                {/* Puntito indicador para la pestaña activa */}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-in zoom-in duration-300" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer del Sidebar (Espacio para info o estatus) ── */}
      <div className="mt-auto pt-8 px-2">
        <div className="bg-linear-to-br from-surface-container to-surface-container-high p-4 rounded-2xl border border-outline-variant/30 relative overflow-hidden">
          {/* Brillo decorativo */}
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-1">
            <p className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Estado del Sistema
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-[11px] font-medium text-on-surface-variant">
                Todo funcionando al 100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
