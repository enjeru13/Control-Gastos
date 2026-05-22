import { Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SettingsLayout() {
  const navigate = useNavigate();

  return (
    <div className="h-dvh w-full bg-background flex flex-col overflow-hidden overscroll-none">
      {/* Header con Glassmorphism y Safe Area (Notch) */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)]">
        <div
          className="flex items-center justify-between px-2 pb-3 pt-4 max-w-3xl mx-auto"
          style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>

          <h1 className="text-lg font-black text-on-surface tracking-tight">
            Configuración
          </h1>

          {/* Spacer del mismo tamaño que el botón (w-11) para un centrado perfecto */}
          <div className="w-11 shrink-0" />
        </div>
      </header>

      {/* Main con scroll interno para que el contenido pase por debajo del blur del header */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 overflow-y-auto overscroll-none scroll-smooth">
        <div
          style={{ paddingBottom: "max(40px, env(safe-area-inset-bottom))" }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
