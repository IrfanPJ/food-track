import { create } from 'zustand'
import { MealLog, MacroSummary } from '@/types'

interface FoodState {
  todayLogs: MealLog[]
  isLoading: boolean
  setTodayLogs: (logs: MealLog[]) => void
  addLog: (log: MealLog) => void
  updateLog: (id: string, updates: Partial<MealLog>) => void
  removeLog: (id: string) => void
  setLoading: (loading: boolean) => void
  getTodayMacros: () => MacroSummary
}

export const useFoodStore = create<FoodState>((set, get) => ({
  todayLogs: [],
  isLoading: false,
  setTodayLogs: (logs) => set({ todayLogs: logs }),
  addLog: (log) => set((state) => ({ todayLogs: [...state.todayLogs, log] })),
  updateLog: (id, updates) =>
    set((state) => ({
      todayLogs: state.todayLogs.map((log) =>
        log.id === id ? { ...log, ...updates } : log
      ),
    })),
  removeLog: (id) =>
    set((state) => ({
      todayLogs: state.todayLogs.filter((log) => log.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  getTodayMacros: () => {
    const logs = get().todayLogs
    return logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories * log.quantity,
        protein: acc.protein + log.protein * log.quantity,
        carbs: acc.carbs + log.carbs * log.quantity,
        fat: acc.fat + log.fat * log.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  },
}))
