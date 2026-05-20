'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UtensilsCrossed } from 'lucide-react'
import { MealLog } from '@/types'
import { getMealTypeEmoji, getMealTypeLabel } from '@/lib/utils'

interface UpcomingMealsProps {
  meals: MealLog[]
}

export default function UpcomingMeals({ meals }: UpcomingMealsProps) {
  const incomplete = meals.filter((m) => !m.completed).slice(0, 3)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
          <UtensilsCrossed className="w-4 h-4 text-violet-400" />
          Upcoming Meals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {incomplete.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-3">All meals logged!</p>
        ) : (
          incomplete.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800"
            >
              <span className="text-lg">{getMealTypeEmoji(meal.meal_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{meal.food_name}</p>
                <p className="text-xs text-zinc-500">{getMealTypeLabel(meal.meal_type)}</p>
              </div>
              <span className="text-xs text-zinc-400 shrink-0">{meal.calories} kcal</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
