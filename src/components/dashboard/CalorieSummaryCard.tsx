'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProgressRing from '@/components/shared/ProgressRing'
import { Flame } from 'lucide-react'

interface CalorieSummaryCardProps {
  consumed: number
  target: number
}

export default function CalorieSummaryCard({ consumed, target }: CalorieSummaryCardProps) {
  const remaining = Math.max(target - consumed, 0)
  const over = consumed > target ? consumed - target : 0

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
          <Flame className="w-4 h-4 text-orange-400" />
          Calories Today
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <ProgressRing
          value={consumed}
          max={target}
          size={100}
          strokeWidth={9}
          color={over > 0 ? '#ef4444' : '#8b5cf6'}
          bgColor="#27272a"
          label={consumed.toString()}
          sublabel="kcal"
        />
        <div className="space-y-3 flex-1">
          <div>
            <p className="text-xs text-zinc-500">Target</p>
            <p className="font-semibold text-zinc-100">{target} kcal</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">{over > 0 ? 'Over by' : 'Remaining'}</p>
            <p className={`font-semibold ${over > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {over > 0 ? over : remaining} kcal
            </p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${over > 0 ? 'bg-red-500' : 'bg-violet-500'}`}
              style={{ width: `${Math.min((consumed / target) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
