import { useEffect, useCallback, useReducer } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export function useCategories() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(
    (s, a) => ({ ...s, ...a }),
    { categories: [], loading: true },
  );

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("name");
    dispatch({ categories: data ?? [], loading: false });
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addCategory(payload) {
    if (!user) return;
    const { error } = await supabase
      .from("categories")
      .insert({ ...payload, user_id: user.id });
    if (error) throw error;
    await fetch();
  }

  async function updateCategory(id, changes) {
    const { error } = await supabase
      .from("categories")
      .update(changes)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    await fetch();
  }

  async function deleteCategory(id) {
    await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id);
    await fetch();
  }

  return { ...state, addCategory, updateCategory, deleteCategory, refetch: fetch };
}

const txInitial = { transactions: [], loading: true, saving: false, error: null };

function txReducer(s, action) {
  switch (action.type) {
    case "FETCH_START":  return { ...s, loading: true };
    case "FETCH_OK":     return { ...s, loading: false, transactions: action.data, error: null };
    case "FETCH_ERROR":  return { ...s, loading: false, error: action.error };
    case "SAVE_START":   return { ...s, saving: true, error: null };
    case "SAVE_OK":      return { ...s, saving: false };
    case "SAVE_ERROR":   return { ...s, saving: false, error: action.error };
    default:             return s;
  }
}

export function useTransactions() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(txReducer, txInitial);

  const fetch = useCallback(async () => {
    if (!user) return;
    dispatch({ type: "FETCH_START" });
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `id, type, amount, currency, description, date, notes, created_at,
         categories ( id, name, icon, color )`,
      )
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);

    dispatch(
      error
        ? { type: "FETCH_ERROR", error: error.message }
        : { type: "FETCH_OK", data: data ?? [] },
    );
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function addTransaction(payload) {
    if (!user) return false;
    dispatch({ type: "SAVE_START" });
    const { error } = await supabase
      .from("transactions")
      .insert({ ...payload, user_id: user.id });

    if (error) {
      dispatch({ type: "SAVE_ERROR", error: error.message });
      return false;
    }
    await fetch();
    dispatch({ type: "SAVE_OK" });
    return true;
  }

  async function deleteTransaction(id) {
    if (!user) return false;
    dispatch({ type: "SAVE_START" });
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      dispatch({ type: "SAVE_ERROR", error: error.message });
      return false;
    }
    dispatch({ type: "FETCH_OK", data: state.transactions.filter((t) => t.id !== id) });
    dispatch({ type: "SAVE_OK" });
    return true;
  }

  async function updateTransaction(id, changes) {
    if (!user) return false;
    dispatch({ type: "SAVE_START" });
    const { error } = await supabase
      .from("transactions")
      .update(changes)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      dispatch({ type: "SAVE_ERROR", error: error.message });
      return false;
    }
    await fetch();
    dispatch({ type: "SAVE_OK" });
    return true;
  }

  return {
    transactions: state.transactions,
    loading:      state.loading,
    saving:       state.saving,
    error:        state.error,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    refetch: fetch,
  };
}
