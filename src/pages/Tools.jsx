import { useState, useEffect, useReducer } from "react";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  ChevronDown,
} from "lucide-react";

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

    // Nueva API de ExchangeRate que soporta todas las monedas y no da error de CORS
    fetch(`https://open.er-api.com/v6/latest/${base}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.result === "success") {
          // Extraemos solo las monedas que nos interesan del listado global
          const r = {
            USD: data.rates.USD,
            VES: data.rates.VES,
            COP: data.rates.COP,
            EUR: data.rates.EUR,
          };
          dispatch({ type: "FETCH_OK", rates: r, ts: new Date() });
        } else {
          throw new Error("Error en la respuesta de la API");
        }
      })
      .catch((error) => {
        console.error("Fallo al obtener tasas:", error);
        // Valores de emergencia por si el usuario se queda sin internet
        dispatch({
          type: "FETCH_FAIL",
          fallback: { USD: 1, COP: 3850, EUR: 0.93, VES: 36.5 },
        });
      });
  }, [base]);

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
    <section className="flex flex-col gap-5">
      {/* Header Premium */}
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

      {/* Contenedor Principal Glassmorphism */}
      <div className="relative w-full rounded-[2.5rem] bg-surface shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-outline-variant/30 p-2 sm:p-3 overflow-hidden">
        {/* Luces de fondo (Blobs para efecto neón suave) */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-2 z-10">
          {/* ENVIAS CARD */}
          <div className="group bg-surface-container-highest/20 backdrop-blur-xl border border-outline-variant/30 rounded-4xl p-5 pt-6 pb-9 transition-all duration-300 focus-within:bg-surface focus-within:border-outline focus-within:shadow-xl">
            <label className="flex items-center gap-2 text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-4 ml-2">
              <span className="w-2 h-2 rounded-full bg-outline-variant/50 group-focus-within:bg-primary transition-colors"></span>
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

          {/* BOTON SWAP (Flotante) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            {/* Este div hace el "corte" entre las dos tarjetas */}
            <div className="bg-surface p-1.5 rounded-full shadow-lg">
              <button
                onClick={swap}
                className="group w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary/90 active:scale-90 transition-all duration-300 shadow-[0_0_20px_rgba(var(--color-primary),0.4)]"
              >
                <ArrowLeftRight
                  size={24}
                  strokeWidth={2.5}
                  className="rotate-90 group-hover:rotate-270 transition-transform duration-500"
                />
              </button>
            </div>
          </div>

          {/* RECIBES CARD */}
          <div className="bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-xl rounded-4xl p-5 pt-9 pb-6 transition-all relative overflow-hidden">
            {/* Brillo interno */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-4 ml-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-primary uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
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

      {/* Footer minimalista */}
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
      {/* Flecha personalizada */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant group-hover:text-primary transition-colors z-20">
        <ChevronDown size={20} strokeWidth={3} />
      </div>
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
