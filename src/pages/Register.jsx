import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Landmark,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const CURRENCIES = [
  { code: "USD", label: "USD" },
  { code: "VES", label: "VES" },
  { code: "COP", label: "COP" },
];

export default function Register() {
  const { signUp, user, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  function validate() {
    const e = {};
    if (!fullName.trim()) e.fullName = "Ingresa tu nombre";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email inválido";
    if (password.length < 8) e.password = "Mínimo 8 caracteres";
    if (confirm !== password) e.confirm = "Las contraseñas no coinciden";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      await signUp(email, password, fullName.trim(), currency);
      setSuccess(true);
    } catch (err) {
      setErrors({ general: err.message });
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
            <Sparkles
              size={14}
              className="absolute -top-2 -right-2 text-primary bg-surface rounded-full p-0.5"
            />
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight leading-tight">
            Crea tu cuenta
          </h1>
          <p className="text-sm font-medium text-on-surface-variant mt-2">
            Empieza a gestionar tus finanzas hoy mismo
          </p>
        </div>

        {/* ── Tarjeta Glassmorphism ── */}
        <div className="rounded-4xl p-6 md:p-8 bg-surface/70 backdrop-blur-xl border border-outline-variant/30 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] relative">
          {success ? (
            <div className="flex flex-col items-center gap-5 py-6 text-center animate-in zoom-in duration-500">
              <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                <Mail size={32} strokeWidth={2} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-on-surface mb-2 tracking-tight">
                  ¡Revisa tu email!
                </h2>
                <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                  Enviamos un enlace de confirmación a{" "}
                  <strong className="text-primary">{email}</strong>.
                  <br />
                  Confirma tu cuenta para continuar.
                </p>
              </div>
              <Link
                to="/login"
                className="mt-4 px-6 py-3 rounded-xl bg-surface-container-high text-sm font-bold text-on-surface hover:bg-surface-container-highest hover:scale-105 transition-all active:scale-95"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field
                icon={User}
                label="Nombre completo"
                type="text"
                value={fullName}
                onChange={(v) => {
                  setFullName(v);
                  setErrors((x) => ({ ...x, fullName: "" }));
                }}
                placeholder="Ej. Juan Pérez"
                error={errors.fullName}
              />

              <Field
                icon={Mail}
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  setErrors((x) => ({ ...x, email: "" }));
                }}
                placeholder="tu@correo.com"
                error={errors.email}
              />

              <Field
                icon={Lock}
                label="Contraseña"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  setErrors((x) => ({ ...x, password: "" }));
                }}
                placeholder="••••••••"
                error={errors.password}
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

              <Field
                icon={Lock}
                label="Confirmar contraseña"
                type={showCf ? "text" : "password"}
                value={confirm}
                onChange={(v) => {
                  setConfirm(v);
                  setErrors((x) => ({ ...x, confirm: "" }));
                }}
                placeholder="••••••••"
                error={errors.confirm}
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowCf((s) => !s)}
                    className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-all"
                  >
                    {showCf ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              {/* ── Selector de Moneda (Estilo Premium) ── */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 mb-3">
                  Moneda principal
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CURRENCIES.map(({ code, label }) => {
                    const isActive = currency === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setCurrency(code)}
                        className={[
                          "flex flex-col items-center justify-center py-3.5 px-2 rounded-[1rem] border transition-all duration-300 active:scale-95 outline-none",
                          isActive
                            ? "bg-primary/10 border-primary/30 text-primary ring-2 ring-primary/20 shadow-sm"
                            : "bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/60",
                        ].join(" ")}
                      >
                        <span className="text-xl mb-1 drop-shadow-sm">
                          {code === "USD" ? "🇺🇸" : code === "VES" ? "🇻🇪" : "🇨🇴"}
                        </span>
                        <span
                          className={`text-xs ${isActive ? "font-black" : "font-semibold"}`}
                        >
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {errors.general && (
                <div className="flex items-center gap-2 text-xs font-bold text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                  {errors.general}
                </div>
              )}

              {/* ── Submit CTA ── */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 rounded-[1.25rem] text-sm font-black text-on-primary bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Sparkles size={16} className="animate-spin" />
                      Creando cuenta...
                    </span>
                  ) : (
                    "Registrarse"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Link al Login ── */}
        <div className="mt-8 text-center relative z-10">
          <p className="text-sm font-medium text-on-surface-variant">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-sm font-black text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Inicia sesión
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
  type,
  value,
  onChange,
  placeholder,
  error,
  rightAction,
}) {
  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">
        {label}
      </label>
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
