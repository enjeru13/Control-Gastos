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

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "bg-surface/90 backdrop-blur-md shadow-card" : "bg-surface",
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-4 py-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/configuracion")}
            className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-tertiary-container flex items-center justify-center text-on-primary font-bold text-sm overflow-hidden shrink-0 hover:ring-2 hover:ring-primary/30 transition-all active:scale-95"
            aria-label="Configuración"
          >
            {initials || <User size={18} />}
          </button>
          <h1 className="text-xl font-bold text-primary">
            Hola, {displayName.split(" ")[0]}
          </h1>
        </div>

        <button
          aria-label="Notificaciones"
          className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container transition-colors active:scale-95"
        >
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
