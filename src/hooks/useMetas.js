import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// ── Savings Goals ──────────────────────────────────────────

export function useSavingsGoals() {
  const { user } = useAuth()
  const [goals, setGoals]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('created_at', { ascending: false })
    setGoals(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  async function addGoal(payload) {
    if (!user) return false
    const { error } = await supabase
      .from('savings_goals')
      .insert({ ...payload, user_id: user.id })
    if (error) throw error
    await fetch()
    return true
  }

  async function updateGoal(id, patch) {
    const { error } = await supabase.from('savings_goals').update(patch).eq('id', id)
    if (error) throw error
    await fetch()
  }

  async function deleteGoal(id) {
    await supabase.from('savings_goals').delete().eq('id', id)
    await fetch()
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal, refetch: fetch }
}

// ── Debts ──────────────────────────────────────────────────

export function useDebts() {
  const { user } = useAuth()
  const [debts, setDebts]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_settled', false)
      .order('created_at', { ascending: false })
    setDebts(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  async function addDebt(payload) {
    if (!user) return false
    const { error } = await supabase
      .from('debts')
      .insert({ ...payload, user_id: user.id })
    if (error) throw error
    await fetch()
    return true
  }

  async function updateDebt(id, patch) {
    const { error } = await supabase.from('debts').update(patch).eq('id', id)
    if (error) throw error
    await fetch()
  }

  async function deleteDebt(id) {
    await supabase.from('debts').delete().eq('id', id)
    await fetch()
  }

  return { debts, loading, addDebt, updateDebt, deleteDebt, refetch: fetch }
}

// ── Wishlist ───────────────────────────────────────────────

export function useWishlist() {
  const { user } = useAuth()
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_purchased', false)
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  async function addItem(payload) {
    if (!user) return false
    const { error } = await supabase
      .from('wishlist_items')
      .insert({ ...payload, user_id: user.id })
    if (error) throw error
    await fetch()
    return true
  }

  async function deleteItem(id) {
    await supabase.from('wishlist_items').delete().eq('id', id)
    await fetch()
  }

  return { items, loading, addItem, deleteItem, refetch: fetch }
}
