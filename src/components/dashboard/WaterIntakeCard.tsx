'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplets, Plus, Minus } from 'lucide-react'

interface WaterIntakeCardProps {
  current?: number
  target?: number
}

export default function WaterIntakeCard({ current: initialCurrent = 0, target = 8 }: WaterIntakeCardProps) {
  const [current, setCurrent] = useState(initialCurrent)

  const pct = Math.min((current / target) * 100, 100)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
          <Droplets className="w-4 h-4 text-blue-400" />
          Water Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-zinc-100">
              {current}
              <span className="text-sm font-normal text-zinc-500 ml-1">/{target} glasses</span>
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{Math.round(current * 250)}ml consumed</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrent(Math.min(target + 4, current + 1))}
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Water glasses visual */}
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: target }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i < current ? i : i + 1)}
              className={`w-7 h-9 rounded-lg border transition-all ${
                i < current
                  ? 'bg-blue-500 border-blue-400'
                  : 'bg-zinc-800 border-zinc-700 hover:border-blue-700'
              }`}
              title={`${i + 1} glasses`}
            >
              {i < current && (
                <div className="flex items-end justify-center h-full pb-1">
                  <Droplets className="w-3 h-3 text-blue-100" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="w-full bg-zinc-800 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
