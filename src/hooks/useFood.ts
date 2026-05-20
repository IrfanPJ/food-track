'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFoodStore } from '@/store/useFoodStore'
import { MealLog } from '@/types'
import { getTodayISO } from '@/lib/utils'
import { toast } from 'sonner'

export function useFood() {
  const { todayLogs, isLoading, setTodayLogs, addLog, removeLog, setLoading, getTodayMacros } =
    useFoodStore()

  const fetchTodayLogs = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const today = getTodayISO()
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00`)
        .lte('logged_at', `${today}T23:59:59`)
        .order('logged_at', { ascending: true })

      if (error) throw error
      setTodayLogs(data || [])
    } catch (err) {
      console.error('Error fetching food logs:', err)
    } finally {
      setLoading(false)
    }
  }, [setTodayLogs, setLoading])

  const addFoodLog = useCallback(
    async (log: Omit<MealLog, 'id' | 'user_id' | 'created_at'>) => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('meal_logs')
          .insert({ ...log, user_id: user.id })
          .select()
          .single()

        if (error) throw error
        addLog(data)
        toast.success('Food logged successfully!')
      } catch (err) {
        console.error('Error adding food log:', err)
        toast.error('Failed to log food')
      }
    },
    [addLog]
  )

  const deleteFoodLog = useCallback(
    async (id: string) => {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('meal_logs').delete().eq('id', id)
        if (error) throw error
        removeLog(id)
        toast.success('Food removed')
      } catch (err) {
        console.error('Error deleting food log:', err)
        toast.error('Failed to remove food')
      }
    },
    [removeLog]
  )

  useEffect(() => {
    fetchTodayLogs()
  }, [fetchTodayLogs])

  return {
    todayLogs,
    isLoading,
    macros: getTodayMacros(),
    refetch: fetchTodayLogs,
    addFoodLog,
    deleteFoodLog,
  }
}
