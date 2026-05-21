import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  DollarSign,
  Moon,
  Key,
  Fingerprint,
  Bell,
  Upload,
  LogOut,
  Edit2,
} from "lucide-react";
import { CURRENCIES } from "../constants/currencies";
import { useAuth } from "../contexts/AuthContext";

// ── Dark mode hook ────────────────────────────────────────

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, () => setDark((d) => !d)];
}

// ── Toggle switch ─────────────────────────────────────────

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0",
        checked ? "bg-primary" : "bg-surface-variant",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300",
          checked ? "left-6.5" : "left-0.5",
        ].join(" ")}
      />
    </button>
  );
}

// ── Setting row ───────────────────────────────────────────

function SettingRow({
  icon: Icon,
  iconBg,
  label,
  subtitle,
  trailing,
  onClick,
  danger = false,
  divider = true,
}) {
  return (
    <div
      onClick={onClick}
      className={[
        "flex items-center justify-between px-5 py-4 transition-colors",
        divider ? "border-b border-surface-container last:border-0" : "",
        onClick ? "cursor-pointer" : "",
        danger
          ? "hover:bg-error-container/20"
          : onClick
            ? "hover:bg-surface-container-low"
            : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg ?? "bg-secondary-container/30"}`}
        >
          <Icon size={18} className={danger ? "text-error" : "text-primary"} />
        </div>
        <div>
          <p
            className={`text-sm font-semibold ${danger ? "text-error" : "text-on-surface"}`}
          >
            {label}
          </p>
          {subtitle && (
            <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {trailing && <div className="ml-2 shrink-0">{trailing}</div>}
    </div>
  );
}

// ── Currency picker modal ─────────────────────────────────

function CurrencyPicker({ current, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl bg-surface rounded-t-3xl p-6 pb-10 shadow-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />
        <h3 className="text-base font-bold text-on-surface mb-4">
          Moneda Principal
        </h3>
        <div className="flex flex-col gap-1">
          {CURRENCIES.map(({ code, name, symbol, flag }) => (
            <button
              key={code}
              onClick={() => {
                onSelect(code);
                onClose();
              }}
              className={[
                "flex items-center gap-4 p-4 rounded-xl transition-colors",
                current === code
                  ? "bg-primary-container text-on-primary-container"
                  : "hover:bg-surface-container-low text-on-surface",
              ].join(" ")}
            >
              <span className="text-2xl">{flag}</span>
              <div className="text-left flex-1">
                <p className="text-sm font-bold">
                  {code} — {symbol}
                </p>
                <p className="text-xs opacity-70">{name}</p>
              </div>
              {current === code && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Change password form ──────────────────────────────────

function PasswordForm({ onClose }) {
  const { updatePassword } = useAuth();
  const [form, setForm] = useState({ next: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handle(e) {
    e.preventDefault();
    if (form.next.length < 8) return setError("Mínimo 8 caracteres");
    if (form.next !== form.confirm)
      return setError("Las contraseñas no coinciden");
    setSaving(true);
    try {
      await updatePassword(form.next);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl bg-surface rounded-t-3xl p-6 pb-10 shadow-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />
        <h3 className="text-base font-bold text-on-surface mb-5">
          Cambiar Contraseña
        </h3>
        <form onSubmit={handle} className="flex flex-col gap-4">
          {[
            ["next", "Nueva contraseña"],
            ["confirm", "Confirmar contraseña"],
          ].map(([field, label]) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                {label}
              </label>
              <input
                type="password"
                value={form[field]}
                onChange={(e) => {
                  setError("");
                  setForm((f) => ({ ...f, [field]: e.target.value }));
                }}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="••••••••"
              />
            </div>
          ))}
          {error && <p className="text-xs text-error">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl bg-linear-to-b from-primary to-surface-tint text-on-primary text-sm font-bold shadow-card mt-2 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function Settings() {
  const { profile, user, signOut, updateFullName } = useAuth();
  const navigate = useNavigate();

  const [dark, toggleDark] = useDarkMode();
  const [currency, setCurrency] = useState("USD");
  const [biometrics, setBiometrics] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const nameRef = useRef(null);
  const csvRef = useRef(null);

  // Display name — always derived, no local copy needed
  const rawName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuario";

  // Editable copy — only lives while the input is open
  const [name, setName] = useState("");

  useEffect(() => {
    if (editingName) nameRef.current?.focus();
  }, [editingName]);

  function startEditingName() {
    setName(rawName);
    setEditingName(true);
  }

  async function handleNameSave() {
    setEditingName(false);
    if (name.trim() === rawName) return;
    setSavingName(true);
    try {
      await updateFullName(name.trim());
    } catch {
      // rawName auto-reverts when profile reloads — no manual reset needed
    } finally {
      setSavingName(false);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  function handleCsvImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: parse CSV → preview → import to Supabase
    alert(
      `Archivo seleccionado: ${file.name}\n(Importación se implementará próximamente)`,
    );
    e.target.value = "";
  }

  const initials = rawName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency);

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* ── Profile ── */}
        <section className="bg-surface rounded-2xl shadow-card border border-surface-container p-6 flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-tertiary-container flex items-center justify-center text-on-primary text-2xl font-bold shadow-card">
              {initials || "U"}
            </div>
            <button
              onClick={startEditingName}
              className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 active:scale-95 transition-all"
            >
              <Edit2 size={12} />
            </button>
          </div>

          {/* Name + email */}
          <div className="flex-1 text-center sm:text-left">
            {editingName ? (
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                className="text-xl font-bold text-on-surface bg-surface-container-low border border-primary rounded-lg px-3 py-1 outline-none w-full max-w-50"
              />
            ) : (
              <h2
                className={[
                  "text-xl font-bold text-on-surface cursor-pointer hover:text-primary transition-colors",
                  savingName ? "opacity-60" : "",
                ].join(" ")}
                onClick={startEditingName}
              >
                {rawName}
              </h2>
            )}
            <p className="text-sm text-on-surface-variant mt-0.5">
              {user?.email ?? ""}
            </p>
          </div>
        </section>

        {/* ── Account Preferences ── */}
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-primary uppercase tracking-widest px-1">
            Preferencias de Cuenta
          </h3>
          <div className="bg-surface rounded-2xl shadow-card border border-surface-container overflow-hidden">
            <SettingRow
              icon={DollarSign}
              label="Moneda Principal"
              subtitle="Moneda base para mostrar totales"
              onClick={() => setShowCurrencyPicker(true)}
              trailing={
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary bg-primary-fixed/50 px-3 py-1 rounded-full">
                    {selectedCurrency?.flag} {currency}
                  </span>
                  <ChevronRight size={16} className="text-on-surface-variant" />
                </div>
              }
            />
            <SettingRow
              icon={Moon}
              label="Modo Oscuro"
              subtitle="Colores oscuros en toda la app"
              trailing={<Toggle checked={dark} onChange={toggleDark} />}
            />
          </div>
        </section>

        {/* ── Security ── */}
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-primary uppercase tracking-widest px-1">
            Seguridad
          </h3>
          <div className="bg-surface rounded-2xl shadow-card border border-surface-container overflow-hidden">
            <SettingRow
              icon={Key}
              label="Cambiar Contraseña"
              onClick={() => setShowPasswordForm(true)}
              trailing={
                <ChevronRight size={16} className="text-on-surface-variant" />
              }
            />
            <SettingRow
              icon={Fingerprint}
              label="Biometría"
              subtitle="Face ID / Huella digital"
              divider={false}
              trailing={
                <Toggle
                  checked={biometrics}
                  onChange={setBiometrics}
                  disabled
                />
              }
            />
          </div>
          <p className="text-[10px] text-on-surface-variant px-1">
            * Biometría disponible en versión nativa
          </p>
        </section>

        {/* ── Notifications ── */}
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-primary uppercase tracking-widest px-1">
            Notificaciones
          </h3>
          <div className="bg-surface rounded-2xl shadow-card border border-surface-container overflow-hidden">
            <SettingRow
              icon={Bell}
              label="Alertas de Gastos"
              subtitle="Disponible próximamente"
              divider={false}
              trailing={
                <Toggle checked={alerts} onChange={setAlerts} disabled />
              }
            />
          </div>
        </section>

        {/* ── Import ── */}
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-primary uppercase tracking-widest px-1">
            Importar Datos
          </h3>
          <div className="bg-surface rounded-2xl shadow-card border border-surface-container overflow-hidden">
            <SettingRow
              icon={Upload}
              label="Importar desde CSV / Excel"
              subtitle="Importa transacciones de tu banco"
              onClick={() => csvRef.current?.click()}
              trailing={
                <ChevronRight size={16} className="text-on-surface-variant" />
              }
              divider={false}
            />
          </div>
          <input
            ref={csvRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleCsvImport}
          />
          <p className="text-[10px] text-on-surface-variant px-1">
            Formatos soportados: .csv, .xlsx — Descarga el historial desde tu
            banco
          </p>
        </section>

        {/* ── Logout ── */}
        <section>
          <div className="bg-surface rounded-2xl shadow-card border border-surface-container overflow-hidden">
            <SettingRow
              icon={LogOut}
              label="Cerrar Sesión"
              danger
              divider={false}
              onClick={handleLogout}
            />
          </div>
        </section>
      </div>

      {/* ── Modals ── */}
      {showCurrencyPicker && (
        <CurrencyPicker
          current={currency}
          onSelect={setCurrency}
          onClose={() => setShowCurrencyPicker(false)}
        />
      )}
      {showPasswordForm && (
        <PasswordForm onClose={() => setShowPasswordForm(false)} />
      )}
    </>
  );
}
