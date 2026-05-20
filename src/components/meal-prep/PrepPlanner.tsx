'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'
import { MEAL_TYPES } from '@/lib/constants'
import { format, addDays } from 'date-fns'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function PrepPlanner() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
          <CalendarDays className="w-4 h-4 text-violet-400" />
          Weekly Meal Planner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                <th className="text-xs text-zinc-500 font-medium py-2 pr-4 text-left w-28">Meal</th>
                {DAYS.map((d, i) => (
                  <th key={d} className="text-xs text-zinc-500 font-medium py-2 px-1 text-center">
                    <span className="block">{d}</span>
                    <span className="block text-zinc-700">{format(addDays(monday, i), 'M/d')}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TYPES.slice(0, 4).map((meal) => (
                <tr key={meal.value} className="border-t border-zinc-800">
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span>{meal.emoji}</span>
                      <span className="text-xs text-zinc-400">{meal.label}</span>
                    </div>
                  </td>
                  {DAYS.map((d) => (
                    <td key={d} className="py-2 px-1">
                      <div className="h-8 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-violet-500/40 cursor-pointer transition-all text-xs text-zinc-600 flex items-center justify-center hover:text-violet-400">
                        +
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
