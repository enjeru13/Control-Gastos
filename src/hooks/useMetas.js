import { useEffect, useCallback, useReducer } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const patch = (s, a) => ({ ...s, ...a });

// ── Savings Goals ──────────────────────────────────────────

export function useSavingsGoals() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(patch, { goals: [], loading: true });

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .order("created_at", { ascending: false });
    dispatch({ goals: data ?? [], loading: false });
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addGoal(payload) {
    if (!user) return false;
    const { error } = await supabase
      .from("savings_goals")
      .insert({ ...payload, user_id: user.id });
    if (error) throw error;
    await fetch();
    return true;
  }

  async function updateGoal(id, changes) {
    const { error } = await supabase
      .from("savings_goals").update(changes).eq("id", id);
    if (error) throw error;
    await fetch();
  }

  async function deleteGoal(id) {
    await supabase.from("savings_goals").delete().eq("id", id);
    await fetch();
  }

  return { ...state, addGoal, updateGoal, deleteGoal, refetch: fetch };
}

// ── Debts ──────────────────────────────────────────────────

export function useDebts() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(patch, { debts: [], loading: true });

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_settled", false)
      .order("created_at", { ascending: false });
    dispatch({ debts: data ?? [], loading: false });
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addDebt(payload) {
    if (!user) return false;
    const { error } = await supabase
      .from("debts")
      .insert({ ...payload, user_id: user.id });
    if (error) throw error;
    await fetch();
    return true;
  }

  async function updateDebt(id, changes) {
    const { error } = await supabase.from("debts").update(changes).eq("id", id);
    if (error) throw error;
    await fetch();
  }

  async function deleteDebt(id) {
    await supabase.from("debts").delete().eq("id", id);
    await fetch();
  }

  async function addDebtPayment(debtId, { amount, notes, date }) {
    if (!user) return false;
    const { error } = await supabase
      .from("debt_payments")
      .insert({
        debt_id: debtId,
        user_id: user.id,
        amount,
        notes: notes || null,
        date: date || new Date().toISOString().slice(0, 10),
      });
    if (error) throw error;
    return true;
  }

  return { ...state, addDebt, updateDebt, deleteDebt, addDebtPayment, refetch: fetch };
}

// ── Wishlist ───────────────────────────────────────────────

export function useWishlist() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(patch, { items: [], loading: true });

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_purchased", false)
      .order("created_at", { ascending: false });
    dispatch({ items: data ?? [], loading: false });
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addItem(payload) {
    if (!user) return false;
    const { error } = await supabase
      .from("wishlist_items")
      .insert({ ...payload, user_id: user.id });
    if (error) throw error;
    await fetch();
    return true;
  }

  async function deleteItem(id) {
    await supabase.from("wishlist_items").delete().eq("id", id);
    await fetch();
  }

  return { ...state, addItem, deleteItem, refetch: fetch };
}
