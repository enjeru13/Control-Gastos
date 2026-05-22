import { useState, useEffect } from "react";
import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Display name: profile.full_name → user metadata → email prefix → fallback
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuario";

  // Initials for avatar
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Saludo dinámico según la hora del dispositivo
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)]"
          : "bg-surface/0 border-b border-transparent",
      ].join(" ")}
    >
      {/* Añadimos un padding top dinámico por si se instala como PWA en móviles (notch) */}
      <div
        className="flex items-center justify-between px-4 pb-3 pt-4 max-w-3xl mx-auto"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3.5">
          {/* Avatar Premium */}
          <button
            onClick={() => navigate("/configuracion")}
            className="relative w-11 h-11 rounded-full bg-linear-to-br from-primary to-tertiary-container flex items-center justify-center text-on-primary font-bold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:ring-4 hover:ring-primary/10 transition-all active:scale-95 shrink-0"
            aria-label="Configuración"
          >
            {initials || <User size={18} strokeWidth={2.5} />}
          </button>

          {/* Textos a dos líneas */}
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              {getGreeting()}
            </span>
            <h1 className="text-xl font-black text-on-surface leading-tight tracking-tight">
              {displayName.split(" ")[0]}
            </h1>
          </div>
        </div>

        {/* Campana de Notificaciones con indicador */}
        <button
          aria-label="Notificaciones"
          className="relative w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors active:scale-95"
        >
          <Bell size={22} strokeWidth={2} />
          {/* Puntito de "Nueva notificación" (puedes ocultarlo con un render condicional luego) */}
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}
