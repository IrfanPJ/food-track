'use client'

import { Trash2 } from 'lucide-react'
import { MealLog } from '@/types'

interface FoodCardProps {
  log: MealLog
  onDelete: (id: string) => void
}

export default function FoodCard({ log, onDelete }: FoodCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/60 border border-zinc-800 group transition-all">
      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shrink-0">
        🍽️
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">
          {log.food_name}
          {log.quantity > 1 && (
            <span className="text-zinc-500 ml-1">x{log.quantity}</span>
          )}
        </p>
        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
          <span>P: {Math.round(log.protein * log.quantity)}g</span>
          <span>C: {Math.round(log.carbs * log.quantity)}g</span>
          <span>F: {Math.round(log.fat * log.quantity)}g</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-zinc-100">
          {Math.round(log.calories * log.quantity)}
        </p>
        <p className="text-xs text-zinc-500">kcal</p>
      </div>
      <button
        onClick={() => onDelete(log.id)}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all ml-1"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
