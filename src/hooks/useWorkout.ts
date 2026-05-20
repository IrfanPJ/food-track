'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useWorkoutStore } from '@/store/useWorkoutStore'
import { Workout, Exercise } from '@/types'
import { getTodayISO } from '@/lib/utils'
import { toast } from 'sonner'

export function useWorkout() {
  const { todayWorkout, exercises, isLoading, setTodayWorkout, setExercises, setLoading } =
    useWorkoutStore()

  const fetchTodayWorkout = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const today = getTodayISO()
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', today)
        .single()

      if (workoutError && workoutError.code !== 'PGRST116') throw workoutError

      setTodayWorkout(workoutData || null)

      if (workoutData) {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('*')
          .eq('workout_id', workoutData.id)
          .order('order_index', { ascending: true })

        if (exerciseError) throw exerciseError
        setExercises(exerciseData || [])
      }
    } catch (err) {
      console.error('Error fetching workout:', err)
    } finally {
      setLoading(false)
    }
  }, [setTodayWorkout, setExercises, setLoading])

  const createWorkout = useCallback(
    async (workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>) => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('workouts')
          .insert({ ...workout, user_id: user.id })
          .select()
          .single()

        if (error) throw error
        setTodayWorkout(data)
        toast.success('Workout created!')
        return data
      } catch (err) {
        console.error('Error creating workout:', err)
        toast.error('Failed to create workout')
      }
    },
    [setTodayWorkout]
  )

  const addExercise = useCallback(
    async (exercise: Omit<Exercise, 'id'>) => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('exercises')
          .insert(exercise)
          .select()
          .single()

        if (error) throw error
        setExercises([...exercises, data])
        toast.success('Exercise added!')
      } catch (err) {
        console.error('Error adding exercise:', err)
        toast.error('Failed to add exercise')
      }
    },
    [exercises, setExercises]
  )

  const updateWorkoutStatus = useCallback(
    async (workoutId: string, status: Workout['status']) => {
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('workouts')
          .update({ status })
          .eq('id', workoutId)

        if (error) throw error
        if (todayWorkout) setTodayWorkout({ ...todayWorkout, status })
        toast.success(`Workout marked as ${status}!`)
      } catch (err) {
        console.error('Error updating workout status:', err)
        toast.error('Failed to update workout')
      }
    },
    [todayWorkout, setTodayWorkout]
  )

  useEffect(() => {
    fetchTodayWorkout()
  }, [fetchTodayWorkout])

  return {
    todayWorkout,
    exercises,
    isLoading,
    refetch: fetchTodayWorkout,
    createWorkout,
    addExercise,
    updateWorkoutStatus,
  }
}
