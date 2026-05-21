'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MEAL_TYPES } from '@/lib/constants'
import { MealLog } from '@/types'
import { getTodayISO } from '@/lib/utils'

type MealType = MealLog['meal_type']

interface AddFoodModalProps {
  open: boolean
  onClose: () => void
  defaultMealType?: string
  onAdd: (data: Omit<MealLog, 'id' | 'user_id'>) => void
}

const COMMON_FOODS = [
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Brown Rice (100g)', calories: 216, protein: 4.5, carbs: 45, fat: 1.8 },
  { name: 'Eggs (1 large)', calories: 70, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Oatmeal (100g dry)', calories: 389, protein: 17, carbs: 66, fat: 7 },
  { name: 'Banana (medium)', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Greek Yogurt (100g)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: 'Almonds (30g)', calories: 174, protein: 6, carbs: 6, fat: 15 },
  { name: 'Whey Protein (1 scoop)', calories: 120, protein: 25, carbs: 3, fat: 2 },
]

export default function AddFoodModal({ open, onClose, defaultMealType = 'breakfast', onAdd }: AddFoodModalProps) {
  const [mode, setMode] = useState<'quick' | 'manual'>('quick')
  const [mealType, setMealType] = useState<MealType>((defaultMealType as MealType) || 'breakfast')
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [quantity, setQuantity] = useState('1')

  const handleSelectCommon = (food: typeof COMMON_FOODS[0]) => {
    setFoodName(food.name)
    setCalories(food.calories.toString())
    setProtein(food.protein.toString())
    setCarbs(food.carbs.toString())
    setFat(food.fat.toString())
    setMode('manual')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!foodName || !calories) return

    onAdd({
      food_name: foodName,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      quantity: parseFloat(quantity) || 1,
      meal_type: mealType as MealType,
      logged_at: new Date().toISOString(),
      completed: true,
    })
    handleClose()
  }

  const handleClose = () => {
    setFoodName('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setQuantity('1')
    setMode('quick')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Food</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Meal type selector */}
          <div className="space-y-1.5">
            <Label>Meal</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.emoji} {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('quick')}
              className={`flex-1 py-1.5 text-sm rounded-xl transition-all ${
                mode === 'quick' ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Quick Add
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-1.5 text-sm rounded-xl transition-all ${
                mode === 'manual' ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Manual Entry
            </button>
          </div>

          {mode === 'quick' ? (
            <div className="space-y-2">
              <Label>Common Foods</Label>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                {COMMON_FOODS.map((food) => (
                  <button
                    key={food.name}
                    type="button"
                    onClick={() => handleSelectCommon(food)}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-left transition-all group"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{food.name}</p>
                      <p className="text-xs text-zinc-500">P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                    </div>
                    <span className="text-sm font-semibold text-violet-400">{food.calories}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Food Name</Label>
                <Input
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Chicken Breast"
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Calories (kcal)</Label>
                  <Input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="0"
                    required
                    min="0"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                    min="0.1"
                    step="0.1"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Food
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
