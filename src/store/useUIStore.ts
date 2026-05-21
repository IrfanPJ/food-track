import { create } from 'zustand'

interface UIState {
  isChatOpen: boolean
  isAddFoodOpen: boolean
  isAddWorkoutOpen: boolean
  sidebarCollapsed: boolean
  setChatOpen: (open: boolean) => void
  setAddFoodOpen: (open: boolean) => void
  setAddWorkoutOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isChatOpen: false,
  isAddFoodOpen: false,
  isAddWorkoutOpen: false,
  sidebarCollapsed: false,
  setChatOpen: (isChatOpen) => set({ isChatOpen }),
  setAddFoodOpen: (isAddFoodOpen) => set({ isAddFoodOpen }),
  setAddWorkoutOpen: (isAddWorkoutOpen) => set({ isAddWorkoutOpen }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
