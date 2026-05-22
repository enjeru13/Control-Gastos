import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ChevronDown, Edit2, Loader2, Trash2 } from "lucide-react";
import { getCurrencySymbol } from "../lib/currency";
import { getIcon } from "../lib/categoryIcons";
import { useCategories, useTransactions } from "../hooks/useTransactions";
import BottomSheet from "../components/ui/BottomSheet";

const CURRENCIES = ["USD", "VES", "COP"];

// Parse amount: handles both dot-decimal (1000.50) and comma-decimal (1.000,50 / 1,50)
function parseAmt(raw) {
  const s = String(raw).trim().replace(/\s/g, "");
  if (!s) return NaN;
  const hasDot   = s.includes(".");
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
    return s.split(".").length > 2
      ? Number(s.replace(/\./g, ""))
      : Number(s);
  }
  return Number(s);
}

const roundAmt = (n) => Math.round(Number(n) * 100) / 100;

const schema = z.object({
  description: z.string().min(1, "Requerido"),
  amount: z.string().min(1, "Requerido").refine(
    (v) => { const n = parseAmt(v); return !isNaN(n) && n > 0; },
    "Debe ser mayor a 0"
  ),
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

// ── Edit Sheet ─────────────────────────────────────────────

function EditTransactionSheet({ tx, open, onClose, categories, saving, onSave }) {
  const [txType, setTxType] = useState(tx?.type ?? "expense");
  const [currency, setCurrency] = useState(tx?.currency ?? "USD");

  const visibleCats = categories.filter((c) => c.type === txType);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  // Pre-fill form whenever the tx being edited changes
  useEffect(() => {
    if (tx) {
      setTxType(tx.type);
      setCurrency(tx.currency);
      reset({
        description: tx.description,
        amount: String(tx.amount),
        category_id: tx.category_id ?? tx.categories?.id ?? "",
        date: tx.date,
        notes: tx.notes ?? "",
      });
    }
  }, [tx, reset]);

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
              {t === "expense" ? "Egreso" : "Ingreso"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">Monto</label>
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
          {errors.amount && <span className="text-xs text-error">{errors.amount.message}</span>}
          <AmountPreviewTx rawValue={watch("amount")} currency={currency} />
        </div>

        {/* Currency */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">Moneda</label>
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
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">Descripción</label>
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
          {errors.description && <span className="text-xs text-error">{errors.description.message}</span>}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">Categoría</label>
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
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          </div>
          {errors.category_id && <span className="text-xs text-error">{errors.category_id.message}</span>}
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">Fecha</label>
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
            <><Loader2 size={16} className="animate-spin" /> Guardando...</>
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
  const [editingTx, setEditingTx] = useState(null);   // tx object → edit sheet
  const [deleting, setDeleting] = useState(false);

  const { categories } = useCategories();
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
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "USD",
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const amountWatched = watch("amount");

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
                  {t === "expense" ? "Egreso" : "Ingreso"}
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
              <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
                Categoría
              </label>
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
                { key: "expense", label: "Egresos" },
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
                  <ChevronDown size={20} className="text-on-surface-variant" />
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
      tx={editingTx}
      open={!!editingTx}
      onClose={() => setEditingTx(null)}
      categories={categories}
      saving={saving}
      onSave={handleUpdate}
    />

    <BottomSheet
      open={!!selectedTx}
      title="Movimiento"
      onClose={() => setSelectedTx(null)}
    >
      {selectedTx && (() => {
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
              <span className={[
                "text-base font-bold font-currency shrink-0",
                selectedTx.type === "income" ? "text-success" : "text-error",
              ].join(" ")}>
                {selectedTx.type === "income" ? "+" : "-"}{formatAmt(selectedTx.amount)} {selectedTx.currency}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedTx(null); setEditingTx(selectedTx); }}
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
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
