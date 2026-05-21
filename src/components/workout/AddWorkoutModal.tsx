'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WORKOUT_TYPES, DEFAULT_EXERCISES } from '@/lib/constants'
import { Workout } from '@/types'
import { getTodayISO } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

interface ExerciseInput {
  name: string
  sets: number
  reps: number
  weight: number
  rest_seconds: number
}

interface AddWorkoutModalProps {
  open: boolean
  onClose: () => void
  onAdd: (
    workout: Omit<Workout, 'id' | 'user_id' | 'created_at'>,
    exercises: ExerciseInput[]
  ) => void
}

export default function AddWorkoutModal({ open, onClose, onAdd }: AddWorkoutModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<Workout['type']>('push')
  const [exercises, setExercises] = useState<ExerciseInput[]>([])

  const handleTypeChange = (newType: string) => {
    const t = newType as Workout['type']
    setType(t)
    const defaults = DEFAULT_EXERCISES[t as keyof typeof DEFAULT_EXERCISES]
    if (defaults) {
      setExercises(
        defaults.slice(0, 4).map((name) => ({
          name,
          sets: 3,
          reps: 10,
          weight: 0,
          rest_seconds: 90,
        }))
      )
    } else {
      setExercises([])
    }
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: 0, rest_seconds: 90 }])
  }

  const removeExercise = (i: number) => {
    setExercises(exercises.filter((_, idx) => idx !== i))
  }

  const updateExercise = (i: number, field: keyof ExerciseInput, value: string | number) => {
    setExercises(exercises.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const workoutName = name || `${WORKOUT_TYPES.find((t) => t.value === type)?.label || type} - ${getTodayISO()}`
    onAdd(
      {
        name: workoutName,
        type,
        scheduled_date: getTodayISO(),
        status: 'pending',
      },
      exercises.filter((e) => e.name.trim())
    )
    handleClose()
  }

  const handleClose = () => {
    setName('')
    setType('push')
    setExercises([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Workout Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORKOUT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Name (optional)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g. ${WORKOUT_TYPES.find((t) => t.value === type)?.label}`}
              className="mt-1.5"
            />
          </div>

          {/* Exercises */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Exercises</Label>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {exercises.map((ex, i) => (
                <div key={i} className="bg-zinc-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={ex.name}
                      onChange={(e) => updateExercise(i, 'name', e.target.value)}
                      placeholder="Exercise name"
                      className="flex-1 h-8 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(i)}
                      className="w-7 h-7 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'sets', label: 'Sets' },
                      { key: 'reps', label: 'Reps' },
                      { key: 'weight', label: 'kg' },
                      { key: 'rest_seconds', label: 'Rest(s)' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <p className="text-[10px] text-zinc-500 mb-1">{label}</p>
                        <Input
                          type="number"
                          value={ex[key as keyof ExerciseInput]}
                          onChange={(e) => updateExercise(i, key as keyof ExerciseInput, parseFloat(e.target.value) || 0)}
                          min="0"
                          className="h-7 text-xs px-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Workout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
