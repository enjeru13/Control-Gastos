import { useState, useEffect, useReducer, useMemo } from "react";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import { getIcon } from "../lib/categoryIcons";

// ── Helpers ────────────────────────────────────────────────

function fmtAmt(n) {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ── Currency Calculator ────────────────────────────────────

const CURRENCIES = ["USD", "VES", "COP", "EUR"];

const ratesInitial = { rates: {}, loading: false, lastUpdated: null };

function ratesReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_OK":
      return { loading: false, rates: action.rates, lastUpdated: action.ts };
    case "FETCH_FAIL":
      return { loading: false, rates: action.fallback, lastUpdated: null };
    default:
      return state;
  }
}

function useCurrencyRates(base) {
  const [state, dispatch] = useReducer(ratesReducer, ratesInitial);

  useEffect(() => {
    dispatch({ type: "FETCH_START" });
    fetch(`https://open.er-api.com/v6/latest/${base}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.result === "success") {
          dispatch({
            type: "FETCH_OK",
            rates: {
              USD: data.rates.USD,
              VES: data.rates.VES,
              COP: data.rates.COP,
              EUR: data.rates.EUR,
            },
            ts: new Date(),
          });
        } else throw new Error();
      })
      .catch(() =>
        dispatch({
          type: "FETCH_FAIL",
          fallback: { USD: 1, COP: 3850, EUR: 0.93, VES: 36.5 },
        }),
      );
  }, [base]);

  return state;
}

function CurrencyDropdown({ value, onChange, exclude }) {
  return (
    <div className="relative group shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-surface text-on-surface font-black text-xl rounded-2xl py-3 pl-5 pr-12 cursor-pointer outline-none shadow-sm border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/15 hover:border-primary/50 hover:shadow-md transition-all z-10 relative"
      >
        {CURRENCIES.filter((c) => c !== exclude).map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant group-hover:text-primary transition-colors z-20">
        <ChevronDown size={20} strokeWidth={3} />
      </div>
    </div>
  );
}

function CurrencyCalculator() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("COP");
  const { rates, loading, lastUpdated } = useCurrencyRates(from);

  const result = rates[to]
    ? (parseFloat(amount || 0) * rates[to]).toFixed(2)
    : "—";
  const rateLabel = rates[to]
    ? `1 ${from} = ${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 4 }).format(rates[to])} ${to}`
    : "...";

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-black text-on-surface tracking-tight">
              Conversor
            </h2>
            <p className="text-[11px] font-bold text-outline uppercase tracking-widest mt-0.5">
              Tasas en tiempo real
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full rounded-[2.5rem] p-2 sm:p-3 overflow-hidden">
        <div className="relative flex flex-col gap-2 z-10">
          {/* ENVIAS */}
          <div className="group bg-surface-container-highest/20 backdrop-blur-xl border border-outline-variant/30 rounded-4xl p-5 pt-6 pb-9 transition-all duration-300 focus-within:bg-surface focus-within:border-outline focus-within:shadow-xl">
            <label className="flex items-center gap-2 text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-4 ml-2">
              <span className="w-2 h-2 rounded-full bg-outline-variant/50 group-focus-within:bg-primary transition-colors" />
              Tú envías
            </label>
            <div className="flex justify-between items-center gap-4">
              <CurrencyDropdown value={from} onChange={setFrom} exclude={to} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-4xl sm:text-5xl font-black text-on-surface outline-none text-right placeholder-on-surface-variant/20 tracking-tighter"
                placeholder="0"
              />
            </div>
          </div>

          {/* SWAP */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="bg-surface p-1.5 rounded-full shadow-lg">
              <button
                onClick={swap}
                className="group w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary/90 active:scale-90 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
              >
                <ArrowLeftRight
                  size={24}
                  strokeWidth={2.5}
                  className="rotate-90 group-hover:rotate-270 transition-transform duration-500"
                />
              </button>
            </div>
          </div>

          {/* RECIBES */}
          <div className="bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-xl rounded-4xl p-5 pt-9 pb-6 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/8 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-start mb-4 ml-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-primary uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Tú recibes
              </label>
              <div className="bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-primary/15 shadow-sm">
                <span className="text-[11px] font-bold text-primary">
                  {loading ? "Calculando..." : rateLabel}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-4 relative z-10">
              <CurrencyDropdown value={to} onChange={setTo} exclude={from} />
              <input
                readOnly
                value={loading ? "" : result}
                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-4xl sm:text-5xl font-black text-primary outline-none text-right truncate placeholder-primary/30 tracking-tighter"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {lastUpdated && (
        <div className="flex justify-center mt-1">
          <span className="text-[10px] font-semibold text-outline-variant/80 uppercase tracking-widest">
            Actualizado ·{" "}
            {lastUpdated.toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}
    </section>
  );
}

// ── Financial Calendar ─────────────────────────────────────

const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function FinancialCalendar({ transactions, loading }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(
    dateKey(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  // ── Derived maps ─────────────────────────────────────────
  const dotsMap = useMemo(() => {
    const map = {};
    transactions.forEach((tx) => {
      if (!map[tx.date]) map[tx.date] = new Set();
      map[tx.date].add(tx.type);
    });
    return map;
  }, [transactions]);

  const dayTxs = useMemo(
    () => transactions.filter((tx) => tx.date === selected),
    [transactions, selected],
  );

  // Monthly count for header badge
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const monthCount = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(monthPrefix)).length,
    [transactions, monthPrefix],
  );

  // ── Calendar grid ─────────────────────────────────────────
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirst = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = rawFirst === 0 ? 6 : rawFirst - 1;
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  const monthLabel = new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
  }).format(new Date(viewYear, viewMonth));

  const selectedLabel = selected
    ? new Intl.DateTimeFormat("es", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date(selected + "T00:00:00"))
    : "";

  // Day summary totals (only when all day txs share same currency)
  const daySummary = useMemo(() => {
    if (dayTxs.length < 2) return null;
    const currencies = [...new Set(dayTxs.map((t) => t.currency))];
    if (currencies.length !== 1) return null;
    const cur = currencies[0];
    const income = dayTxs
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = dayTxs
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, cur };
  }, [dayTxs]);

  return (
    <section className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <CalendarDays size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-black text-on-surface tracking-tight">
              Calendario
            </h2>
            <p className="text-[11px] font-bold text-outline uppercase tracking-widest mt-0.5">
              Historial financiero
            </p>
          </div>
        </div>
      </div>

      {/* Calendar card */}
      <div className="bg-surface rounded-3xl shadow-card border border-outline-variant/20 overflow-hidden">
        {/* Month nav */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-surface-container">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-sm font-bold text-on-surface capitalize">
              {monthLabel}
            </h3>
            {monthCount > 0 && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {monthCount} movimiento{monthCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Grid */}
        <div className="px-3 pt-3 pb-2">
          <div className="grid grid-cols-7 text-center mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-[10px] font-bold text-outline py-1">
                {d}
              </div>
            ))}

            {/* Prev month overflow */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div
                key={`prev-${i}`}
                className="flex flex-col items-center py-1.5"
              >
                <span className="text-xs text-outline-variant/30 w-9 h-9 flex items-center justify-center">
                  {prevMonthDays - startOffset + 1 + i}
                </span>
              </div>
            ))}

            {/* Current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = dateKey(viewYear, viewMonth, day);
              const dots = dotsMap[key] ? [...dotsMap[key]] : [];
              const hasIncome = dots.includes("income");
              const hasExpense = dots.includes("expense");
              const isToday =
                day === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();
              const isSelected = key === selected;

              return (
                <div
                  key={day}
                  onClick={() => setSelected(key)}
                  className="flex flex-col items-center gap-1.5 py-1.5 cursor-pointer select-none"
                >
                  <span
                    className={[
                      "text-xs font-semibold w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150",
                      isSelected
                        ? "bg-primary text-on-primary shadow-md shadow-primary/25 scale-110"
                        : isToday
                          ? "bg-primary/12 text-primary ring-1 ring-primary/30 font-bold"
                          : "text-on-surface hover:bg-surface-container-low active:scale-95",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                  <div className="flex gap-0.5 h-1.5">
                    {hasIncome && (
                      <div className="w-1 h-1 rounded-full bg-primary" />
                    )}
                    {hasExpense && (
                      <div className="w-1 h-1 rounded-full bg-error" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-5 pb-4 text-[10px] font-semibold text-on-surface-variant border-t border-surface-container pt-3 mx-5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" /> Ingresos
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-error" /> Gastos
          </div>
        </div>
      </div>

      {/* Day detail */}
      {selected && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-on-surface-variant px-1 capitalize tracking-wide">
            {selectedLabel}
          </p>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : dayTxs.length === 0 ? (
            <div className="bg-surface rounded-2xl shadow-card p-8 flex flex-col items-center gap-2 text-center border border-surface-container">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
                <CalendarDays size={18} className="text-on-surface-variant" />
              </div>
              <p className="text-sm font-semibold text-on-surface-variant">
                Sin movimientos
              </p>
              <p className="text-xs text-outline">
                Este día no tiene registros
              </p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl shadow-card border border-surface-container overflow-hidden">
              {/* Day summary — only when same currency */}
              {daySummary && (
                <div className="flex gap-2 p-3 border-b border-surface-container">
                  {daySummary.income > 0 && (
                    <div className="flex-1 bg-primary/8 rounded-xl px-3 py-2 flex items-center gap-2">
                      <ArrowDown size={12} className="text-primary shrink-0" />
                      <div>
                        <p className="text-[9px] font-bold text-primary/60 uppercase tracking-wider">
                          Ingresos
                        </p>
                        <p className="text-xs font-black text-primary font-currency">
                          +{fmtAmt(daySummary.income)} {daySummary.cur}
                        </p>
                      </div>
                    </div>
                  )}
                  {daySummary.expense > 0 && (
                    <div className="flex-1 bg-error/8 rounded-xl px-3 py-2 flex items-center gap-2">
                      <ArrowUp size={12} className="text-error shrink-0" />
                      <div>
                        <p className="text-[9px] font-bold text-error/60 uppercase tracking-wider">
                          Gastos
                        </p>
                        <p className="text-xs font-black text-error font-currency">
                          -{fmtAmt(daySummary.expense)} {daySummary.cur}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Transaction rows */}
              {dayTxs.map((tx, idx) => {
                const cat = tx.categories;
                const Icon = getIcon(cat?.icon);
                const color = cat?.color ?? "#6b7280";
                return (
                  <div key={tx.id}>
                    {idx > 0 && (
                      <div className="h-px bg-surface-container mx-4" />
                    )}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: color + "1a" }}
                        >
                          <Icon size={18} style={{ color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate">
                            {tx.description}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {cat?.name ?? "Sin categoría"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={[
                          "text-sm font-bold font-currency shrink-0 ml-3",
                          tx.type === "income" ? "text-success" : "text-error",
                        ].join(" ")}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {new Intl.NumberFormat("es-VE", {
                          minimumFractionDigits: 2,
                        }).format(tx.amount)}{" "}
                        {tx.currency}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function Tools() {
  const { transactions, loading } = useTransactions();
  return (
    <div className="flex flex-col gap-6">
      <CurrencyCalculator />
      <FinancialCalendar transactions={transactions} loading={loading} />
    </div>
  );
}
