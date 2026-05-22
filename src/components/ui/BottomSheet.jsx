import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";

export default function BottomSheet({ open, title, onClose, children }) {
  return (
    // Z-index [70] para asegurarnos de que quede por encima del BottomNav (z-50)
    <Dialog open={open} onClose={onClose} className="relative z-70">
      {/* Backdrop (Fondo de cristal oscuro tipo iOS) */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 ease-out data-closed:opacity-0 data-closed:backdrop-blur-none"
      />

      {/* Sheet container */}
      <div
        // pointer-events-none aquí permite que el clic en el fondo oscuro cierre el modal
        className="fixed inset-0 flex items-end justify-center pointer-events-none"
      >
        <DialogPanel
          transition
          // pointer-events-auto restaura los clics dentro del panel
          className="w-full max-w-lg bg-surface rounded-t-4xl shadow-[0_-16px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-outline-variant/20 flex flex-col max-h-[92dvh] outline-none transition-all duration-300 ease-out data-closed:translate-y-full pointer-events-auto"
        >
          {/* Drag handle (La pastilla de arriba, estilo nativo) */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full" />
          </div>

          {/* Header Premium */}
          <div className="flex items-center justify-between px-6 pb-4 pt-1 shrink-0">
            <h3 className="text-xl font-black text-on-surface tracking-tight">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors active:scale-95 shrink-0"
              aria-label="Cerrar"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Separador elegante con degradado (fade a los lados) */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-outline-variant/30 to-transparent shrink-0" />

          {/* Scrollable body */}
          <div
            className="overflow-y-auto overscroll-contain px-6 py-6 flex flex-col gap-5"
            // Más espacio abajo para respirar
            style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}
          >
            {children}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
