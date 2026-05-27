import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ChevronDown,
  Edit2,
  Loader2,
  Trash2,
  Settings,
  Plus,
  Pencil,
  Check,
  X as XIcon,
} from "lucide-react";
import { getCurrencySymbol } from "../lib/currency";
import { getIcon, ICON_MAP } from "../lib/categoryIcons";
import { useCategories, useTransactions } from "../hooks/useTransactions";
import BottomSheet from "../components/ui/BottomSheet";

const CURRENCIES = ["USD", "VES", "COP"];

// Parse amount: handles both dot-decimal (1000.50) and comma-decimal (1.000,50 / 1,50)
function parseAmt(raw) {
  const s = String(raw).trim().replace(/\s/g, "");
  if (!s) return NaN;
  const hasDot = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    return s.lastIndexOf(".") > s.lastIndexOf(",")
      ? Number(s.replace(/,/g, ""))
      : Number(s.replace(/\./g, "").replace(",", "."));
  }
  if (hasComma) {
    const parts = s.split(",");
    return parts.length === 2 && parts[1].length <= 2
      ? Number(s.replace(",", "."))
      : Number(s.replace(/,/g, ""));
  }
  if (hasDot) {
    return s.split(".").length > 2 ? Number(s.replace(/\./g, "")) : Number(s);
  }
  return Number(s);
}

const roundAmt = (n) => Math.round(Number(n) * 100) / 100;

const schema = z.object({
  description: z.string().min(1, "Requerido"),
  amount: z
    .string()
    .min(1, "Requerido")
    .refine((v) => {
      const n = parseAmt(v);
      return !isNaN(n) && n > 0;
    }, "Debe ser mayor a 0"),
  category_id: z.string().min(1, "Selecciona una categoría"),
  date: z.string().min(1, "Requerido"),
  notes: z.string().optional(),
});

// ── Helpers ────────────────────────────────────────────────

function groupByDate(txs) {
  return txs.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});
}

function dateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d >= today) return "Hoy";
  if (d >= yesterday) return "Ayer";
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

function formatAmt(amount) {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function timeFromISO(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function AmountPreviewTx({ rawValue, currency }) {
  const n = parseAmt(rawValue);
  if (!rawValue || isNaN(n) || n <= 0) return null;
  const sym = { USD: "$", VES: "Bs.", COP: "$" }[currency] ?? "$";
  const formatted = new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return (
    <p className="text-xs font-semibold text-primary -mt-1">
      = {sym} {formatted} {currency}
    </p>
  );
}

// ── Manage Categories Sheet ────────────────────────────────

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
  "#1b667c",
];

function ManageCategoriesSheet({
  open,
  onClose,
  categories,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [form, setForm] = useState({
    name: "",
    type: "expense",
    icon: "Tag",
    color: "#6b7280",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingCat, setEditingCat] = useState(null); // { id, name, type, icon, color }

  const userCats = categories.filter((c) => c.user_id !== null);
  const sysCats = categories.filter((c) => c.user_id === null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function setEdit(k, v) {
    setEditingCat((c) => ({ ...c, [k]: v }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: "Requerido" });
      return;
    }
    setSaving(true);
    try {
      await onAdd({
        name: form.name.trim(),
        type: form.type,
        icon: form.icon,
        color: form.color,
      });
      toast.success("Categoría creada");
      setForm({ name: "", type: "expense", icon: "Tag", color: "#6b7280" });
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingCat?.name.trim()) return;
    setSaving(true);
    try {
      await onUpdate(editingCat.id, {
        name: editingCat.name.trim(),
        type: editingCat.type,
        icon: editingCat.icon,
        color: editingCat.color,
      });
      toast.success("Categoría actualizada");
      setEditingCat(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} title="Gestionar Categorías" onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* ── Add form ── */}
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Nueva categoría
          </p>

          {/* Name + type row */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                Nombre
              </label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ej. Mascotas"
                className={`w-full min-w-0 appearance-none bg-surface-container-low border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none transition-all ${errors.name ? "border-error" : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10"}`}
              />
              {errors.name && (
                <p className="text-xs text-error">{errors.name}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                Tipo
              </label>
              <div className="flex gap-1.5">
                {["expense", "income"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("type", t)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${form.type === t ? (t === "expense" ? "bg-error-container text-on-error-container" : "bg-success/15 text-success") : "bg-surface-container-low border border-outline-variant text-on-surface-variant"}`}
                  >
                    {t === "expense" ? "Gasto" : "Ingreso"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-outline-variant/50" />

          {/* Icon picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
              Ícono
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {Object.entries(ICON_MAP).map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => set("icon", name)}
                  className={`flex items-center justify-center p-2.5 rounded-xl transition-all active:scale-90 ${form.icon === name ? "bg-primary-container border-2 border-primary" : "bg-surface-container-low border border-outline-variant/50"}`}
                >
                  <Icon
                    size={16}
                    style={{
                      color: form.icon === name ? form.color : undefined,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-outline-variant/50" />

          {/* Color picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2 justify-items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("color", c)}
                  className={`w-8 h-8 rounded-full transition-all active:scale-90 ${form.color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {errors.general && (
            <p className="text-xs text-error bg-error-container/30 rounded-xl px-3 py-2">
              {errors.general}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-linear-to-b from-primary to-surface-tint text-on-primary text-sm font-bold shadow-card active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Agregar categoría
          </button>
        </form>

        <div className="border-t border-dashed border-outline-variant/50" />

        {/* ── User custom cats ── */}
        {userCats.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Mis categorías
            </p>
            {userCats.map((c) => {
              const isEditing = editingCat?.id === c.id;
              const Icon = getIcon(isEditing ? editingCat.icon : c.icon);
              if (isEditing)
                return (
                  <form
                    key={c.id}
                    onSubmit={handleUpdate}
                    className="flex flex-col gap-3 p-3 bg-surface-container rounded-xl border border-primary/20"
                  >
                    {/* Name + type */}
                    <div className="flex gap-2">
                      <input
                        value={editingCat.name}
                        onChange={(e) => setEdit("name", e.target.value)}
                        className="flex-1 min-w-0 appearance-none bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                      />
                      <div className="flex gap-1">
                        {["expense", "income"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEdit("type", t)}
                            className={`px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all ${editingCat.type === t ? (t === "expense" ? "bg-error-container text-on-error-container" : "bg-success/15 text-success") : "bg-surface-container-low border border-outline-variant text-on-surface-variant"}`}
                          >
                            {t === "expense" ? "Gasto" : "Ingreso"}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Icon picker */}
                    <div className="grid grid-cols-6 gap-1">
                      {Object.entries(ICON_MAP).map(([name, Ic]) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setEdit("icon", name)}
                          className={`flex items-center justify-center p-2 rounded-lg transition-all ${editingCat.icon === name ? "bg-primary-container border border-primary" : "bg-surface-container-low border border-outline-variant/50"}`}
                        >
                          <Ic
                            size={14}
                            style={{
                              color:
                                editingCat.icon === name
                                  ? editingCat.color
                                  : undefined,
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    {/* Color + actions */}
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-5 gap-1.5 justify-items-center">
                        {PRESET_COLORS.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setEdit("color", col)}
                            className={`w-6 h-6 rounded-full transition-all ${editingCat.color === col ? "ring-2 ring-offset-1 ring-primary scale-110" : ""}`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingCat(null)}
                          className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                        >
                          <XIcon size={14} />
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  </form>
                );
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-3 py-2.5 bg-surface-container-low rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: c.color + "20" }}
                    >
                      <Icon size={15} style={{ color: c.color }} />
                    </div>
                    <span className="text-sm font-semibold text-on-surface">
                      {c.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.type === "expense" ? "bg-error-container/60 text-on-error-container" : "bg-success/15 text-success"}`}
                    >
                      {c.type === "expense" ? "Gasto" : "Ingreso"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setEditingCat({
                          id: c.id,
                          name: c.name,
                          type: c.type,
                          icon: c.icon,
                          color: c.color,
                        })
                      }
                      className="p-1.5 text-outline hover:text-primary hover:bg-primary-container/30 rounded-lg transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── System cats (read-only) ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Categorías del sistema
            </p>
            <span className="text-[10px] text-outline">Solo lectura</span>
          </div>
          <p className="text-xs text-on-surface-variant bg-surface-container-low rounded-xl px-3 py-2">
            Crea una categoría propia para poder editarla o eliminarla.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {sysCats.map((c) => {
              const Icon = getIcon(c.icon);
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/40 bg-surface-container-low/60"
                >
                  <Icon size={12} style={{ color: c.color }} />
                  <span className="text-xs text-on-surface-variant font-medium">
                    {c.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

// ── Edit Sheet ─────────────────────────────────────────────

function EditTransactionSheet({
  tx,
  open,
  onClose,
  categories,
  saving,
  onSave,
  onManage,
}) {
  const [txType, setTxType] = useState(tx?.type ?? "expense");
  const [currency, setCurrency] = useState(tx?.currency ?? "USD");

  const visibleCats = categories.filter((c) => c.type === txType);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: tx
      ? {
          description: tx.description,
          amount: String(tx.amount),
          category_id: tx.category_id ?? tx.categories?.id ?? "",
          date: tx.date,
          notes: tx.notes ?? "",
        }
      : {},
  });

  const amountValue = useWatch({ control, name: "amount" });

  function onSubmit(data) {
    onSave({
      type: txType,
      amount: roundAmt(parseAmt(data.amount)),
      currency,
      description: data.description,
      category_id: data.category_id,
      date: data.date,
      notes: data.notes || null,
    });
  }

  return (
    <BottomSheet open={open} title="Editar movimiento" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="flex bg-surface-container-low p-1 rounded-xl">
          {["expense", "income"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTxType(t)}
              className={[
                "flex-1 py-2 text-center rounded-lg text-sm font-semibold transition-all",
                txType === t
                  ? "bg-surface shadow-sm text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              {t === "expense" ? "Gasto" : "Ingreso"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
            Monto
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-on-surface-variant">
              {getCurrencySymbol(currency)}
            </span>
            <input
              {...register("amount")}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className={[
                "w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-3.5 text-lg font-bold text-on-surface outline-none transition-all placeholder:text-outline font-currency",
                errors.amount
                  ? "border-error focus:ring-2 focus:ring-error/20"
                  : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10",
              ].join(" ")}
            />
          </div>
          {errors.amount && (
            <span className="text-xs text-error">{errors.amount.message}</span>
          )}
          <AmountPreviewTx rawValue={amountValue} currency={currency} />
        </div>

        {/* Currency */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
            Moneda
          </label>
          <div className="flex gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={[
                  "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                  currency === c
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
                ].join(" ")}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
            Descripción
          </label>
          <input
            {...register("description")}
            type="text"
            placeholder="Ej. Comida rápida"
            className={[
              "w-full bg-surface-container-low border rounded-xl px-4 py-3 text-base text-on-surface outline-none transition-all placeholder:text-outline",
              errors.description
                ? "border-error focus:ring-2 focus:ring-error/20"
                : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10",
            ].join(" ")}
          />
          {errors.description && (
            <span className="text-xs text-error">
              {errors.description.message}
            </span>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
              Categoría
            </label>
            <button
              type="button"
              onClick={onManage}
              className="flex items-center gap-1 text-xs text-primary font-semibold"
            >
              <Settings size={11} /> Gestionar
            </button>
          </div>
          <div className="relative">
            <select
              {...register("category_id")}
              className={[
                "w-full appearance-none bg-surface-container-low border rounded-xl px-4 py-3 text-base text-on-surface outline-none transition-all cursor-pointer",
                errors.category_id
                  ? "border-error"
                  : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10",
              ].join(" ")}
            >
              <option value="">Selecciona una categoría</option>
              {visibleCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            />
          </div>
          {errors.category_id && (
            <span className="text-xs text-error">
              {errors.category_id.message}
            </span>
          )}
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
            Fecha
          </label>
          <input
            {...register("date")}
            type="date"
            className="w-full min-w-0 appearance-none bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-base text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
            Nota <span className="font-normal opacity-60">(Opcional)</span>
          </label>
          <input
            {...register("notes")}
            type="text"
            placeholder="Ej. Deuda pendiente por cobrar"
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-base text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-outline"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-full py-4 rounded-xl bg-linear-to-b from-primary to-surface-tint text-on-primary text-sm font-bold shadow-card hover:shadow-overlay transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </button>
      </form>
    </BottomSheet>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function Transactions() {
  const [txType, setTxType] = useState("expense");
  const [currency, setCurrency] = useState("USD");
  const [filter, setFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState(null); // tx object → action sheet
  const [editingTx, setEditingTx] = useState(null); // tx object → edit sheet
  const [deleting, setDeleting] = useState(false);
  const [manageCatsOpen, setManageCatsOpen] = useState(false);

  const { categories, addCategory, updateCategory, deleteCategory } =
    useCategories();
  const {
    transactions,
    loading: loadingTxs,
    saving,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  } = useTransactions();

  // Split categories by type
  const visibleCats = categories.filter(
    (c) => c.type === (txType === "expense" ? "expense" : "income"),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "USD",
      date: new Date().toISOString().slice(0, 10),
    },
  });

  async function onSubmit(data) {
    const ok = await addTransaction({
      type: txType,
      amount: roundAmt(parseAmt(data.amount)),
      currency,
      description: data.description,
      category_id: data.category_id,
      date: data.date,
      notes: data.notes || null,
    });
    if (ok) {
      reset({ currency: "USD", date: new Date().toISOString().slice(0, 10) });
      toast.success("Movimiento guardado");
    } else {
      toast.error("Error al guardar el movimiento");
    }
  }

  async function handleDelete() {
    if (!selectedTx) return;
    setDeleting(true);
    const ok = await deleteTransaction(selectedTx.id);
    setDeleting(false);
    if (ok) {
      toast.success("Movimiento eliminado");
      setSelectedTx(null);
    } else {
      toast.error("Error al eliminar");
    }
  }

  async function handleUpdate(changes) {
    if (!editingTx) return;
    const ok = await updateTransaction(editingTx.id, changes);
    if (ok) {
      toast.success("Movimiento actualizado");
      setEditingTx(null);
    } else {
      toast.error("Error al actualizar");
    }
  }

  const filtered = transactions.filter(
    (tx) => filter === "all" || tx.type === filter,
  );
  const grouped = groupByDate(filtered);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* ── FORM ── */}
        <section className="md:col-span-2 flex flex-col gap-0">
          <div className="bg-surface rounded-2xl shadow-card p-5 flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-secondary-container rounded-full blur-2xl opacity-20 pointer-events-none" />

            <div className="flex items-center justify-center gap-2.5 relative z-10">
              <h2 className="text-lg font-bold text-on-surface">Registrar</h2>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 relative z-10"
            >
              {/* Type toggle */}
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                {["expense", "income"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxType(t)}
                    className={[
                      "flex-1 py-2 text-center rounded-lg text-sm font-semibold transition-all",
                      txType === t
                        ? "bg-surface shadow-sm text-primary"
                        : "text-on-surface-variant hover:text-on-surface",
                    ].join(" ")}
                  >
                    {t === "expense" ? "Gasto" : "Ingreso"}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                  Monto
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-on-surface-variant">
                    {getCurrencySymbol(currency)}
                  </span>
                  <input
                    {...register("amount")}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={[
                      "w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-3.5 text-lg font-bold text-on-surface outline-none transition-all placeholder:text-outline font-currency",
                      errors.amount
                        ? "border-error focus:ring-2 focus:ring-error/20"
                        : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10",
                    ].join(" ")}
                  />
                </div>
                {errors.amount && (
                  <span className="text-xs text-error">
                    {errors.amount.message}
                  </span>
                )}
              </div>

              {/* Currency */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                  Moneda
                </label>
                <div className="flex gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={[
                        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                        currency === c
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
                      ].join(" ")}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                  Descripción
                </label>
                <input
                  {...register("description")}
                  type="text"
                  placeholder="Ej. Comida rápida"
                  className={[
                    "w-full bg-surface-container-low border rounded-xl px-4 py-3 text-base text-on-surface outline-none transition-all placeholder:text-outline",
                    errors.description
                      ? "border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10",
                  ].join(" ")}
                />
                {errors.description && (
                  <span className="text-xs text-error">
                    {errors.description.message}
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                    Categoría
                  </label>
                  <button
                    type="button"
                    onClick={() => setManageCatsOpen(true)}
                    className="flex items-center gap-1 text-xs text-primary font-semibold"
                  >
                    <Settings size={11} /> Gestionar
                  </button>
                </div>
                <div className="relative">
                  <select
                    {...register("category_id")}
                    className={[
                      "w-full appearance-none bg-surface-container-low border rounded-xl px-4 py-3 text-base text-on-surface outline-none transition-all cursor-pointer",
                      errors.category_id
                        ? "border-error"
                        : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10",
                    ].join(" ")}
                  >
                    <option value="">Selecciona una categoría</option>
                    {visibleCats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                  />
                </div>
                {errors.category_id && (
                  <span className="text-xs text-error">
                    {errors.category_id.message}
                  </span>
                )}
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                  Fecha
                </label>
                <input
                  {...register("date")}
                  type="date"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-base text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                  Nota{" "}
                  <span className="font-normal opacity-60">(Opcional)</span>
                </label>
                <input
                  {...register("notes")}
                  type="text"
                  placeholder="Ej. Deuda pendiente por cobrar"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-base text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-outline"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 w-full py-4 rounded-xl bg-linear-to-b from-primary to-surface-tint text-on-primary text-sm font-bold shadow-card hover:shadow-overlay transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  "Guardar Movimiento"
                )}
              </button>
            </form>
          </div>
        </section>

        {/* ── HISTORY ── */}
        <section className="md:col-span-3 flex flex-col gap-0">
          <div className="bg-surface rounded-2xl shadow-card flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-surface-container-highest flex flex-col gap-3">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Historial</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {new Intl.DateTimeFormat("es", {
                    month: "long",
                    year: "numeric",
                  }).format(new Date())}
                  {" · "}
                  {transactions.length} movimiento
                  {transactions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                {[
                  { key: "all", label: "Todos" },
                  { key: "income", label: "Ingresos" },
                  { key: "expense", label: "Gastos" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={[
                      "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0",
                      filter === key
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="p-4 flex flex-col gap-1 overflow-y-auto max-h-130">
              {loadingTxs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                    <ChevronDown
                      size={20}
                      className="text-on-surface-variant"
                    />
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant">
                    Sin movimientos aún
                  </p>
                  <p className="text-xs text-on-surface-variant opacity-70">
                    Registra tu primer movimiento
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([date, txs]) => (
                  <div key={date}>
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 py-2 mt-2 first:mt-0">
                      {dateLabel(date)},{" "}
                      {new Intl.DateTimeFormat("es", {
                        day: "numeric",
                        month: "long",
                      }).format(new Date(date + "T00:00:00"))}
                    </div>
                    {txs.map((tx) => {
                      const cat = tx.categories;
                      const Icon = getIcon(cat?.icon);
                      const color = cat?.color ?? "#6b7280";
                      return (
                        <div
                          key={tx.id}
                          onClick={() => setSelectedTx(tx)}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: color + "1a" }}
                            >
                              <Icon size={18} style={{ color }} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-on-surface leading-tight">
                                {tx.description}
                              </span>
                              <span className="text-xs text-on-surface-variant">
                                {cat?.name ?? "Sin categoría"} ·{" "}
                                {timeFromISO(tx.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <div
                              className={[
                                "text-sm font-bold font-currency",
                                tx.type === "income"
                                  ? "text-success"
                                  : "text-error",
                              ].join(" ")}
                            >
                              {tx.type === "income" ? "+" : "-"}
                              {formatAmt(tx.amount)}
                            </div>
                            <div className="text-[10px] text-on-surface-variant font-semibold">
                              {tx.currency}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <EditTransactionSheet
        key={editingTx?.id}
        tx={editingTx}
        open={!!editingTx}
        onClose={() => setEditingTx(null)}
        categories={categories}
        saving={saving}
        onSave={handleUpdate}
        onManage={() => setManageCatsOpen(true)}
      />

      <ManageCategoriesSheet
        open={manageCatsOpen}
        onClose={() => setManageCatsOpen(false)}
        categories={categories}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />

      <BottomSheet
        open={!!selectedTx}
        title="Movimiento"
        onClose={() => setSelectedTx(null)}
      >
        {selectedTx &&
          (() => {
            const cat = selectedTx.categories;
            const Icon = getIcon(cat?.icon);
            const color = cat?.color ?? "#6b7280";
            return (
              <div className="flex flex-col gap-4">
                {/* Summary */}
                <div className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color + "1a" }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {selectedTx.description}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {cat?.name ?? "Sin categoría"} · {selectedTx.date}
                    </p>
                  </div>
                  <span
                    className={[
                      "text-base font-bold font-currency shrink-0",
                      selectedTx.type === "income"
                        ? "text-success"
                        : "text-error",
                    ].join(" ")}
                  >
                    {selectedTx.type === "income" ? "+" : "-"}
                    {formatAmt(selectedTx.amount)} {selectedTx.currency}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedTx(null);
                      setEditingTx(selectedTx);
                    }}
                    className="flex-1 py-4 rounded-xl bg-primary-container text-on-primary-container text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-colors active:scale-[0.98]"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-4 rounded-xl bg-error-container text-on-error-container text-sm font-bold flex items-center justify-center gap-2 hover:bg-error hover:text-on-error transition-colors active:scale-[0.98] disabled:opacity-60"
                  >
                    {deleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {deleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            );
          })()}
      </BottomSheet>
    </>
  );
}
