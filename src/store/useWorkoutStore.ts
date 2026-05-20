import { create } from 'zustand'
import { Workout, Exercise } from '@/types'

interface WorkoutState {
  todayWorkout: Workout | null
  exercises: Exercise[]
  isLoading: boolean
  setTodayWorkout: (workout: Workout | null) => void
  setExercises: (exercises: Exercise[]) => void
  updateWorkoutStatus: (status: Workout['status']) => void
  setLoading: (loading: boolean) => void
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  todayWorkout: null,
  exercises: [],
  isLoading: false,
  setTodayWorkout: (todayWorkout) => set({ todayWorkout }),
  setExercises: (exercises) => set({ exercises }),
  updateWorkoutStatus: (status) =>
    set((state) => ({
      todayWorkout: state.todayWorkout
        ? { ...state.todayWorkout, status }
        : null,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))
