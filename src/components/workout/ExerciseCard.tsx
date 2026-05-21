'use client'

import { Exercise } from '@/types'
import { Dumbbell } from 'lucide-react'

interface ExerciseCardProps {
  exercise: Exercise
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-800">
      <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center shrink-0">
        <Dumbbell className="w-5 h-5 text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-200 text-sm">{exercise.name}</p>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-zinc-500">
            <span className="text-zinc-300 font-medium">{exercise.sets}</span> sets
          </span>
          <span className="text-xs text-zinc-500">
            <span className="text-zinc-300 font-medium">{exercise.reps}</span> reps
          </span>
          {exercise.weight > 0 && (
            <span className="text-xs text-zinc-500">
              <span className="text-zinc-300 font-medium">{exercise.weight}</span> kg
            </span>
          )}
          {exercise.rest_seconds > 0 && (
            <span className="text-xs text-zinc-500">
              <span className="text-zinc-300 font-medium">{exercise.rest_seconds}s</span> rest
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
