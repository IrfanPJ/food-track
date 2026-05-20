'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { TrendingUp, Dumbbell, Flame, Target } from 'lucide-react'

interface DailyCalories {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#22c55e']

const MACRO_COLORS = {
  protein: '#8b5cf6',
  carbs: '#3b82f6',
  fat: '#f59e0b',
}

export default function AnalyticsPage() {
  const [calorieData, setCalorieData] = useState<DailyCalories[]>([])
  const [macroData, setMacroData] = useState<{ name: string; value: number }[]>([])
  const [workoutData, setWorkoutData] = useState<{ date: string; completed: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const thirtyDaysAgo = subDays(new Date(), 29)
      const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() })

      // Fetch meal logs
      const { data: logs } = await supabase
        .from('meal_logs')
        .select('calories, protein, carbs, fat, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: true })

      // Aggregate by day
      const daily = days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayLogs = (logs || []).filter((l) => l.logged_at.startsWith(dateStr))
        return {
          date: format(day, 'MMM d'),
          calories: Math.round(dayLogs.reduce((s, l) => s + l.calories, 0)),
          protein: Math.round(dayLogs.reduce((s, l) => s + l.protein, 0)),
          carbs: Math.round(dayLogs.reduce((s, l) => s + l.carbs, 0)),
          fat: Math.round(dayLogs.reduce((s, l) => s + l.fat, 0)),
        }
      })
      setCalorieData(daily.slice(-14)) // last 14 days

      // Macro distribution (last 7 days)
      const last7 = daily.slice(-7)
      const totalProtein = last7.reduce((s, d) => s + d.protein, 0)
      const totalCarbs = last7.reduce((s, d) => s + d.carbs, 0)
      const totalFat = last7.reduce((s, d) => s + d.fat, 0)
      setMacroData([
        { name: 'Protein', value: totalProtein },
        { name: 'Carbs', value: totalCarbs },
        { name: 'Fat', value: totalFat },
      ])

      // Workout data
      const { data: workouts } = await supabase
        .from('workouts')
        .select('scheduled_date, status')
        .eq('user_id', user.id)
        .gte('scheduled_date', format(thirtyDaysAgo, 'yyyy-MM-dd'))

      const workoutsByWeek = Array.from({ length: 4 }, (_, weekIdx) => {
        const weekStart = subDays(new Date(), (3 - weekIdx) * 7 + 6)
        const weekEnd = subDays(new Date(), (3 - weekIdx) * 7)
        const weekWorkouts = (workouts || []).filter((w) => {
          const d = new Date(w.scheduled_date)
          return d >= weekStart && d <= weekEnd
        })
        return {
          date: `Week ${weekIdx + 1}`,
          completed: weekWorkouts.filter((w) => w.status === 'completed').length,
        }
      })
      setWorkoutData(workoutsByWeek)
    }

    fetchData()
  }, [])

  const avgCalories = calorieData.length
    ? Math.round(calorieData.reduce((s, d) => s + d.calories, 0) / calorieData.length)
    : 0

  const totalWorkouts = workoutData.reduce((s, d) => s + d.completed, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
        <p className="text-sm text-zinc-500">Your progress over the last 30 days</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Calories', value: avgCalories, unit: 'kcal/day', icon: Flame, color: 'text-orange-400' },
          { label: 'Workouts', value: totalWorkouts, unit: 'this month', icon: Dumbbell, color: 'text-violet-400' },
          { label: 'Streak', value: 7, unit: 'days', icon: TrendingUp, color: 'text-green-400' },
          { label: 'Goals Met', value: '68', unit: '%', icon: Target, color: 'text-blue-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-zinc-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
              <p className="text-xs text-zinc-600">{stat.unit}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calorie trend */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400 font-medium">
            Calorie Intake (14 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={calorieData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '12px',
                  color: '#f4f4f5',
                }}
              />
              <Bar dataKey="calories" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Macro trends + pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400 font-medium">
              Macro Trend (14 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={calorieData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    color: '#f4f4f5',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="protein" stroke={MACRO_COLORS.protein} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="carbs" stroke={MACRO_COLORS.carbs} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fat" stroke={MACRO_COLORS.fat} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400 font-medium">
              Macro Distribution (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    color: '#f4f4f5',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {macroData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <div>
                    <p className="text-xs font-medium text-zinc-300">{item.name}</p>
                    <p className="text-xs text-zinc-500">{item.value}g total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workout consistency */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400 font-medium">
            Workout Consistency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={workoutData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717a', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '12px',
                  color: '#f4f4f5',
                }}
              />
              <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
