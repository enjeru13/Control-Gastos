import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import {
  Plus,
  MoreVertical,
  Smartphone,
  Plane,
  Shield,
  Star,
  TrendingUp,
  PiggyBank,
  CreditCard,
  User,
  Users,
  Home,
  Car,
  Sofa,
  Receipt,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2,
  History,
  Sparkles,
} from "lucide-react";
import { useSavingsGoals, useDebts, useWishlist } from "../hooks/useMetas";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import BottomSheet from "../components/ui/BottomSheet";

// ── Constants ──────────────────────────────────────────────

const CURRENCIES = ["USD", "VES", "COP"];

const DEBT_TYPE_META = {
  credit_card: {
    label: "Tarjeta de Crédito",
    Icon: CreditCard,
    color: "#ba1a1a",
  },
  cashea: { label: "Cashea", Icon: Smartphone, color: "#059669" },
  personal_loan: { label: "Préstamo Personal", Icon: User, color: "#f97316" },
  hogar: { label: "Cuotas del Hogar", Icon: Sofa, color: "#0ea5e9" },
  informal: { label: "Deuda Informal", Icon: Users, color: "#8b5cf6" },
  other: { label: "Otra Deuda", Icon: Receipt, color: "#6b7280" },
};

const GOAL_ICONS = [
  { name: "Smartphone", Icon: Smartphone, bg: "#cfe5ff", color: "#314960" },
  { name: "Plane", Icon: Plane, bg: "#cae2ff", color: "#4d657d" },
  { name: "Shield", Icon: Shield, bg: "#e5deff", color: "#474360" },
  { name: "TrendingUp", Icon: TrendingUp, bg: "#b6ebff", color: "#004e60" },
  { name: "Home", Icon: Home, bg: "#d8f5e4", color: "#1a5c35" },
  { name: "Car", Icon: Car, bg: "#fff3cd", color: "#7a5200" },
  { name: "PiggyBank", Icon: PiggyBank, bg: "#fde8f5", color: "#7a1f5c" },
  { name: "Star", Icon: Star, bg: "#fff0d4", color: "#7a4b00" },
];

const PRIORITY_BADGE = {
  high: {
    label: "Alta",
    className: "bg-error-container text-on-error-container",
  },
  medium: {
    label: "Media",
    className: "bg-surface-variant text-on-surface-variant",
  },
  low: {
    label: "Baja",
    className:
      "bg-surface text-on-surface-variant border border-outline-variant",
  },
};

// ── Helpers ────────────────────────────────────────────────

function fmtAmt(amount, currency = "USD") {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Normalize input: strips thousands separators, handles comma-as-decimal
function parseAmt(raw) {
  const s = String(raw).trim().replace(/\s/g, "");
  if (!s) return NaN;
  // Both dot and comma present → whichever is last is decimal separator
  const hasDot   = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    return s.lastIndexOf(".") > s.lastIndexOf(",")
      ? Number(s.replace(/,/g, ""))               // 1,000.50
      : Number(s.replace(/\./g, "").replace(",", ".")); // 1.000,50
  }
  if (hasComma) {
    const parts = s.split(",");
    // Treat as decimal only when exactly one comma with ≤2 digits after
    return parts.length === 2 && parts[1].length <= 2
      ? Number(s.replace(",", "."))
      : Number(s.replace(/,/g, ""));
  }
  if (hasDot) {
    const parts = s.split(".");
    // Multiple dots → thousands separators
    return parts.length > 2 ? Number(s.replace(/\./g, "")) : Number(s);
  }
  return Number(s);
}

const roundAmt = (n) => Math.round(Number(n) * 100) / 100;

function AmountPreview({ value, currency = "USD" }) {
  const n = parseAmt(value);
  if (!value || isNaN(n) || n <= 0) return null;
  return (
    <p className="text-xs font-semibold text-primary -mt-1">
      = {fmtAmt(n, currency)}
    </p>
  );
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

function InputCls(hasErr) {
  return `w-full min-w-0 bg-surface-container-low border rounded-xl px-4 py-3 text-base text-on-surface outline-none transition-all ${
    hasErr
      ? "border-error focus:ring-2 focus:ring-error/20"
      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10"
  }`;
}

// ── Aportar Sheet ──────────────────────────────────────────

function AportarSheet({ open, goal, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handle(e) {
    e.preventDefault();
    const parsed = parseAmt(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Monto inválido");
      return;
    }
    setSaving(true);
    try {
      const newAmount = roundAmt(Math.min(
        roundAmt(Number(goal.current_amount)) + roundAmt(parsed),
        roundAmt(Number(goal.target_amount)),
      ));
      await onSave(goal.id, { current_amount: newAmount });
      toast.success("Aporte registrado");
      setAmount("");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      title={goal ? `Aportar a "${goal.name}"` : "Aportar"}
      onClose={onClose}
    >
      <form onSubmit={handle} className="flex flex-col gap-5">
        {goal && (() => {
          const remaining = roundAmt(Number(goal.target_amount) - Number(goal.current_amount));
          const pct = goal.target_amount > 0
            ? Math.min(Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100), 100)
            : 0;
          return (
            <div className="bg-primary-container/30 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-on-surface-variant mb-0.5">Ahorrado</p>
                  <p className="text-base font-bold text-on-surface">
                    {fmtAmt(goal.current_amount, goal.currency)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-on-surface-variant mb-0.5">Restante</p>
                  <p className="text-base font-bold text-error">
                    {fmtAmt(remaining, goal.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant mb-0.5">Objetivo</p>
                  <p className="text-base font-bold text-primary">
                    {fmtAmt(goal.target_amount, goal.currency)}
                  </p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-primary/15 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-tertiary-fixed-dim to-primary transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })()}
        <Field label="Monto a aportar" error={error}>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }}
            placeholder="0.00"
            className={InputCls(!!error)}
            autoFocus
          />
          <AmountPreview value={amount} currency={goal?.currency} />
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl bg-linear-to-b from-primary to-surface-tint text-on-primary text-sm font-bold shadow-card active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Guardando...
            </>
          ) : (
            "Registrar Aporte"
          )}
        </button>
      </form>
    </BottomSheet>
  );
}

// ── Abonar Sheet ───────────────────────────────────────────

function AbonarSheet({ open, debt, onClose, onSave, onPayment }) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isSettled = debt
    ? roundAmt(Number(debt.paid_amount)) >= roundAmt(Number(debt.total_amount))
    : false;

  async function handle(e) {
    e.preventDefault();
    if (isSettled) return;
    const parsed = parseAmt(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Monto inválido");
      return;
    }
    setSaving(true);
    try {
      const newPaid = roundAmt(Math.min(
        roundAmt(Number(debt.paid_amount)) + roundAmt(parsed),
        roundAmt(Number(debt.total_amount)),
      ));
      const today = new Date().toISOString().slice(0, 10);
      await Promise.all([
        onSave(debt.id, { paid_amount: newPaid }),
        onPayment(debt.id, { amount: roundAmt(parsed), notes, date: today }),
      ]);
      toast.success("Abono registrado");
      setAmount("");
      setNotes("");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      title={debt ? `Abonar a "${debt.name}"` : "Abonar"}
      onClose={onClose}
    >
      {isSettled ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <p className="text-base font-bold text-on-surface">Deuda completamente pagada</p>
          <p className="text-sm text-on-surface-variant">No hay monto pendiente para abonar.</p>
        </div>
      ) : (
        <form onSubmit={handle} className="flex flex-col gap-5">
          {debt && (
            <div className="bg-error-container/30 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-on-surface-variant mb-0.5">Pendiente</p>
                <p className="text-base font-bold text-error">
                  {fmtAmt(Number(debt.total_amount) - Number(debt.paid_amount), debt.currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant mb-0.5">Pagado</p>
                <p className="text-base font-bold text-success">
                  {fmtAmt(debt.paid_amount, debt.currency)}
                </p>
              </div>
            </div>
          )}
          <Field label="Monto a abonar" error={error}>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              placeholder="0.00"
              className={InputCls(!!error)}
              autoFocus
            />
            <AmountPreview value={amount} currency={debt?.currency} />
          </Field>
          <Field label="Nota (opcional)">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Transferencia banco"
              className={InputCls(false)}
            />
          </Field>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl text-on-primary text-sm font-bold shadow-card active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(180deg, #ba1a1a 0%, #93000a 100%)" }}
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : "Registrar Abono"}
          </button>
        </form>
      )}
    </BottomSheet>
  );
}

// ── Debt History Sheet ─────────────────────────────────────

function DebtHistorySheet({ open, debt, onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !debt) return;
    setLoading(true);
    supabase
      .from("debt_payments")
      .select("*")
      .eq("debt_id", debt.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPayments(data ?? []);
        setLoading(false);
      });
  }, [open, debt?.id]);

  if (!debt) return null;

  const pct = debt.total_amount > 0
    ? Math.min(Math.round((Number(debt.paid_amount) / Number(debt.total_amount)) * 100), 100)
    : 0;

  return (
    <BottomSheet open={open} title={`Historial · ${debt.name}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Summary bar */}
        <div className={`rounded-2xl p-4 flex justify-between items-center ${pct === 100 ? "bg-success/10 border border-success/20" : "bg-error-container/20"}`}>
          <div>
            <p className="text-xs text-on-surface-variant mb-0.5">Deuda total</p>
            <p className="text-base font-bold font-currency text-on-surface">
              {fmtAmt(debt.total_amount, debt.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-on-surface-variant mb-0.5">Pagado</p>
            <p className="text-base font-bold font-currency text-success">
              {fmtAmt(debt.paid_amount, debt.currency)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="w-full h-2.5 bg-error/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-error to-success transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-on-surface-variant">Pendiente {fmtAmt(Number(debt.total_amount) - Number(debt.paid_amount), debt.currency)}</span>
            <span className={`text-xs font-bold ${pct === 100 ? "text-success" : "text-on-surface-variant"}`}>{pct}%</span>
          </div>
        </div>

        {/* Payment list */}
        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : (() => {
            const trackedSum = payments.reduce((s, p) => s + Number(p.amount), 0);
            const legacy = roundAmt(Number(debt.paid_amount) - roundAmt(trackedSum));
            const hasLegacy = legacy > 0.009; // > 1 centavo de diferencia

            if (payments.length === 0 && !hasLegacy) {
              return (
                <div className="flex flex-col items-center py-8 gap-2 text-center">
                  <History size={28} className="text-outline-variant" />
                  <p className="text-sm font-semibold text-on-surface-variant">Sin pagos aún</p>
                  <p className="text-xs text-outline">Los abonos aparecerán aquí</p>
                </div>
              );
            }

            return (
              <>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1 mb-1">
                  {payments.length + (hasLegacy ? 1 : 0)} pago{(payments.length + (hasLegacy ? 1 : 0)) !== 1 ? "s" : ""}
                </p>

                {/* Tracked payments */}
                {payments.map((p, i) => (
                  <div key={p.id ?? i} className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-semibold text-on-surface-variant">
                        {new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" })
                          .format(new Date(p.date + "T00:00:00"))}
                      </p>
                      {p.notes && <p className="text-[11px] text-outline">{p.notes}</p>}
                    </div>
                    <p className="text-sm font-bold text-success font-currency">
                      +{fmtAmt(p.amount, debt.currency)}
                    </p>
                  </div>
                ))}

                {/* Legacy lump sum — payments made before history tracking */}
                {hasLegacy && (
                  <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-semibold text-on-surface-variant">Pagos anteriores al historial</p>
                      <p className="text-[11px] text-outline">Registrados antes de activar el seguimiento</p>
                    </div>
                    <p className="text-sm font-bold text-success font-currency">
                      +{fmtAmt(legacy, debt.currency)}
                    </p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </BottomSheet>
  );
}

// ── Add Goal Modal ─────────────────────────────────────────

const BLANK_GOAL = {
  name: "",
  target_amount: "",
  currency: "USD",
  target_date: "",
  icon: "PiggyBank",
};

function AddGoalSheet({ open, onClose, onSave, defaultValues = null }) {
  const [form, setForm] = useState(() =>
    defaultValues
      ? {
          name: defaultValues.name ?? "",
          target_amount: defaultValues.price ? String(defaultValues.price) : "",
          currency: defaultValues.currency ?? "USD",
          target_date: "",
          icon: "PiggyBank",
        }
      : BLANK_GOAL,
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  async function handle(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Requerido";
    const parsedTarget = parseAmt(form.target_amount);
    if (!form.target_amount || isNaN(parsedTarget) || parsedTarget <= 0)
      errs.target_amount = "Monto inválido";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        target_amount: roundAmt(parsedTarget),
        current_amount: 0,
        currency: form.currency,
        target_date: form.target_date || null,
        icon: form.icon,
        color: "#1b667c",
      });
      toast.success("Meta creada");
      setForm(BLANK_GOAL);
      onClose();
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} title="Nueva Meta de Ahorro" onClose={onClose}>
      <form onSubmit={handle} className="flex flex-col gap-5">
        <Field label="Ícono">
          <div className="grid grid-cols-4 gap-2">
            {GOAL_ICONS.map(({ name, Icon, bg, color }) => (
              <button
                key={name}
                type="button"
                onClick={() => set("icon", name)}
                className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95 ${form.icon === name ? "border-primary shadow-sm" : "border-transparent"}`}
                style={{ backgroundColor: bg }}
              >
                <Icon size={22} style={{ color }} />
              </button>
            ))}
          </div>
        </Field>
        <Field label="Nombre de la meta" error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ej. Viaje a Europa"
            className={InputCls(errors.name)}
            autoFocus
          />
        </Field>
        <Field label="Monto objetivo" error={errors.target_amount}>
          <input
            type="text"
            inputMode="decimal"
            value={form.target_amount}
            onChange={(e) => set("target_amount", e.target.value)}
            placeholder="0.00"
            className={InputCls(errors.target_amount)}
          />
          <AmountPreview value={form.target_amount} currency={form.currency} />
        </Field>
        <Field label="Moneda">
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("currency", c)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${form.currency === c ? "bg-primary-container text-on-primary-container shadow-sm" : "bg-surface-container-low border border-outline-variant text-on-surface-variant"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Fecha objetivo (opcional)">
          <input
            type="date"
            value={form.target_date}
            onChange={(e) => set("target_date", e.target.value)}
            className={InputCls(false)}
          />
        </Field>
        {errors.general && (
          <p className="text-xs text-error bg-error-container/30 rounded-xl px-4 py-3 text-center">
            {errors.general}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl bg-linear-to-b from-primary to-surface-tint text-on-primary text-sm font-bold shadow-card active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Guardando...
            </>
          ) : (
            "Crear Meta"
          )}
        </button>
      </form>
    </BottomSheet>
  );
}

// ── Add Debt Modal ─────────────────────────────────────────

function AddDebtSheet({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    type: "credit_card",
    total_amount: "",
    paid_amount: "0",
    currency: "USD",
    interest_rate: "",
    due_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  async function handle(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Requerido";
    const parsedTotal = parseAmt(form.total_amount);
    const parsedPaid  = parseAmt(form.paid_amount || "0");
    if (!form.total_amount || isNaN(parsedTotal) || parsedTotal <= 0)
      errs.total_amount = "Monto inválido";
    if (isNaN(parsedPaid) || parsedPaid < 0) errs.paid_amount = "No puede ser negativo";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        type: form.type,
        total_amount: roundAmt(parsedTotal),
        paid_amount: roundAmt(parsedPaid),
        currency: form.currency,
        interest_rate: form.interest_rate ? +form.interest_rate : null,
        due_date: form.due_date || null,
        color: DEBT_TYPE_META[form.type]?.color ?? "#ba1a1a",
      });
      toast.success("Deuda registrada");
      setForm({
        name: "",
        type: "credit_card",
        total_amount: "",
        paid_amount: "0",
        currency: "USD",
        interest_rate: "",
        due_date: "",
      });
      onClose();
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} title="Registrar Deuda" onClose={onClose}>
      <form onSubmit={handle} className="flex flex-col gap-5">
        <Field label="Nombre" error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ej. Tarjeta Visa"
            className={InputCls(errors.name)}
            autoFocus
          />
        </Field>
        <Field label="Tipo de deuda">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DEBT_TYPE_META).map(
              ([key, { label, Icon, color }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("type", key)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all active:scale-95 ${form.type === key ? "border-primary bg-primary-container/40 text-on-surface shadow-sm" : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"}`}
                >
                  <Icon
                    size={15}
                    style={{ color: form.type === key ? color : undefined }}
                  />
                  <span className="truncate text-xs">{label}</span>
                </button>
              ),
            )}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3 overflow-hidden">
          <Field label="Monto total" error={errors.total_amount}>
            <input
              type="text"
              inputMode="decimal"
              value={form.total_amount}
              onChange={(e) => set("total_amount", e.target.value)}
              placeholder="0.00"
              className={InputCls(errors.total_amount)}
            />
            <AmountPreview value={form.total_amount} currency={form.currency} />
          </Field>
          <Field label="Ya pagado" error={errors.paid_amount}>
            <input
              type="text"
              inputMode="decimal"
              value={form.paid_amount}
              onChange={(e) => set("paid_amount", e.target.value)}
              placeholder="0.00"
              className={InputCls(errors.paid_amount)}
            />
            <AmountPreview value={form.paid_amount} currency={form.currency} />
          </Field>
        </div>
        <Field label="Moneda">
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("currency", c)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${form.currency === c ? "bg-primary-container text-on-primary-container shadow-sm" : "bg-surface-container-low border border-outline-variant text-on-surface-variant"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3 overflow-hidden">
          <Field label="Interés anual % (opcional)">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.interest_rate}
              onChange={(e) => set("interest_rate", e.target.value)}
              placeholder="Ej. 24.5"
              className={InputCls(false)}
            />
          </Field>
          <Field label="Fecha límite (opcional)">
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => set("due_date", e.target.value)}
              className={InputCls(false)}
            />
          </Field>
        </div>
        {errors.general && (
          <p className="text-xs text-error bg-error-container/30 rounded-xl px-4 py-3 text-center">
            {errors.general}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl text-on-primary text-sm font-bold shadow-card active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(180deg, #ba1a1a 0%, #93000a 100%)",
          }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Guardando...
            </>
          ) : (
            "Registrar Deuda"
          )}
        </button>
      </form>
    </BottomSheet>
  );
}

// ── Add Wishlist Modal ─────────────────────────────────────

function AddWishlistSheet({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    currency: "USD",
    priority: "medium",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  async function handle(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: "Requerido" });
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        price: form.price ? roundAmt(parseAmt(form.price)) : null,
        currency: form.currency,
        priority: form.priority,
        description: form.description || null,
      });
      toast.success("Ítem agregado a la wishlist");
      setForm({
        name: "",
        price: "",
        currency: "USD",
        priority: "medium",
        description: "",
      });
      onClose();
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} title="Agregar a Wishlist" onClose={onClose}>
      <form onSubmit={handle} className="flex flex-col gap-5">
        <Field label="Nombre" error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ej. Silla Ergonómica"
            className={InputCls(errors.name)}
            autoFocus
          />
        </Field>
        <Field label="Prioridad">
          <div className="flex gap-2">
            {[
              ["high", "Alta"],
              ["medium", "Media"],
              ["low", "Baja"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => set("priority", key)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  form.priority === key
                    ? key === "high"
                      ? "bg-error-container text-on-error-container shadow-sm"
                      : key === "medium"
                        ? "bg-primary-container text-on-primary-container shadow-sm"
                        : "bg-surface-container text-on-surface shadow-sm"
                    : "bg-surface-container-low border border-outline-variant text-on-surface-variant"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Precio estimado (opcional)">
          <input
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0.00"
            className={InputCls(false)}
          />
          <AmountPreview value={form.price} currency={form.currency} />
        </Field>
        <Field label="Moneda">
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("currency", c)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${form.currency === c ? "bg-primary-container text-on-primary-container shadow-sm" : "bg-surface-container-low border border-outline-variant text-on-surface-variant"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Descripción (opcional)">
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Ej. Para la oficina en casa"
            className={InputCls(false)}
          />
        </Field>
        {errors.general && (
          <p className="text-xs text-error bg-error-container/30 rounded-xl px-4 py-3 text-center">
            {errors.general}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl bg-linear-to-b from-primary to-surface-tint text-on-primary text-sm font-bold shadow-card active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Guardando...
            </>
          ) : (
            "Agregar a Wishlist"
          )}
        </button>
      </form>
    </BottomSheet>
  );
}

// ── Card components ────────────────────────────────────────

function GoalCard({ goal, onDelete, onAportar, userName = "tú" }) {
  const pct =
    goal.target_amount > 0
      ? Math.min(
          Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100),
          100,
        )
      : 0;
  const isCompleted = pct >= 100;
  const iconMeta = GOAL_ICONS.find((g) => g.name === goal.icon) ?? GOAL_ICONS[6];
  const { Icon, bg: bgColor, color: iconColor } = iconMeta;

  return (
    <div className={`rounded-2xl p-5 shadow-card border hover:shadow-overlay transition-all duration-300 flex flex-col gap-4 relative overflow-hidden ${
      isCompleted
        ? "bg-linear-to-br from-success/10 to-success/5 border-success/25"
        : "bg-surface border-surface-container"
    }`}>
      {/* Completed glow */}
      {isCompleted && (
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-success/20 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex justify-between items-start relative">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: isCompleted ? "#22c55e1a" : bgColor }}
          >
            {isCompleted
              ? <CheckCircle2 size={18} className="text-success" />
              : <Icon size={18} style={{ color: iconColor }} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-on-surface">{goal.name}</h3>
              {isCompleted && (
                <span className="text-[10px] font-bold bg-success/15 text-success px-2 py-0.5 rounded-full">
                  ¡Meta alcanzada!
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant">{goal.currency}</p>
          </div>
        </div>
        <Menu as="div" className="relative">
          <MenuButton className="text-outline hover:text-on-surface transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-surface-container">
            <MoreVertical size={16} />
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 top-8 z-10 bg-surface border border-surface-container rounded-xl shadow-overlay overflow-hidden min-w-37.5 origin-top-right transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {!isCompleted && (
              <MenuItem as="button"
                onClick={() => onAportar(goal)}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-primary data-[focus]:bg-primary-container/20 transition-colors"
              >
                <TrendingUp size={14} /> Aportar
              </MenuItem>
            )}
            <MenuItem as="button"
              onClick={() => onDelete(goal.id)}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-error data-[focus]:bg-error-container/20 transition-colors"
            >
              <Trash2 size={14} /> Eliminar
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>

      {isCompleted ? (
        /* Completed state body */
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold font-currency text-success">
              {fmtAmt(goal.current_amount, goal.currency)}
            </span>
            <span className="text-xs text-success/70 font-semibold">
              Objetivo: {fmtAmt(goal.target_amount, goal.currency)}
            </span>
          </div>
          <div className="w-full h-3 bg-success/15 rounded-full overflow-hidden">
            <div className="h-full w-full rounded-full bg-linear-to-r from-success/70 to-success" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-success" />
            <p className="text-xs font-semibold text-success/80">
              ¡{userName}, lograste esta meta!
            </p>
          </div>
        </div>
      ) : (
        /* Normal progress body */
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xl font-bold font-currency text-on-surface">
              {fmtAmt(goal.current_amount, goal.currency)}
            </span>
            <span className="text-xs text-on-surface-variant">
              de {fmtAmt(goal.target_amount, goal.currency)}
            </span>
          </div>
          <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-tertiary-fixed-dim to-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 text-right">
            <span className="text-xs font-bold text-primary">{pct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function DebtCard({ debt, onDelete, onAbonar, onHistory }) {
  const meta = DEBT_TYPE_META[debt.type] ?? DEBT_TYPE_META.other;
  const { Icon, color, label } = meta;
  const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
  const pct =
    debt.total_amount > 0
      ? Math.min(Math.round((Number(debt.paid_amount) / Number(debt.total_amount)) * 100), 100)
      : 0;
  const isSettled = pct >= 100;
  const days = daysUntil(debt.due_date);
  const urgent = days !== null && days <= 30 && !isSettled;
  return (
    <div className={`bg-surface rounded-2xl shadow-card border overflow-hidden hover:shadow-overlay transition-shadow duration-300 ${isSettled ? "border-success/20" : "border-surface-container"}`}>
      <div className="flex">
        <div
          className="w-1 shrink-0 rounded-l-2xl"
          style={{ backgroundColor: isSettled ? "#22c55e" : color }}
        />
        <div className="flex-1 p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: isSettled ? "#22c55e1a" : color + "1a" }}
              >
                {isSettled
                  ? <CheckCircle2 size={18} className="text-success" />
                  : <Icon size={18} style={{ color }} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-on-surface">{debt.name}</h3>
                  {isSettled && (
                    <span className="text-[10px] font-bold bg-success/15 text-success px-2 py-0.5 rounded-full">
                      Pagado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-on-surface-variant">{label}</span>
                  {debt.interest_rate && (
                    <span className="text-[10px] font-bold bg-error-container/50 text-on-error-container px-1.5 py-0.5 rounded-full">
                      {debt.interest_rate}% anual
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Menu as="div" className="relative">
              <MenuButton className="text-outline hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-container">
                <MoreVertical size={16} />
              </MenuButton>
              <MenuItems
                transition
                className="absolute right-0 top-8 z-10 bg-surface border border-surface-container rounded-xl shadow-overlay overflow-hidden min-w-41.25 origin-top-right transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
              >
                {!isSettled && (
                  <MenuItem as="button"
                    onClick={() => onAbonar(debt)}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-primary data-[focus]:bg-primary-container/20 transition-colors"
                  >
                    <Receipt size={14} /> Registrar abono
                  </MenuItem>
                )}
                <MenuItem as="button"
                  onClick={() => onHistory(debt)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-on-surface data-[focus]:bg-surface-container transition-colors"
                >
                  <History size={14} /> Ver historial
                </MenuItem>
                <MenuItem as="button"
                  onClick={() => onDelete(debt.id)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-error data-[focus]:bg-error-container/20 transition-colors"
                >
                  <Trash2 size={14} /> Eliminar
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Restante</p>
              <p className="text-xl font-bold font-currency" style={{ color }}>
                {fmtAmt(remaining, debt.currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant mb-0.5">Pagado</p>
              <p className="text-sm font-bold text-success font-currency">
                {fmtAmt(debt.paid_amount, debt.currency)}
              </p>
            </div>
          </div>

          <div>
            <div className="w-full h-3 bg-error/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-error to-success transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-on-surface-variant">
                Total {fmtAmt(debt.total_amount, debt.currency)}
              </span>
              <span className="text-xs font-bold text-success">
                {pct}% pagado
              </span>
            </div>
          </div>

          {debt.due_date && (
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl ${urgent ? "bg-error-container text-on-error-container" : "bg-surface-container text-on-surface-variant"}`}
            >
              <AlertCircle size={13} />
              {urgent
                ? `Vence en ${days} días`
                : `Vence: ${new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" }).format(new Date(debt.due_date + "T00:00:00"))}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WishlistItem({ item, onDelete, onConvert }) {
  const badge = PRIORITY_BADGE[item.priority] ?? PRIORITY_BADGE.medium;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-low transition-colors group border-b border-surface-container-high/50 last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-lg font-bold text-on-surface-variant">
          {item.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
            {item.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
            >
              {badge.label}
            </span>
            {item.description && (
              <span className="text-xs text-on-surface-variant truncate">
                {item.description}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {item.price && (
          <span className="text-base font-bold text-on-surface">
            {fmtAmt(item.price, item.currency)}
          </span>
        )}
        <Menu as="div" className="relative">
          <MenuButton className="text-outline hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-container">
            <MoreVertical size={15} />
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 top-8 z-10 bg-surface border border-surface-container rounded-xl shadow-overlay overflow-hidden min-w-42.5 origin-top-right transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <MenuItem as="button"
              onClick={() => onConvert(item)}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-primary data-[focus]:bg-primary-container/20 transition-colors"
            >
              <PiggyBank size={14} /> Convertir en meta
            </MenuItem>
            <MenuItem as="button"
              onClick={() => onDelete(item.id)}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-error data-[focus]:bg-error-container/20 transition-colors"
            >
              <Trash2 size={14} /> Eliminar
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────

const TABS = [
  { key: "goals", label: "Ahorros" },
  { key: "debts", label: "Deudas" },
  { key: "wishlist", label: "Wishlist" },
];

// ── Page ───────────────────────────────────────────────────

export default function Metas() {
  const { profile } = useAuth();
  const userName = profile?.full_name?.split(" ")[0] ?? "tú";

  const [activeTab, setActiveTab] = useState("goals");
  const [goalFilter, setGoalFilter] = useState("progress"); // 'all' | 'progress' | 'completed'
  const [debtFilter, setDebtFilter] = useState("active"); // 'all' | 'active' | 'paid'
  const [sheet, setSheet] = useState(null); // 'goal' | 'debt' | 'wishlist'
  const [aportarGoal, setAportarGoal] = useState(null);
  const [abonarDebt, setAbonarDebt] = useState(null);
  const [historyDebt, setHistoryDebt] = useState(null);
  const [convertItem, setConvertItem] = useState(null);

  const {
    goals,
    loading: loadingGoals,
    addGoal,
    updateGoal,
    deleteGoal,
  } = useSavingsGoals();
  const {
    debts,
    loading: loadingDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    addDebtPayment,
  } = useDebts();
  const { items, loading: loadingWish, addItem, deleteItem } = useWishlist();

  // Group totals by currency — avoids fake cross-currency sum
  function groupAmounts(items, amountFn) {
    const map = {};
    for (const item of items) {
      const cur = item.currency ?? "USD";
      map[cur] = (map[cur] ?? 0) + amountFn(item);
    }
    return Object.entries(map).filter(([, v]) => v > 0);
  }

  const savingsByCur   = groupAmounts(goals, (g) => Number(g.current_amount));
  const debtRemByCur   = groupAmounts(debts, (d) => Number(d.total_amount) - Number(d.paid_amount));
  const debtPaidByCur  = groupAmounts(debts, (d) => Number(d.paid_amount));

  // Kept for pct calculations (same-currency items only skew when mixed, acceptable)
  const totalSavings = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalDebt = debts.reduce(
    (s, d) => s + (Number(d.total_amount) - Number(d.paid_amount)),
    0,
  );

  // Active = debts with remaining balance
  const activeDebts = debts.filter(
    (d) => roundAmt(Number(d.paid_amount)) < roundAmt(Number(d.total_amount))
  );

  // In-progress goals (current < target)
  const inProgressGoals = goals.filter((g) =>
    g.target_amount > 0
      ? roundAmt(Number(g.current_amount)) < roundAmt(Number(g.target_amount))
      : true,
  );

  // Nearest goal = highest completion % among in-progress only
  const nearestGoal =
    inProgressGoals.length > 0
      ? inProgressGoals.reduce((best, g) =>
          g.current_amount / g.target_amount >
          best.current_amount / best.target_amount
            ? g
            : best,
        )
      : null;
  const nearestPct = nearestGoal
    ? Math.round((nearestGoal.current_amount / nearestGoal.target_amount) * 100)
    : 0;
  const nearestIconMeta = nearestGoal
    ? (GOAL_ICONS.find((g) => g.name === nearestGoal.icon) ?? GOAL_ICONS[6])
    : GOAL_ICONS[6];

  function handleConvert(item) {
    setConvertItem(item);
    setSheet("goal");
  }

  async function handleGoalSaveAndConvert(payload) {
    await addGoal(payload);
    if (convertItem) await deleteItem(convertItem.id);
    setConvertItem(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Summary Bento — solo si hay datos ── */}
      {(goals.length > 0 || debts.length > 0) && (
        <section className="flex flex-col gap-3">
          {/* Ahorro Total — full width */}
          <div className="bg-primary-container text-on-primary-container rounded-3xl p-6 flex items-center justify-between relative overflow-hidden shadow-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed opacity-15 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-1">
              <div className="flex items-center gap-2 opacity-90">
                <PiggyBank size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Ahorro Total
                </span>
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                {loadingGoals ? (
                  <span className="text-4xl font-bold font-currency">—</span>
                ) : savingsByCur.length === 0 ? (
                  <span className="text-4xl font-bold font-currency">$0</span>
                ) : savingsByCur.map(([cur, amt]) => (
                  <span key={cur} className={savingsByCur.length === 1 ? "text-4xl font-bold font-currency" : "text-2xl font-bold font-currency"}>
                    {fmtAmt(amt, cur)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Próxima Meta + Total Deudas — side by side */}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: debts.length > 0 ? "1fr 1fr" : "1fr",
            }}
          >
            {/* Nearest goal */}
            <div className="bg-surface rounded-2xl p-4 shadow-card flex items-center gap-3 border border-surface-container-high/40">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: nearestIconMeta.bg }}
              >
                <nearestIconMeta.Icon
                  size={20}
                  style={{ color: nearestIconMeta.color }}
                />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-on-surface-variant mb-0.5 uppercase tracking-wide">
                  Próxima Meta
                </div>
                {loadingGoals ? (
                  <Loader2 size={14} className="animate-spin text-primary" />
                ) : nearestGoal ? (
                  <>
                    <div className="text-sm font-bold text-on-surface truncate">
                      {nearestGoal.name}
                    </div>
                    <div className="text-xs font-semibold text-primary mt-0.5">
                      {nearestPct}% completado
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-on-surface-variant">
                    Sin metas aún
                  </div>
                )}
              </div>
            </div>

            {/* Debt total — only when debts exist */}
            {debts.length > 0 && (
              <div className="bg-error-container/40 rounded-2xl p-4 shadow-card flex items-center gap-3 border border-error-container">
                <div className="w-11 h-11 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                  <CreditCard size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-on-surface-variant mb-0.5 uppercase tracking-wide">
                    Total Deudas
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {loadingDebts ? (
                      <span className="text-sm font-bold text-error">—</span>
                    ) : debtRemByCur.length === 0 ? (
                      <span className="text-sm font-bold text-error">$0</span>
                    ) : debtRemByCur.map(([cur, amt]) => (
                      <span key={cur} className="text-sm font-bold text-error truncate font-currency">
                        {fmtAmt(amt, cur)}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-on-surface-variant mt-0.5">
                    {loadingDebts
                      ? ""
                      : `${activeDebts.length} deuda${activeDebts.length !== 1 ? "s" : ""} activa${activeDebts.length !== 1 ? "s" : ""}`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Tabs ── */}
      <div className="flex bg-surface-container-low p-1 rounded-xl">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={[
              "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
              activeTab === key
                ? "bg-surface shadow-sm text-primary"
                : "text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Savings Goals ── */}
      {activeTab === "goals" && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface">
                Metas de Ahorro
              </h2>
              <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-[10px] font-bold">
                {inProgressGoals.length} en progreso
              </span>
            </div>
            <button
              onClick={() => setSheet("goal")}
              className="w-7 h-7 rounded-full bg-primary-container text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors active:scale-95 md:hidden"
            >
              <Plus size={15} />
            </button>
          </div>
          {/* Filter chips */}
          {goals.length > 0 && (
            <div className="flex gap-2">
              {[
                { key: "progress",  label: "En progreso" },
                { key: "completed", label: "Completadas"  },
                { key: "all",       label: "Todas"        },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setGoalFilter(key)}
                  className={[
                    "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                    goalFilter === key
                      ? key === "progress"
                        ? "bg-primary-container text-on-primary-container"
                        : key === "completed"
                          ? "bg-success/15 text-success"
                          : "bg-surface-container-high text-on-surface"
                      : "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {loadingGoals ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goals
                .filter((g) => {
                  const completed =
                    g.target_amount > 0
                      ? roundAmt(Number(g.current_amount)) >= roundAmt(Number(g.target_amount))
                      : false;
                  if (goalFilter === "progress")  return !completed;
                  if (goalFilter === "completed") return completed;
                  return true;
                })
                .map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onDelete={deleteGoal}
                  onAportar={setAportarGoal}
                  userName={userName}
                />
              ))}
              <button
                onClick={() => setSheet("goal")}
                className="border-2 border-dashed border-outline-variant rounded-2xl p-5 flex items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface-container-low transition-all active:scale-[0.98] md:col-span-2"
              >
                <Plus size={18} />
                <span className="text-sm font-semibold">
                  Nueva meta de ahorro
                </span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Debts ── */}
      {activeTab === "debts" && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface">Mis Deudas</h2>
              <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                {activeDebts.length} activas
              </span>
            </div>
            <button
              onClick={() => setSheet("debt")}
              className="w-7 h-7 rounded-full bg-error-container text-error flex items-center justify-center hover:bg-error hover:text-on-error transition-colors active:scale-95 md:hidden"
            >
              <Plus size={15} />
            </button>
          </div>

          {/* Filter chips */}
          {debts.length > 0 && (
            <div className="flex gap-2">
              {[
                { key: "active", label: "Activas" },
                { key: "paid",   label: "Pagadas" },
                { key: "all",    label: "Todas" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setDebtFilter(key)}
                  className={[
                    "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                    debtFilter === key
                      ? key === "active"
                        ? "bg-error-container text-on-error-container"
                        : key === "paid"
                          ? "bg-success/15 text-success"
                          : "bg-surface-container-high text-on-surface"
                      : "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {debts.length > 0 && (
            <div className="bg-error-container/30 border border-error-container rounded-2xl p-4 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
                  Deuda Total Pendiente
                </p>
                {debtRemByCur.length === 0
                  ? <p className="text-2xl font-bold text-error font-currency">$0</p>
                  : debtRemByCur.map(([cur, amt]) => (
                      <p key={cur} className={`font-bold text-error font-currency ${debtRemByCur.length === 1 ? "text-2xl" : "text-lg"}`}>
                        {fmtAmt(amt, cur)}
                      </p>
                    ))
                }
              </div>
              <div className="text-right shrink-0 flex flex-col gap-0.5">
                <p className="text-xs text-on-surface-variant mb-1">Pagado</p>
                {debtPaidByCur.length === 0
                  ? <p className="text-sm font-bold text-success font-currency">$0</p>
                  : debtPaidByCur.map(([cur, amt]) => (
                      <p key={cur} className="text-sm font-bold text-success font-currency">
                        {fmtAmt(amt, cur)}
                      </p>
                    ))
                }
              </div>
            </div>
          )}

          {loadingDebts ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {debts
                .filter((d) => {
                  const settled = roundAmt(Number(d.paid_amount)) >= roundAmt(Number(d.total_amount));
                  if (debtFilter === "active") return !settled;
                  if (debtFilter === "paid")   return settled;
                  return true;
                })
                .map((d) => (
                <DebtCard
                  key={d.id}
                  debt={d}
                  onDelete={deleteDebt}
                  onAbonar={setAbonarDebt}
                  onHistory={setHistoryDebt}
                />
              ))}
              <button
                onClick={() => setSheet("debt")}
                className="border-2 border-dashed border-error/30 rounded-2xl p-4 flex items-center justify-center gap-2 text-on-surface-variant hover:border-error hover:text-error hover:bg-error-container/20 transition-all active:scale-[0.98]"
              >
                <Plus size={16} />
                <span className="text-sm font-semibold">
                  Registrar nueva deuda
                </span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Wishlist ── */}
      {activeTab === "wishlist" && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface">Wishlist</h2>
              <Star size={16} className="text-tertiary" fill="currentColor" />
            </div>
            <button
              onClick={() => setSheet("wishlist")}
              className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:bg-primary-container hover:text-primary transition-colors active:scale-95 md:hidden"
            >
              <Plus size={15} />
            </button>
          </div>
          {loadingWish ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="bg-surface rounded-3xl shadow-card border border-surface-container overflow-hidden">
              {items.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-8">
                  Sin items aún
                </p>
              )}
              {items.map((item) => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  onDelete={deleteItem}
                  onConvert={handleConvert}
                />
              ))}
              <div className="p-3">
                <button
                  onClick={() => setSheet("wishlist")}
                  className="w-full border-2 border-dashed border-outline-variant rounded-xl p-3.5 flex items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface-container-low transition-all active:scale-[0.98]"
                >
                  <Plus size={16} />
                  <span className="text-sm font-semibold">
                    Agregar a wishlist
                  </span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Modals ── */}
      <AddGoalSheet
        key={convertItem?.id ?? "new-goal"}
        open={sheet === "goal"}
        defaultValues={convertItem}
        onClose={() => {
          setSheet(null);
          setConvertItem(null);
        }}
        onSave={convertItem ? handleGoalSaveAndConvert : addGoal}
      />
      <AddDebtSheet
        open={sheet === "debt"}
        onClose={() => setSheet(null)}
        onSave={addDebt}
      />
      <AddWishlistSheet
        open={sheet === "wishlist"}
        onClose={() => setSheet(null)}
        onSave={addItem}
      />

      <AportarSheet
        key={aportarGoal?.id ?? "aportar"}
        open={!!aportarGoal}
        goal={aportarGoal}
        onClose={() => setAportarGoal(null)}
        onSave={updateGoal}
      />
      <AbonarSheet
        key={abonarDebt?.id ?? "abonar"}
        open={!!abonarDebt}
        debt={abonarDebt}
        onClose={() => setAbonarDebt(null)}
        onSave={updateDebt}
        onPayment={addDebtPayment}
      />
      <DebtHistorySheet
        open={!!historyDebt}
        debt={historyDebt}
        onClose={() => setHistoryDebt(null)}
      />
    </div>
  );
}
