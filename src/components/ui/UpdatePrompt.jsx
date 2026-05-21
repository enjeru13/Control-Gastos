import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 inset-x-0 z-200 flex justify-center px-4 pointer-events-none">
      <div className="bg-surface border border-primary/20 shadow-overlay rounded-2xl px-4 py-3 flex items-center gap-3 pointer-events-auto max-w-sm w-full">
        <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0">
          <RefreshCw size={15} />
        </div>
        <p className="flex-1 text-xs font-semibold text-on-surface">
          Nueva versión disponible
        </p>
        <button
          onClick={() => updateServiceWorker(true)}
          className="text-xs font-bold text-primary hover:underline active:scale-95 transition-all whitespace-nowrap"
        >
          Actualizar
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
