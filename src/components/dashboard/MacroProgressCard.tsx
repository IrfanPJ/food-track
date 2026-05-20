'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MacroSummary } from '@/types'

interface MacroProgressCardProps {
  macros: MacroSummary
  targets: {
    protein: number
    carbs: number
    fat: number
  }
}

interface MacroBarProps {
  label: string
  consumed: number
  target: number
  color: string
  unit?: string
}

function MacroBar({ label, consumed, target, color, unit = 'g' }: MacroBarProps) {
  const pct = Math.min((consumed / target) * 100, 100)
  const over = consumed > target

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className={`text-xs font-medium ${over ? 'text-red-400' : 'text-zinc-300'}`}>
          {Math.round(consumed)}/{target}{unit}
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? '#ef4444' : color,
          }}
        />
      </div>
    </div>
  )
}

export default function MacroProgressCard({ macros, targets }: MacroProgressCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-zinc-400 font-medium">Macros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MacroBar
          label="Protein"
          consumed={macros.protein}
          target={targets.protein}
          color="#8b5cf6"
        />
        <MacroBar
          label="Carbohydrates"
          consumed={macros.carbs}
          target={targets.carbs}
          color="#3b82f6"
        />
        <MacroBar
          label="Fat"
          consumed={macros.fat}
          target={targets.fat}
          color="#f59e0b"
        />
      </CardContent>
    </Card>
  )
}
