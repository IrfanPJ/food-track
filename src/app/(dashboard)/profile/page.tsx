'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FITNESS_GOALS, WORKOUT_TYPES } from '@/lib/constants'
import { Profile } from '@/types'
import { User, Target, Dumbbell, Scale } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const { profile, isLoading, saveProfile } = useProfile()
  const router = useRouter()
  const [form, setForm] = useState<Partial<Profile>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        weight: profile.weight,
        height: profile.height,
        goal: profile.goal,
        calories_target: profile.calories_target,
        protein_target: profile.protein_target,
        carbs_target: profile.carbs_target,
        fat_target: profile.fat_target,
        water_target: profile.water_target,
        sleep_target: profile.sleep_target,
        workout_split: profile.workout_split,
      })
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await saveProfile(form)
    setSaving(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-64 bg-zinc-800 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Profile</h1>
          <p className="text-sm text-zinc-500">Manage your account and fitness settings</p>
        </div>
        <Button variant="destructive" onClick={handleLogout} size="sm">
          Sign Out
        </Button>
      </div>

      {/* Avatar section */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
          {profile?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-zinc-100 text-lg">{profile?.name}</p>
          <p className="text-zinc-400 text-sm">{profile?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Personal Info */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
              <User className="w-4 h-4" />
              Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={form.weight || ''}
                  onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) })}
                  step="0.1"
                  min="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  value={form.height || ''}
                  onChange={(e) => setForm({ ...form, height: parseFloat(e.target.value) })}
                  step="0.1"
                  min="0"
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
              <Target className="w-4 h-4" />
              Fitness Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Primary Goal</Label>
              <Select
                value={form.goal || ''}
                onValueChange={(v) => setForm({ ...form, goal: v as Profile['goal'] })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FITNESS_GOALS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition targets */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
              <Scale className="w-4 h-4" />
              Daily Nutrition Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Calories (kcal)</Label>
                <Input
                  type="number"
                  value={form.calories_target || ''}
                  onChange={(e) => setForm({ ...form, calories_target: parseInt(e.target.value) })}
                  min="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  value={form.protein_target || ''}
                  onChange={(e) => setForm({ ...form, protein_target: parseInt(e.target.value) })}
                  min="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Carbohydrates (g)</Label>
                <Input
                  type="number"
                  value={form.carbs_target || ''}
                  onChange={(e) => setForm({ ...form, carbs_target: parseInt(e.target.value) })}
                  min="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Fat (g)</Label>
                <Input
                  type="number"
                  value={form.fat_target || ''}
                  onChange={(e) => setForm({ ...form, fat_target: parseInt(e.target.value) })}
                  min="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Water (glasses/day)</Label>
                <Input
                  type="number"
                  value={form.water_target || ''}
                  onChange={(e) => setForm({ ...form, water_target: parseInt(e.target.value) })}
                  min="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Sleep (hours/night)</Label>
                <Input
                  type="number"
                  value={form.sleep_target || ''}
                  onChange={(e) => setForm({ ...form, sleep_target: parseInt(e.target.value) })}
                  min="0"
                  max="24"
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout split */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
              <Dumbbell className="w-4 h-4" />
              Workout Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Workout Split</Label>
            <Select
              value={form.workout_split || ''}
              onValueChange={(v) => setForm({ ...form, workout_split: v })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="push-pull-legs">Push/Pull/Legs (PPL)</SelectItem>
                <SelectItem value="upper-lower">Upper/Lower Split</SelectItem>
                <SelectItem value="full-body">Full Body 3x/week</SelectItem>
                <SelectItem value="arnold">Arnold Split (6 days)</SelectItem>
                <SelectItem value="bro-split">Bro Split (5 days)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="w-full h-11">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
