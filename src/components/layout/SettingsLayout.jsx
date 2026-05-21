import { Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SettingsLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-surface shadow-card">
        <div className="flex items-center justify-between px-4 py-4 max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container transition-colors active:scale-95"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-primary">Configuración</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-10">
        <Outlet />
      </main>
    </div>
  );
}
