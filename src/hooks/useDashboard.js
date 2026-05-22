import { useEffect, useCallback, useReducer } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const initial = {
  recentTransactions: [],
  categoryTotals: [],
  incomeTotals: [],
  balances: { USD: 0, VES: 0, COP: 0 },
  totalDebt: 0,
  totalDebtPaid: 0,
  totalSavings: 0,
  savingsTarget: 0,
  loading: true,
};

function reducer(s, action) {
  switch (action.type) {
    case "LOAD_START": return { ...s, loading: true };
    case "LOAD_OK":    return { ...action.payload, loading: false };
    default:           return s;
  }
}

export function useDashboard() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initial);

  const load = useCallback(async () => {
    if (!user) return;
    dispatch({ type: "LOAD_START" });

    const [txRes, debtRes, savingsRes] = await Promise.all([
      supabase
        .from("transactions")
        .select(
          "id, type, amount, currency, description, date, created_at, categories(name, icon, color)",
        )
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200),

      supabase
        .from("debts")
        .select("total_amount, paid_amount")
        .eq("user_id", user.id)
        .eq("is_settled", false),

      supabase
        .from("savings_goals")
        .select("current_amount, target_amount")
        .eq("user_id", user.id)
        .eq("is_completed", false),
    ]);

    const transactions = txRes.data ?? [];
    const debts        = debtRes.data ?? [];
    const goals        = savingsRes.data ?? [];

    // Category totals — count-based, last 30 days, expenses only
    const cutoff    = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const catMap = {};
    for (const tx of transactions) {
      if (tx.type !== "expense" || tx.date < cutoffStr) continue;
      const name = tx.categories?.name ?? "Otros";
      catMap[name] = (catMap[name] ?? 0) + 1;
    }
    const totalCount   = Object.values(catMap).reduce((s, v) => s + v, 0);
    const categoryTotals = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        value: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }));

    const incomeMap = {};
    for (const tx of transactions) {
      if (tx.type !== "income" || tx.date < cutoffStr) continue;
      const name = tx.categories?.name ?? "Otros";
      incomeMap[name] = (incomeMap[name] ?? 0) + 1;
    }
    const incomeTotalCount = Object.values(incomeMap).reduce((s, v) => s + v, 0);
    const incomeTotals = Object.entries(incomeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        value: incomeTotalCount > 0 ? Math.round((count / incomeTotalCount) * 100) : 0,
      }));

    // Net balance per currency (income - expense, all time)
    const balances = { USD: 0, VES: 0, COP: 0 };
    for (const tx of transactions) {
      const cur = tx.currency;
      if (!(cur in balances)) balances[cur] = 0;
      balances[cur] += tx.type === "income"
        ? Number(tx.amount)
        : -Number(tx.amount);
    }

    dispatch({
      type: "LOAD_OK",
      payload: {
        recentTransactions: transactions.slice(0, 5),
        categoryTotals,
        incomeTotals,
        balances,
        totalDebt:     debts.reduce((s, d) => s + (Number(d.total_amount) - Number(d.paid_amount)), 0),
        totalDebtPaid: debts.reduce((s, d) => s + Number(d.paid_amount), 0),
        totalSavings:  goals.reduce((s, g) => s + Number(g.current_amount), 0),
        savingsTarget: goals.reduce((s, g) => s + Number(g.target_amount), 0),
      },
    });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { ...state, refetch: load };
}
