import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useDashboard() {
  const { user } = useAuth()
  const [state, setState] = useState({
    recentTransactions: [],
    categoryTotals: [],
    totalDebt: 0,
    totalDebtPaid: 0,
    totalSavings: 0,
    savingsTarget: 0,
    loading: true,
  })

  const load = useCallback(async () => {
    if (!user) return
    setState((s) => ({ ...s, loading: true }))

    const [txRes, debtRes, savingsRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('id, type, amount, currency, description, date, created_at, categories(name, icon, color)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20),

      supabase
        .from('debts')
        .select('total_amount, paid_amount')
        .eq('user_id', user.id)
        .eq('is_settled', false),

      supabase
        .from('savings_goals')
        .select('current_amount, target_amount')
        .eq('user_id', user.id)
        .eq('is_completed', false),
    ])

    const transactions = txRes.data ?? []
    const debts = debtRes.data ?? []
    const goals = savingsRes.data ?? []

    // Category totals — all currencies, last 30 days, expenses only
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffStr = cutoff.toISOString().slice(0, 10)

    const catMap = {}
    for (const tx of transactions) {
      if (tx.type !== 'expense' || tx.date < cutoffStr) continue
      const name = tx.categories?.name ?? 'Otros'
      catMap[name] = (catMap[name] ?? 0) + 1   // count-based % (multi-currency safe)
    }
    const totalCount = Object.values(catMap).reduce((s, v) => s + v, 0)
    const categoryTotals = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        value: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))

    const totalDebt     = debts.reduce((s, d) => s + (Number(d.total_amount) - Number(d.paid_amount)), 0)
    const totalDebtPaid = debts.reduce((s, d) => s + Number(d.paid_amount), 0)
    const totalSavings  = goals.reduce((s, g) => s + Number(g.current_amount), 0)
    const savingsTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0)

    setState({
      recentTransactions: transactions.slice(0, 5),
      categoryTotals,
      totalDebt,
      totalDebtPaid,
      totalSavings,
      savingsTarget,
      loading: false,
    })
  }, [user])

  useEffect(() => { load() }, [load])

  return { ...state, refetch: load }
}
