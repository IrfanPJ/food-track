'use client'

import { Plus } from 'lucide-react'
import { MealLog } from '@/types'
import FoodCard from './FoodCard'
import { getMealTypeEmoji, getMealTypeLabel } from '@/lib/utils'

interface MealSectionProps {
  mealType: string
  logs: MealLog[]
  onAdd: (mealType: string) => void
  onDelete: (id: string) => void
}

export default function MealSection({ mealType, logs, onAdd, onDelete }: MealSectionProps) {
  const totalCalories = logs.reduce((acc, l) => acc + l.calories * l.quantity, 0)

  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{getMealTypeEmoji(mealType)}</span>
          <h3 className="font-semibold text-zinc-200 text-sm">{getMealTypeLabel(mealType)}</h3>
          {totalCalories > 0 && (
            <span className="text-xs text-zinc-500">{Math.round(totalCalories)} kcal</span>
          )}
        </div>
        <button
          onClick={() => onAdd(mealType)}
          className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-violet-600 hover:text-white transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Food items */}
      {logs.length > 0 ? (
        <div className="space-y-1.5">
          {logs.map((log) => (
            <FoodCard key={log.id} log={log} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-zinc-800 rounded-xl p-4 text-center cursor-pointer hover:border-violet-500/30 transition-all group"
          onClick={() => onAdd(mealType)}
        >
          <p className="text-sm text-zinc-600 group-hover:text-zinc-400">
            + Add {getMealTypeLabel(mealType)}
          </p>
        </div>
      )}
    </div>
  )
}
