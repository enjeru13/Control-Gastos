import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_CURRENCY } from '../constants/currencies'

export const useStore = create(
  persist(
    (set, get) => ({
      /* Auth */
      user: null,
      setUser: (user) => set({ user }),

      /* Currency */
      activeCurrency: DEFAULT_CURRENCY,
      exchangeRates: {},
      setActiveCurrency: (code) => set({ activeCurrency: code }),
      setExchangeRates: (rates) => set({ exchangeRates: rates }),

      /* UI */
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'finanzas-store',
      partialize: (state) => ({
        activeCurrency: state.activeCurrency,
        exchangeRates: state.exchangeRates,
      }),
    }
  )
)
