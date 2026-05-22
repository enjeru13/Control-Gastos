import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X, Sparkles } from "lucide-react";

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-10 inset-x-0 z-200 flex justify-center px-4 pointer-events-none">
      <div
        // Animación de entrada fluida (slide y fade) + Glassmorphism
        className="bg-surface/85 backdrop-blur-2xl border border-outline-variant/30 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] rounded-[1.5rem] p-2 pr-3 flex items-center gap-3 pointer-events-auto max-w-sm w-full animate-in slide-in-from-bottom-10 fade-in duration-500"
      >
        {/* Ícono animado con fondo suave */}
        <div className="relative w-11 h-11 rounded-[1rem] bg-linear-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
          {/* Pequeño destello pulsante de fondo */}
          <div className="absolute inset-0 rounded-[1rem] bg-primary/20 animate-ping opacity-20"></div>
          <RefreshCw size={20} strokeWidth={2.5} className="text-primary" />
        </div>

        {/* Textos a dos líneas para mejor jerarquía */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[13px] font-black text-on-surface leading-tight tracking-tight flex items-center gap-1.5">
            Actualización lista
            <Sparkles size={12} className="text-primary" />
          </p>
          <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">
            Nuevas mejoras disponibles
          </p>
        </div>

        {/* Botón CTA (Call To Action) principal */}
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25 shrink-0"
        >
          Actualizar
        </button>

        {/* Botón secundario para cerrar */}
        <button
          onClick={() => setNeedRefresh(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0"
          aria-label="Cerrar notificación"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
