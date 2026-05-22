import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Calculator,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/herramientas", label: "Herramientas", icon: Calculator },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl border-t border-outline-variant/20 rounded-t-4xl shadow-[0_-8px_30px_0_rgba(0,0,0,0.05)]">
      <div
        className="flex items-center justify-around px-2 pt-3 pb-2 max-w-md mx-auto"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            // group nos ayuda a animar elementos internos al hacer hover/active
            className="group flex flex-col items-center gap-1.5 px-2 py-1 relative outline-none webkit-tap-transparent"
          >
            {({ isActive }) => (
              <>
                {/* Contenedor del ícono (Píldora animada) */}
                <div
                  className={[
                    "relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 overflow-hidden",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-transparent text-on-surface-variant group-hover:text-on-surface",
                  ].join(" ")}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={[
                      "relative z-10 transition-transform duration-300",
                      isActive
                        ? "scale-110"
                        : "scale-100 group-hover:-translate-y-0.5",
                    ].join(" ")}
                  />
                </div>

                {/* Texto */}
                <span
                  className={[
                    "tracking-wide transition-all duration-300",
                    isActive
                      ? "text-[11px] font-bold text-on-surface"
                      : "text-[10px] font-medium text-on-surface-variant group-hover:text-on-surface",
                  ].join(" ")}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
