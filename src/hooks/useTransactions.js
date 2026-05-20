import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('categories')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data)
        setLoading(false)
      })
  }, [user])

  return { categories, loading }
}

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id, type, amount, currency, description, date, notes, created_at,
        categories ( id, name, icon, color )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) setError(error.message)
    else setTransactions(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  async function addTransaction(payload) {
    if (!user) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('transactions')
      .insert({ ...payload, user_id: user.id })

    if (error) { setError(error.message); setSaving(false); return false }
    await fetch()
    setSaving(false)
    return true
  }

  return { transactions, loading, saving, error, addTransaction, refetch: fetch }
}
