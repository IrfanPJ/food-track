'use client'

import { WORKOUT_TYPES } from '@/lib/constants'

interface WorkoutTemplatesProps {
  onSelect: (type: string) => void
}

export default function WorkoutTemplates({ onSelect }: WorkoutTemplatesProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {WORKOUT_TYPES.filter(t => t.value !== 'custom').map((wt) => (
        <button
          key={wt.value}
          onClick={() => onSelect(wt.value)}
          className="p-4 rounded-2xl bg-zinc-800 border border-zinc-700 hover:border-violet-500/50 hover:bg-zinc-700 text-left transition-all group"
        >
          <p className="font-semibold text-zinc-200 text-sm group-hover:text-violet-400 transition-colors">
            {wt.label}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{wt.description}</p>
        </button>
      ))}
    </div>
  )
}
