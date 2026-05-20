'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Workout } from '@/types'
import { cn } from '@/lib/utils'

interface WorkoutCardProps {
  workout: Workout | null
  exerciseCount?: number
}

const statusConfig = {
  pending: { label: 'Scheduled', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Dumbbell },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
  missed: { label: 'Missed', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
}

const typeColors: Record<string, string> = {
  push: 'bg-orange-500/20 text-orange-400',
  pull: 'bg-blue-500/20 text-blue-400',
  legs: 'bg-green-500/20 text-green-400',
  full_body: 'bg-purple-500/20 text-purple-400',
  cardio: 'bg-red-500/20 text-red-400',
  rest: 'bg-zinc-500/20 text-zinc-400',
  custom: 'bg-indigo-500/20 text-indigo-400',
}

export default function WorkoutCard({ workout, exerciseCount = 0 }: WorkoutCardProps) {
  if (!workout) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
            <Dumbbell className="w-4 h-4 text-violet-400" />
            Today&apos;s Workout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
              <span className="text-xl">😴</span>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">Rest Day</p>
              <p className="text-xs text-zinc-500">No workout scheduled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const status = statusConfig[workout.status]
  const StatusIcon = status.icon

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
          <Dumbbell className="w-4 h-4 text-violet-400" />
          Today&apos;s Workout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-zinc-100">{workout.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  typeColors[workout.type] || typeColors.custom
                )}
              >
                {workout.type.replace('_', ' ')}
              </span>
              {exerciseCount > 0 && (
                <span className="text-xs text-zinc-500">{exerciseCount} exercises</span>
              )}
            </div>
          </div>
          <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full', status.bg)}>
            <StatusIcon className={cn('w-3.5 h-3.5', status.color)} />
            <span className={cn('text-xs font-medium', status.color)}>{status.label}</span>
          </div>
        </div>
        {workout.duration_minutes && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{workout.duration_minutes} min</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
