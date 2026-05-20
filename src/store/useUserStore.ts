import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile } from '@/types'

interface UserState {
  profile: Profile | null
  isLoading: boolean
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  updateProfile: (updates: Partial<Profile>) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: true,
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
