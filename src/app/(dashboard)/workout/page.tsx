'use client'

import { useWorkout } from '@/hooks/useWorkout'
import WorkoutLog from '@/components/workout/WorkoutLog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell } from 'lucide-react'
import { Workout } from '@/types'
import { ListSkeleton } from '@/components/shared/LoadingSkeleton'
import { createClient } from '@/lib/supabase/client'
import { useWorkoutStore } from '@/store/useWorkoutStore'

interface ExerciseInput {
  name: string
  sets: number
  reps: number
  weight: number
  rest_seconds: number
  order_index?: number
  notes?: string
}

export default function WorkoutPage() {
  const { todayWorkout, exercises, isLoading, createWorkout, updateWorkoutStatus } = useWorkout()
  const { setExercises } = useWorkoutStore()

  const handleCreateWorkout = async (
    workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>,
    exs: ExerciseInput[]
  ) => {
    const created = await createWorkout(workout)
    if (created && exs.length > 0) {
      const supabase = createClient()
      const exercisesToInsert = exs.map((e, i) => ({
        ...e,
        workout_id: created.id,
        order_index: i,
      }))
      const { data } = await supabase
        .from('exercises')
        .insert(exercisesToInsert)
        .select()
      if (data) setExercises(data)
    }
  }

  const handleUpdateStatus = async (workoutId: string, status: Workout['status']) => {
    await updateWorkoutStatus(workoutId, status)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Workout</h1>
        <p className="text-sm text-zinc-500">Plan and track your training sessions</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="w-5 h-5 text-violet-400" />
            Today&apos;s Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton count={4} />
          ) : (
            <WorkoutLog
              workout={todayWorkout}
              exercises={exercises}
              onCreateWorkout={handleCreateWorkout}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* Weekly overview */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base">Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const dayTypes = ['Pull', 'Legs', 'Rest', 'Push', 'Pull', 'Legs', 'Rest']
              const colors = [
                'bg-blue-500/20 text-blue-400',
                'bg-green-500/20 text-green-400',
                'bg-zinc-800 text-zinc-500',
                'bg-orange-500/20 text-orange-400',
                'bg-blue-500/20 text-blue-400',
                'bg-green-500/20 text-green-400',
                'bg-zinc-800 text-zinc-500',
              ]
              return (
                <div key={day} className="text-center">
                  <p className="text-xs text-zinc-600 mb-1">{day}</p>
                  <div className={`rounded-lg p-2 text-xs font-medium ${colors[i]}`}>
                    {dayTypes[i]}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
