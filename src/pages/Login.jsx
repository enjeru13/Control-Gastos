import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Landmark,
  Sparkles,
  ArrowRight,
} from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-background">
      {/* ── Background Blobs (Luces Premium) ── */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[6rem] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/15 rounded-full blur-[6rem] pointer-events-none" />

      <main className="w-full max-w-md mx-auto relative z-10">
        {/* ── Logo y Encabezado ── */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative w-16 h-16 rounded-[1.5rem] bg-linear-to-br from-primary to-primary/80 text-on-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-5">
            <Landmark size={32} strokeWidth={2} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight leading-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm font-medium text-on-surface-variant mt-2">
            Ingresa tus datos para continuar
          </p>
        </div>

        {/* ── Tarjeta Glassmorphism ── */}
        <div className="rounded-4xl p-6 md:p-8 bg-surface/70 backdrop-blur-xl border border-outline-variant/30 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] relative">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <Field
              icon={Mail}
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="tu@correo.com"
            />

            {/* Password */}
            <Field
              icon={Lock}
              label="Contraseña"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              labelRight={
                <button
                  type="button"
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wide"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              }
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-all"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* Mensaje de Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs font-bold text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                {error}
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-[1.25rem] text-sm font-black text-on-primary bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed group"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Iniciar Sesión
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Link al Registro ── */}
        <div className="mt-8 text-center relative z-10">
          <p className="text-sm font-medium text-on-surface-variant">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/registro"
              className="text-sm font-black text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Reusable Field (Estilizado) ───────────────────────────────────

function Field({
  icon: Icon,
  label,
  labelRight,
  type,
  value,
  onChange,
  placeholder,
  error,
  rightAction,
}) {
  return (
    <div className="flex flex-col gap-1.5 group">
      <div className="flex justify-between items-center ml-1">
        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest transition-colors group-focus-within:text-primary">
          {label}
        </label>
        {labelRight && <div>{labelRight}</div>}
      </div>
      <div
        className={[
          "relative flex items-center rounded-[1.25rem] border bg-surface-container-lowest/50 backdrop-blur-sm transition-all duration-300",
          error
            ? "border-error focus-within:ring-4 focus-within:ring-error/15 bg-error/5"
            : "border-outline-variant/40 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 focus-within:bg-surface",
        ].join(" ")}
      >
        <Icon
          size={18}
          strokeWidth={2}
          className={[
            "absolute left-4 pointer-events-none shrink-0 transition-colors duration-300",
            error
              ? "text-error"
              : "text-outline group-focus-within:text-primary",
          ].join(" ")}
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full h-14 pl-11 pr-12 bg-transparent text-[15px] font-semibold text-on-surface placeholder:text-outline/50 placeholder:font-medium outline-none rounded-[1.25rem] truncate"
        />
        {rightAction && <div className="absolute right-3">{rightAction}</div>}
      </div>
      {error && (
        <p className="text-[11px] font-bold text-error px-2 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
