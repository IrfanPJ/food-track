'use client'

import { useState } from 'react'
import { MEAL_TYPES } from '@/lib/constants'
import MealSection from './MealSection'
import AddFoodModal from './AddFoodModal'
import { MealLog } from '@/types'

interface FoodLogProps {
  logs: MealLog[]
  onAdd: (data: Omit<MealLog, 'id' | 'user_id'>) => void
  onDelete: (id: string) => void
}

export default function FoodLog({ logs, onAdd, onDelete }: FoodLogProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState('breakfast')

  const handleAdd = (mealType: string) => {
    setSelectedMealType(mealType)
    setAddModalOpen(true)
  }

  const getLogsForMeal = (mealType: string) =>
    logs.filter((l) => l.meal_type === mealType)

  return (
    <div className="space-y-6">
      {MEAL_TYPES.map((meal) => (
        <MealSection
          key={meal.value}
          mealType={meal.value}
          logs={getLogsForMeal(meal.value)}
          onAdd={handleAdd}
          onDelete={onDelete}
        />
      ))}

      <AddFoodModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        defaultMealType={selectedMealType}
        onAdd={onAdd}
      />
    </div>
  )
}
