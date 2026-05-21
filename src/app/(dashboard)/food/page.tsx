'use client'

import { useFood } from '@/hooks/useFood'
import FoodLog from '@/components/food/FoodLog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, Beef, Wheat, Droplets } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { MealLog } from '@/types'
import { ListSkeleton } from '@/components/shared/LoadingSkeleton'

export default function FoodPage() {
  const { todayLogs, macros, isLoading, addFoodLog, deleteFoodLog } = useFood()
  const { profile } = useProfile()

  const handleAdd = async (data: Omit<MealLog, 'id' | 'user_id'>) => {
    await addFoodLog(data)
  }

  const stats = [
    {
      label: 'Calories',
      value: Math.round(macros.calories),
      target: profile?.calories_target || 2000,
      icon: Flame,
      color: 'text-orange-400',
      unit: 'kcal',
    },
    {
      label: 'Protein',
      value: Math.round(macros.protein),
      target: profile?.protein_target || 150,
      icon: Beef,
      color: 'text-violet-400',
      unit: 'g',
    },
    {
      label: 'Carbs',
      value: Math.round(macros.carbs),
      target: profile?.carbs_target || 200,
      icon: Wheat,
      color: 'text-blue-400',
      unit: 'g',
    },
    {
      label: 'Fat',
      value: Math.round(macros.fat),
      target: profile?.fat_target || 65,
      icon: Droplets,
      color: 'text-yellow-400',
      unit: 'g',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Food Log</h1>
        <p className="text-sm text-zinc-500">Track your daily nutrition</p>
      </div>

      {/* Macro summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-zinc-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-zinc-100">
                {stat.value}
                <span className="text-xs font-normal text-zinc-500 ml-1">{stat.unit}</span>
              </p>
              <div className="w-full bg-zinc-800 rounded-full h-1 mt-2">
                <div
                  className="h-1 rounded-full bg-current transition-all"
                  style={{
                    width: `${Math.min((stat.value / stat.target) * 100, 100)}%`,
                    color: stat.color.replace('text-', 'background: '),
                  }}
                />
              </div>
              <p className="text-xs text-zinc-600 mt-1">/ {stat.target} {stat.unit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Food log */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Meals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ListSkeleton count={3} />
          ) : (
            <FoodLog
              logs={todayLogs}
              onAdd={handleAdd}
              onDelete={deleteFoodLog}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
