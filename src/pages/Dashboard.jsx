import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { getIcon } from "../lib/categoryIcons";

const PIE_COLORS = ["#1b667c", "#64a6bd", "#9f99ba", "#8ed0e8", "#c9c2e5"];

const CURRENCY_BALANCES = [
  { code: "VES", display: "Bs. —" },
  { code: "COP", display: "$ —" },
  { code: "USD", display: "$ —" },
];

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
  const pieData =
    categoryTotals.length > 0
      ? categoryTotals
      : [{ name: "Sin datos", value: 100 }];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Hero Balance ── */}
      <section className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-linear-to-br from-primary to-tertiary-container text-on-primary">
          <div className="absolute top-[-40%] right-[-8%] w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wider opacity-80 uppercase">
              Saldo Total Estimado
            </span>
            <h2 className="text-4xl font-bold font-currency tracking-tight">
              $ —
            </h2>
            <span className="text-xs opacity-70 mt-1">
              Conecta tus cuentas para ver tu balance
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {CURRENCY_BALANCES.map(({ code, display }) => (
            <div
              key={code}
              className="bg-surface rounded-xl p-3 shadow-card flex flex-col gap-1"
            >
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="text-[10px] font-semibold tracking-wide uppercase">
                  {code}
                </span>
                <Wallet size={13} />
              </div>
              <p className="text-sm font-bold font-currency text-on-surface leading-tight">
                {display}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick stats ── */}
      <section className="grid grid-cols-2 gap-3">
        {/* Ahorros */}
        <button
          onClick={() => navigate("/metas")}
          className="bg-primary-container/60 rounded-2xl p-4 flex flex-col gap-2 text-left hover:shadow-overlay transition-shadow active:scale-[0.98] border border-primary/10"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <PiggyBank size={18} className="text-primary" />
            </div>
            {loading ? (
              <Loader2 size={14} className="animate-spin text-primary/60" />
            ) : (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {savingsPct}%
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wide">
              Ahorros
            </p>
            <p className="text-lg font-bold text-primary font-currency mt-0.5">
              {loading ? "—" : `$ ${fmtAmt(totalSavings)}`}
            </p>
            <p className="text-[10px] text-primary/60 mt-0.5">
              {loading ? "" : `de $ ${fmtAmt(savingsTarget)} meta`}
            </p>
          </div>
          {!loading && savingsTarget > 0 && (
            <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
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
          className="bg-error-container/40 rounded-2xl p-4 flex flex-col gap-2 text-left hover:shadow-overlay transition-shadow active:scale-[0.98] border border-error-container"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-error-container flex items-center justify-center">
              <TrendingDown size={18} className="text-error" />
            </div>
            {loading ? (
              <Loader2 size={14} className="animate-spin text-error/60" />
            ) : (
              <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                {debtPct}% pag.
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-error/70 uppercase tracking-wide">
              Deudas
            </p>
            <p className="text-lg font-bold text-error font-currency mt-0.5">
              {loading ? "—" : `$ ${fmtAmt(totalDebt)}`}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              {loading
                ? ""
                : totalDebt === 0 && totalDebtPaid === 0
                  ? "Sin deudas"
                  : `de $ ${fmtAmt(totalDebtAll)}`}
            </p>
          </div>
          {!loading && totalDebtAll > 0 && (
            <div className="w-full h-1 bg-error/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-error to-success rounded-full"
                style={{ width: `${debtPct}%` }}
              />
            </div>
          )}
        </button>
      </section>

      {/* ── Charts + Transactions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie chart */}
        <section className="bg-surface rounded-2xl p-5 shadow-card flex flex-col gap-4">
          <h3 className="text-base font-bold text-on-surface">
            Gastos por Categoría
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={56}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            categoryTotals.length === 0
                              ? "#e7eeff"
                              : PIE_COLORS[i % PIE_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    {categoryTotals.length > 0 && (
                      <Tooltip
                        formatter={(v, name) => [`${v}%`, name]}
                        contentStyle={{
                          borderRadius: "0.75rem",
                          border: "none",
                          boxShadow: "0 4px 24px rgb(144 168 195/0.2)",
                          fontSize: "12px",
                        }}
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {categoryTotals.length === 0 ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-on-surface-variant">
                      Sin gastos aún
                    </p>
                    <p className="text-xs text-on-surface-variant opacity-70">
                      Registra movimientos para ver el análisis
                    </p>
                  </div>
                ) : (
                  categoryTotals.map(({ name, value }, i) => (
                    <div
                      key={name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-sm text-on-surface">{name}</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">
                        {value}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* Recent transactions */}
        <section className="bg-surface rounded-2xl p-5 shadow-card flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-on-surface">
              Transacciones
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={refetch}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => navigate("/movimientos")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Ver todas
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <p className="text-sm font-semibold text-on-surface-variant">
                Sin movimientos aún
              </p>
              <button
                onClick={() => navigate("/movimientos")}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Registrar primero
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {recentTransactions.map((tx) => {
                const cat = tx.categories;
                const Icon = getIcon(cat?.icon);
                const color = cat?.color ?? "#6b7280";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: color + "1a" }}
                      >
                        <Icon size={16} style={{ color }} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface leading-tight">
                          {tx.description}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {timeFromISO(tx.created_at)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={[
                        "text-sm font-bold shrink-0",
                        tx.type === "income"
                          ? "text-primary"
                          : "text-on-surface",
                      ].join(" ")}
                    >
                      {tx.type === "income" ? "+" : "-"}$ {fmtAmt(tx.amount)}{" "}
                      {tx.currency}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
