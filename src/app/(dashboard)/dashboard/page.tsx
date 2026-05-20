'use client'

import { useProfile } from '@/hooks/useProfile'
import { useFood } from '@/hooks/useFood'
import { useWorkout } from '@/hooks/useWorkout'
import CalorieSummaryCard from '@/components/dashboard/CalorieSummaryCard'
import MacroProgressCard from '@/components/dashboard/MacroProgressCard'
import WorkoutCard from '@/components/dashboard/WorkoutCard'
import WaterIntakeCard from '@/components/dashboard/WaterIntakeCard'
import WeightGraph from '@/components/dashboard/WeightGraph'
import DailyChecklist from '@/components/dashboard/DailyChecklist'
import StreakCounter from '@/components/dashboard/StreakCounter'
import UpcomingMeals from '@/components/dashboard/UpcomingMeals'
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton'

export default function DashboardPage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const { macros, todayLogs, isLoading: foodLoading } = useFood()
  const { todayWorkout, exercises, isLoading: workoutLoading } = useWorkout()

  if (profileLoading || foodLoading) {
    return <DashboardSkeleton />
  }

  const calorieTarget = profile?.calories_target || 2000
  const proteinTarget = profile?.protein_target || 150
  const carbsTarget = profile?.carbs_target || 200
  const fatTarget = profile?.fat_target || 65
  const waterTarget = profile?.water_target || 8

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500">Track your daily progress</p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <CalorieSummaryCard consumed={Math.round(macros.calories)} target={calorieTarget} />
        <MacroProgressCard
          macros={macros}
          targets={{ protein: proteinTarget, carbs: carbsTarget, fat: fatTarget }}
        />
        <WorkoutCard workout={todayWorkout} exerciseCount={exercises.length} />
        <WaterIntakeCard target={waterTarget} />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeightGraph />
        </div>
        <div className="space-y-4">
          <StreakCounter streak={7} longestStreak={21} />
          <DailyChecklist />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UpcomingMeals meals={todayLogs.filter((l) => !l.completed)} />

        {/* Quick actions */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Log Meal', href: '/food', emoji: '🍽️' },
              { label: 'Log Workout', href: '/workout', emoji: '💪' },
              { label: 'AI Coach', href: '/ai-coach', emoji: '🤖' },
              { label: 'Analytics', href: '/analytics', emoji: '📊' },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-500/30 transition-all group"
              >
                <span className="text-xl">{action.emoji}</span>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-violet-400 transition-colors">
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
