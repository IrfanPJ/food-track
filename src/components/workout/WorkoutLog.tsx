'use client'

import { useState } from 'react'
import { Workout, Exercise } from '@/types'
import ExerciseCard from './ExerciseCard'
import AddWorkoutModal from './AddWorkoutModal'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckCircle, PlayCircle, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExerciseInput {
  name: string
  sets: number
  reps: number
  weight: number
  rest_seconds: number
  order_index?: number
  notes?: string
}

interface WorkoutLogProps {
  workout: Workout | null
  exercises: Exercise[]
  onCreateWorkout: (workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>, exs: ExerciseInput[]) => void
  onUpdateStatus: (workoutId: string, status: Workout['status']) => void
}

export default function WorkoutLog({ workout, exercises, onCreateWorkout, onUpdateStatus }: WorkoutLogProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)

  const handleCreate = async (w: Omit<Workout, 'id' | 'user_id' | 'created_at'>, exs: ExerciseInput[]) => {
    onCreateWorkout(w, exs)
  }

  if (!workout) {
    return (
      <>
        <EmptyState
          icon={Dumbbell}
          title="No workout today"
          description="Plan your workout to stay on track with your fitness goals"
          action={{ label: 'Create Workout', onClick: () => setAddModalOpen(true) }}
        />
        <AddWorkoutModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onAdd={handleCreate}
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Workout header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">{workout.name}</h2>
            <p className="text-sm text-zinc-400 mt-1">
              {exercises.length} exercises &bull;{' '}
              {workout.type.replace('_', ' ')}
            </p>
          </div>
          <Badge
            className={cn(
              workout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              workout.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
              workout.status === 'missed' ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'
            )}
          >
            {workout.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {workout.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(workout.id, 'in_progress')}
              className="gap-1.5"
            >
              <PlayCircle className="w-4 h-4" />
              Start Workout
            </Button>
          )}
          {workout.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(workout.id, 'completed')}
              className="gap-1.5 bg-green-600 hover:bg-green-500"
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-300 text-sm">Exercises</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAddModalOpen(true)}
            className="text-xs gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>

        {exercises.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">No exercises added</p>
        ) : (
          <div className="space-y-2">
            {exercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        )}
      </div>

      <AddWorkoutModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleCreate}
      />
    </div>
  )
}
