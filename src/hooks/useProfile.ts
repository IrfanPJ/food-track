'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'
import { Profile } from '@/types'
import { toast } from 'sonner'

export function useProfile() {
  const { profile, isLoading, setProfile, setLoading, updateProfile } = useUserStore()

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setProfile(null)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setProfile(data)
      } else {
        // Create default profile
        const newProfile = {
          user_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          weight: 70,
          height: 175,
          goal: 'improve_fitness' as const,
          calories_target: 2000,
          protein_target: 150,
          carbs_target: 200,
          fat_target: 65,
          water_target: 8,
          sleep_target: 8,
          workout_split: 'push-pull-legs',
        }
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()
        if (createError) throw createError
        setProfile(created)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }, [setProfile, setLoading])

  const saveProfile = useCallback(
    async (updates: Partial<Profile>) => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error
        updateProfile(data)
        toast.success('Profile saved!')
      } catch (err) {
        console.error('Error saving profile:', err)
        toast.error('Failed to save profile')
      }
    },
    [updateProfile]
  )

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, isLoading, refetch: fetchProfile, saveProfile }
}
