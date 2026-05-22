import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Loader2,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts"; // Quitamos ResponsiveContainer para arreglar el error
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { getIcon } from "../lib/categoryIcons";

const PIE_COLORS = ["#4f46e5", "#818cf8", "#a5b4fc", "#6366f1", "#c7d2fe"];
const INCOME_COLORS = ["#2e7d32", "#4caf50", "#81c784", "#388e3c", "#a5d6a7"];

const CURRENCY_META = {
  VES: { flag: "🇻🇪", symbol: "Bs." },
  COP: { flag: "🇨🇴", symbol: "$" },
  USD: { flag: "🇺🇸", symbol: "$" },
};

function fmtAmt(amount) {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function timeFromISO(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    recentTransactions,
    categoryTotals,
    incomeTotals,
    balances,
    totalDebt,
    totalDebtPaid,
    totalSavings,
    savingsTarget,
    loading,
    refetch,
  } = useDashboard();

  const totalDebtAll = totalDebt + totalDebtPaid;
  const debtPct =
    totalDebtAll > 0 ? Math.round((totalDebtPaid / totalDebtAll) * 100) : 0;
  const savingsPct =
    savingsTarget > 0 ? Math.round((totalSavings / savingsTarget) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 relative">
      {/* ── Background Blobs (Luces sutiles para todo el dashboard) ── */}

      {/* ── Hero Balance ── */}
      <section className="flex flex-col gap-4 relative z-10">
        <div className="relative overflow-hidden rounded-4xl p-7 bg-linear-to-br from-primary via-primary/95 to-tertiary-container text-on-primary shadow-xl shadow-primary/20">
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest opacity-80 uppercase flex items-center gap-1.5">
                Saldo Total Estimado
              </span>
              <Sparkles size={16} className="opacity-70" />
            </div>

            <h2 className="text-4xl sm:text-5xl font-black font-currency tracking-tighter mt-2 mb-1 drop-shadow-sm">
              {loading ? "—" : `$ ${fmtAmt(balances.USD)}`}
            </h2>

            <span className="text-xs font-medium opacity-80 bg-black/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md mt-2 border border-white/10">
              {loading
                ? "Cargando..."
                : balances.USD === 0 && balances.VES === 0 && balances.COP === 0
                  ? "Sin movimientos registrados"
                  : "Balance neto acumulado en USD"}
            </span>
          </div>
        </div>

        {/* Tarjetas de monedas */}
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(CURRENCY_META).map(([code, { flag, symbol }]) => {
            const net = balances[code] ?? 0;
            const isNeg = net < 0;
            return (
              <div
                key={code}
                className="bg-surface/80 backdrop-blur-md rounded-[1.25rem] p-3.5 shadow-sm border border-outline-variant/40 flex flex-col gap-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="text-xs">{flag}</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase">{code}</span>
                </div>
                <p className={[
                  "text-sm font-black font-currency leading-tight truncate",
                  loading ? "text-on-surface-variant" : isNeg ? "text-error" : "text-on-surface",
                ].join(" ")}>
                  {loading
                    ? "—"
                    : `${isNeg ? "-" : ""}${symbol} ${fmtAmt(Math.abs(net))}`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Quick stats ── */}
      <section className="grid grid-cols-2 gap-4 relative z-10">
        {/* Ahorros */}
        <button
          onClick={() => navigate("/metas")}
          className="group relative overflow-hidden bg-primary/10 border border-primary/15 rounded-[1.5rem] p-5 flex flex-col gap-4 text-left hover:shadow-lg hover:bg-primary/15 hover:border-primary/30 transition-all active:scale-[0.98]"
        >
          <div className="relative flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <PiggyBank size={20} strokeWidth={2.5} />
            </div>
            {loading ? (
              <Loader2 size={14} className="animate-spin text-primary/60" />
            ) : (
              <span className="text-[11px] font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                {savingsPct}%
              </span>
            )}
          </div>
          <div className="relative w-full">
            <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-1">
              Ahorros
            </p>
            <p className="text-xl font-black text-on-surface font-currency tracking-tight">
              {loading ? "—" : `$ ${fmtAmt(totalSavings)}`}
            </p>
            <p className="text-[10px] font-semibold text-on-surface-variant mt-1">
              {loading ? "" : `de $ ${fmtAmt(savingsTarget)} meta`}
            </p>
          </div>
          {!loading && savingsTarget > 0 && (
            <div className="relative w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${savingsPct}%` }}
              />
            </div>
          )}
        </button>

        {/* Deudas */}
        <button
          onClick={() => navigate("/metas")}
          className="group relative overflow-hidden bg-error/5 border border-error/15 rounded-[1.5rem] p-5 flex flex-col gap-4 text-left hover:shadow-lg hover:bg-error/10 hover:border-error/30 transition-all active:scale-[0.98]"
        >
          <div className="relative flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-2xl bg-error text-on-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <TrendingDown size={20} strokeWidth={2.5} />
            </div>
            {loading ? (
              <Loader2 size={14} className="animate-spin text-error/60" />
            ) : (
              <span className="text-[11px] font-black text-error bg-error/10 border border-error/20 px-2.5 py-1 rounded-lg">
                {debtPct}%
              </span>
            )}
          </div>
          <div className="relative w-full">
            <p className="text-[10px] font-bold text-error/80 uppercase tracking-widest mb-1">
              Deudas
            </p>
            <p className="text-xl font-black text-on-surface font-currency tracking-tight">
              {loading ? "—" : `$ ${fmtAmt(totalDebt)}`}
            </p>
            <p className="text-[10px] font-semibold text-on-surface-variant mt-1">
              {loading
                ? ""
                : totalDebt === 0 && totalDebtPaid === 0
                  ? "Sin deudas"
                  : `de $ ${fmtAmt(totalDebtAll)}`}
            </p>
          </div>
          {!loading && totalDebtAll > 0 && (
            <div className="relative w-full h-1.5 bg-error/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-error rounded-full"
                style={{ width: `${debtPct}%` }}
              />
            </div>
          )}
        </button>
      </section>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
        {/* Gastos por Categoría */}
        <section className="bg-surface/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-card border border-outline-variant/30 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
            Gastos por Categoría
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="w-32 h-32 shrink-0">
                {/* ❌ ResponsiveContainer Eliminado para evitar Error 244 */}
                <PieChart width={128} height={128}>
                  <Pie
                    data={
                      categoryTotals.length > 0
                        ? categoryTotals
                        : [{ name: "Sin datos", value: 100 }]
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={60}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {(categoryTotals.length > 0 ? categoryTotals : [{}]).map(
                      (_, i) => (
                        <Cell
                          key={i}
                          fill={
                            categoryTotals.length === 0
                              ? "#edebff"
                              : PIE_COLORS[i % PIE_COLORS.length]
                          }
                        />
                      ),
                    )}
                  </Pie>
                  {categoryTotals.length > 0 && (
                    <Tooltip
                      formatter={(v, name) => [`${v}%`, name]}
                      contentStyle={{
                        borderRadius: "1rem",
                        border: "none",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                </PieChart>
              </div>
              <div className="flex flex-col gap-2.5 flex-1">
                {categoryTotals.length === 0 ? (
                  <p className="text-sm font-medium text-outline">
                    Sin gastos aún
                  </p>
                ) : (
                  categoryTotals.map(({ name, value }, i) => (
                    <div
                      key={name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-[13px] font-semibold text-on-surface">
                          {name}
                        </span>
                      </div>
                      <span className="text-[13px] font-black text-on-surface-variant">
                        {value}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* Ingresos por Categoría */}
        <section className="bg-surface/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-card border border-outline-variant/30 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
            Ingresos por Categoría
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="w-32 h-32 shrink-0">
                {/* ❌ ResponsiveContainer Eliminado para evitar Error 244 */}
                <PieChart width={128} height={128}>
                  <Pie
                    data={
                      incomeTotals.length > 0
                        ? incomeTotals
                        : [{ name: "Sin datos", value: 100 }]
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={60}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {(incomeTotals.length > 0 ? incomeTotals : [{}]).map(
                      (_, i) => (
                        <Cell
                          key={i}
                          fill={
                            incomeTotals.length === 0
                              ? "#dcfce7"
                              : INCOME_COLORS[i % INCOME_COLORS.length]
                          }
                        />
                      ),
                    )}
                  </Pie>
                  {incomeTotals.length > 0 && (
                    <Tooltip
                      formatter={(v, name) => [`${v}%`, name]}
                      contentStyle={{
                        borderRadius: "1rem",
                        border: "none",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                </PieChart>
              </div>
              <div className="flex flex-col gap-2.5 flex-1">
                {incomeTotals.length === 0 ? (
                  <p className="text-sm font-medium text-outline">
                    Sin ingresos aún
                  </p>
                ) : (
                  incomeTotals.map(({ name, value }, i) => (
                    <div
                      key={name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{
                            backgroundColor:
                              INCOME_COLORS[i % INCOME_COLORS.length],
                          }}
                        />
                        <span className="text-[13px] font-semibold text-on-surface">
                          {name}
                        </span>
                      </div>
                      <span className="text-[13px] font-black text-on-surface-variant">
                        {value}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Transactions ── */}
      <section className="bg-surface/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-card border border-outline-variant/30 flex flex-col gap-4 relative z-10">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
            Transacciones
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={refetch}
              className="text-on-surface-variant hover:text-primary transition-colors active:rotate-180 duration-300"
            >
              <RefreshCw size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => navigate("/movimientos")}
              className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1 group hover:bg-primary/10 px-2 py-1 rounded-lg transition-colors"
            >
              Ver todas
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <Wallet size={20} />
            </div>
            <p className="text-sm font-semibold text-on-surface-variant">
              Sin movimientos aún
            </p>
            <button
              onClick={() => navigate("/movimientos")}
              className="text-xs text-primary font-bold hover:underline"
            >
              Registrar primero
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentTransactions.map((tx) => {
              const cat = tx.categories;
              const Icon = getIcon(cat?.icon);
              const color = cat?.color ?? "#6b7280";
              return (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-3 rounded-[1rem] hover:bg-surface-container-lowest border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-[0.85rem] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: color + "1a" }}
                    >
                      <Icon size={20} style={{ color }} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-black text-on-surface leading-tight tracking-tight">
                        {tx.description}
                      </span>
                      <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
                        {timeFromISO(tx.created_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={[
                      "text-[15px] font-black shrink-0 tracking-tight",
                      tx.type === "income" ? "text-success" : "text-on-surface",
                    ].join(" ")}
                  >
                    {tx.type === "income" ? "+" : "-"}$ {fmtAmt(tx.amount)}{" "}
                    <span className="text-[10px] uppercase font-bold opacity-60 ml-0.5">
                      {tx.currency}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
