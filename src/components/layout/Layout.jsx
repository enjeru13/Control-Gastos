import { RefreshCw } from "lucide-react";
import { useState, useRef } from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import PageTransition from "./PageTransition";
import UpdatePrompt from "../ui/UpdatePrompt";

const PULL_THRESHOLD = 80; // Un poco más largo para evitar recargos accidentales
const PULL_MAX = 120;

export default function Layout() {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(null);
  const mainRef = useRef(null);

  function onTouchStart(e) {
    if (mainRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }

  function onTouchMove(e) {
    if (touchStartY.current === null) return;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Solo permitimos el pull si estamos hasta arriba del todo
    if (dy > 0 && mainRef.current?.scrollTop === 0) {
      setPullY(Math.min(dy * 0.45, PULL_MAX));
    }
  }

  function onTouchEnd() {
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(0);
      touchStartY.current = null;
      // Damos tiempo a que gire un poco antes de recargar la ventana
      setTimeout(() => window.location.reload(), 600);
    } else {
      setPullY(0);
      touchStartY.current = null;
    }
  }

  return (
    // Agregamos overscroll-none al body/root para evitar que el navegador interfiera
    <div className="h-dvh w-full bg-background flex flex-col overflow-hidden overscroll-none relative">
      <Header />

      {/* Pull-to-refresh indicator (Estilo Nativo Píldora Flotante) */}
      <div
        className="absolute left-1/2 z-60 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-surface text-primary shadow-xl ring-1 ring-outline-variant/20 pointer-events-none"
        style={{
          // Baja desde arriba de la pantalla. Si está refreshing, se queda fijo a 80px.
          top: refreshing ? "80px" : "-50px",
          transform: `translateY(${refreshing ? 0 : pullY * 0.9}px) scale(${Math.min(Math.max(pullY / (PULL_THRESHOLD * 0.8), 0), 1)})`,
          opacity: pullY > 10 || refreshing ? 1 : 0,
          transition: refreshing
            ? "top 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease"
            : "none",
        }}
      >
        <RefreshCw
          size={20}
          strokeWidth={2.5}
          className={refreshing ? "animate-spin" : ""}
          style={{
            transform: `rotate(${refreshing ? 0 : pullY * 4}deg)`,
          }}
        />
      </div>

      {/* El main ahora maneja su propio scroll internamente (overflow-y-auto).
        Esto es clave para el Glassmorphism del BottomNav y Header.
      */}
      <main
        ref={mainRef}
        className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 overflow-y-auto overflow-x-hidden overscroll-none pb-[calc(7rem+env(safe-area-inset-bottom))] scroll-smooth"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <PageTransition />
      </main>

      <BottomNav />
      <UpdatePrompt />
    </div>
  );
}
