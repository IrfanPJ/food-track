'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Flame } from 'lucide-react'

interface StreakCounterProps {
  streak?: number
  longestStreak?: number
}

export default function StreakCounter({ streak = 0, longestStreak = 0 }: StreakCounterProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Flame className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-0.5">Current Streak</p>
          <p className="text-3xl font-bold text-white">
            {streak}
            <span className="text-base font-normal text-zinc-400 ml-1">days</span>
          </p>
          <p className="text-xs text-zinc-500">Best: {longestStreak} days</p>
        </div>
      </CardContent>
    </Card>
  )
}
