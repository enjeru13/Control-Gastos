import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Landmark } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background: "linear-gradient(135deg, #f9f9ff 0%, #e7eeff 100%)",
      }}
    >
      <main className="w-full max-w-md mx-auto">
        {/* Glass card */}
        <div
          className="rounded-2xl p-8 md:p-10 flex flex-col gap-10"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 4px 24px rgba(144,168,195,0.15)",
          }}
        >
          {/* Header */}
          <header className="text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-primary flex items-center justify-center shadow-sm">
              <Landmark size={32} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1">
                Bienvenido de nuevo
              </h1>
              <p className="text-sm text-on-surface-variant">
                Ingresa tus datos para continuar
              </p>
            </div>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-on-surface"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full h-12 pl-10 pr-4 rounded-lg bg-surface-container-lowest border border-outline-variant text-sm text-on-surface placeholder:text-outline/70 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label
                  className="text-sm font-semibold text-on-surface"
                  htmlFor="password"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-10 rounded-lg bg-surface-container-lowest border border-outline-variant text-sm text-on-surface placeholder:text-outline/70 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-error text-center bg-error-container/40 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-lg text-sm font-bold text-on-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(180deg, #1b667c 0%, #004e60 100%)",
                }}
              >
                {submitting ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>

          {/* Register link */}
          <p className="text-sm text-on-surface-variant text-center">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/registro"
              className="text-sm font-bold text-primary hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
