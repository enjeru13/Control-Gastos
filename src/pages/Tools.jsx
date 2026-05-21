import { useState, useEffect, useReducer } from "react";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

// ── Currency Calculator ────────────────────────────────────

const CURRENCIES = ["USD", "VES", "COP", "EUR"];

// VES not on frankfurter — manual fallback (user can update)
const VES_MANUAL_RATES = { USD: 36.5, COP: 0.0095, EUR: 39.8 };

const ratesInitial = { rates: {}, loading: false, lastUpdated: null };

function ratesReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":  return { ...state, loading: true };
    case "FETCH_OK":     return { loading: false, rates: action.rates, lastUpdated: action.ts };
    case "FETCH_FAIL":   return { loading: false, rates: action.fallback, lastUpdated: null };
    default:             return state;
  }
}

function useCurrencyRates(base) {
  const [state, dispatch] = useReducer(ratesReducer, ratesInitial);

  useEffect(() => {
    if (base === "VES") return;
    dispatch({ type: "FETCH_START" });
    fetch(`https://api.frankfurter.app/latest?from=${base}&to=USD,COP,EUR,VES`)
      .then((r) => r.json())
      .then((data) => {
        const r = { ...data.rates };
        if (!r.VES)
          r.VES = base === "USD" ? 36.5 : (data.rates.USD ?? 1) * 36.5;
        dispatch({ type: "FETCH_OK", rates: r, ts: new Date() });
      })
      .catch(() => {
        dispatch({ type: "FETCH_FAIL", fallback: { USD: 1, COP: 3850, EUR: 0.93, VES: 36.5 } });
      });
  }, [base]);

  if (base === "VES") {
    return { rates: VES_MANUAL_RATES, loading: false, lastUpdated: null };
  }
  return state;
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
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-on-surface">
        Calculadora de Divisas
      </h2>

      <div className="bg-surface rounded-2xl shadow-card p-5 flex flex-col gap-4 relative">
        {/* Swap center button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={swap}
            className="w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center shadow-sm border border-surface-container-lowest text-primary hover:bg-primary-container transition-colors active:scale-90"
          >
            <ArrowLeftRight size={14} />
          </button>
        </div>

        {/* From */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
            Monto a convertir
          </label>
          <div className="flex bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden h-14 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold text-on-surface px-4 outline-none font-currency"
              placeholder="0.00"
            />
            <CurrencyDropdown value={from} onChange={setFrom} exclude={to} />
          </div>
        </div>

        {/* To */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-on-surface-variant tracking-wide">
            Monto estimado
          </label>
          <div className="flex bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden h-14 transition-all">
            <input
              readOnly
              value={loading ? "..." : result}
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold text-on-surface px-4 outline-none font-currency"
            />
            <CurrencyDropdown value={to} onChange={setTo} exclude={from} />
          </div>
          <div className="flex justify-between text-xs text-outline mt-0.5 px-1">
            <span>{loading ? "Actualizando..." : rateLabel}</span>
            <button
              onClick={swap}
              className="text-primary font-semibold hover:underline"
            >
              Invertir
            </button>
          </div>
        </div>

        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-[10px] text-outline">
            <TrendingUp size={11} />
            Tasa actualizada:{" "}
            {lastUpdated.toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function CurrencyDropdown({ value, onChange, exclude }) {
  return (
    <div className="flex items-center bg-surface-container px-3 border-l border-outline-variant">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none text-sm font-bold text-on-surface outline-none cursor-pointer appearance-none pr-1"
      >
        {CURRENCIES.filter((c) => c !== exclude).map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Financial Calendar ─────────────────────────────────────

const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

// Mock transactions with date dots
const TX_DOTS = {
  "2026-05-01": ["income"],
  "2026-05-03": ["income", "expense"],
  "2026-05-06": ["expense"],
  "2026-05-08": ["income"],
  "2026-05-10": ["expense"],
  "2026-05-12": ["income", "expense"],
  "2026-05-15": ["income"],
  "2026-05-17": ["expense"],
  "2026-05-20": ["income", "expense"],
};

const DAY_TXS = {
  "2026-05-20": [
    {
      id: 1,
      description: "Transferencia Zelle",
      amount: 150,
      currency: "USD",
      type: "income",
      time: "10:30 AM",
    },
    {
      id: 2,
      description: "Pago Servicios",
      amount: 450,
      currency: "VES",
      type: "expense",
      time: "02:15 PM",
    },
  ],
};

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function FinancialCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(
    dateKey(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirst = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = rawFirst === 0 ? 6 : rawFirst - 1;

  // prev month tail days
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

  const selectedTxs = DAY_TXS[selected] ?? [];
  const selectedLabel = selected
    ? new Intl.DateTimeFormat("es", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date(selected + "T00:00:00"))
    : "";

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-on-surface">
        Calendario Financiero
      </h2>

      <div className="bg-surface rounded-2xl shadow-card p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-sm font-bold text-on-surface capitalize">
            {monthLabel}
          </h3>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 text-center">
          {DAYS.map((d) => (
            <div key={d} className="text-[10px] font-bold text-outline pb-1">
              {d}
            </div>
          ))}

          {/* Prev month overflow */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`prev-${i}`} className="flex flex-col items-center py-1">
              <span className="text-xs text-outline-variant w-7 h-7 flex items-center justify-center">
                {prevMonthDays - startOffset + 1 + i}
              </span>
            </div>
          ))}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = dateKey(viewYear, viewMonth, day);
            const dots = TX_DOTS[key] ?? [];
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();
            const isSelected = key === selected;

            return (
              <div
                key={day}
                className="flex flex-col items-center gap-0.5 py-1 cursor-pointer"
                onClick={() => setSelected(key)}
              >
                <span
                  className={[
                    "text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                    isSelected
                      ? "bg-primary text-on-primary shadow-sm"
                      : isToday
                        ? "bg-surface-container-high text-primary font-bold"
                        : "text-on-surface hover:bg-surface-container",
                  ].join(" ")}
                >
                  {day}
                </span>
                <div className="flex gap-0.5 h-1.5">
                  {dots.includes("income") && (
                    <div className="w-1 h-1 rounded-full bg-primary" />
                  )}
                  {dots.includes("expense") && (
                    <div className="w-1 h-1 rounded-full bg-error" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-5 pt-3 border-t border-surface-container text-[10px] font-semibold text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Ingresos
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-error" />
            Gastos
          </div>
        </div>
      </div>

      {/* Day detail */}
      {selected && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-on-surface-variant px-1 capitalize">
            {selectedLabel}
          </h4>

          {selectedTxs.length === 0 ? (
            <div className="bg-surface rounded-2xl shadow-card p-5 text-center text-sm text-on-surface-variant">
              Sin movimientos este día
            </div>
          ) : (
            <div className="bg-surface rounded-2xl shadow-card border border-surface-container overflow-hidden">
              {selectedTxs.map((tx, idx) => (
                <div key={tx.id}>
                  {idx > 0 && <hr className="border-surface-container mx-4" />}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          tx.type === "income"
                            ? "bg-primary/10 text-primary"
                            : "bg-error/10 text-error",
                        ].join(" ")}
                      >
                        {tx.type === "income" ? (
                          <ArrowDown size={18} />
                        ) : (
                          <ArrowUp size={18} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-on-surface">
                          {tx.description}
                        </div>
                        <div className="text-xs text-outline">{tx.time}</div>
                      </div>
                    </div>
                    <span
                      className={[
                        "text-sm font-bold font-currency",
                        tx.type === "income"
                          ? "text-primary"
                          : "text-on-surface",
                      ].join(" ")}
                    >
                      {tx.type === "income" ? "+" : "-"}{" "}
                      {new Intl.NumberFormat("es-VE", {
                        minimumFractionDigits: 2,
                      }).format(tx.amount)}{" "}
                      {tx.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function Tools() {
  return (
    <div className="flex flex-col gap-6">
      <CurrencyCalculator />
      <FinancialCalendar />
    </div>
  );
}
