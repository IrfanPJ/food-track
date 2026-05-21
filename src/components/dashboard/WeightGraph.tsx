'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'

interface DataPoint {
  date: string
  weight: number
}

export default function WeightGraph() {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
        const { data: logs } = await supabase
          .from('progress_logs')
          .select('weight, logged_at')
          .eq('user_id', user.id)
          .gte('logged_at', thirtyDaysAgo)
          .order('logged_at', { ascending: true })

        if (logs && logs.length > 0) {
          setData(
            logs.map((l) => ({
              date: format(new Date(l.logged_at), 'MMM d'),
              weight: l.weight,
            }))
          )
        } else {
          // Sample data for display
          setData(
            Array.from({ length: 7 }, (_, i) => ({
              date: format(subDays(new Date(), 6 - i), 'MMM d'),
              weight: 75 + Math.sin(i) * 0.5 + Math.random() * 0.3,
            }))
          )
        }
      } catch (err) {
        console.error('Error fetching weight data:', err)
      }
    }
    fetchData()
  }, [])

  const minWeight = Math.min(...data.map((d) => d.weight)) - 1
  const maxWeight = Math.max(...data.map((d) => d.weight)) + 1

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          Weight Trend (30 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[minWeight, maxWeight]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                color: '#f4f4f5',
              }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 3 }}
              activeDot={{ r: 5, fill: '#a78bfa' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
