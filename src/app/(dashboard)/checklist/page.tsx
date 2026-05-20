'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChecklistItem } from '@/types'
import { getTodayISO } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Plus, Flame, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'meal', label: 'Meal', emoji: '🍽️' },
  { value: 'workout', label: 'Workout', emoji: '💪' },
  { value: 'water', label: 'Water', emoji: '💧' },
  { value: 'sleep', label: 'Sleep', emoji: '😴' },
  { value: 'supplement', label: 'Supplement', emoji: '💊' },
  { value: 'custom', label: 'Custom', emoji: '⭐' },
]

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('custom')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const today = getTodayISO()
    const { data } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_date', today)
      .order('created_at', { ascending: true })

    setItems(data || [])
  }

  const toggleItem = async (item: ChecklistItem) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('checklist_items')
      .update({ completed: !item.completed })
      .eq('id', item.id)
      .select()
      .single()
    if (data) setItems((prev) => prev.map((i) => (i.id === item.id ? data : i)))
  }

  const deleteItem = async (id: string) => {
    const supabase = createClient()
    await supabase.from('checklist_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('checklist_items')
      .insert({
        user_id: user.id,
        title,
        category,
        completed: false,
        target_date: getTodayISO(),
        streak: 0,
      })
      .select()
      .single()

    if (data) {
      setItems([...items, data])
      setIsAddOpen(false)
      setTitle('')
    }
  }

  const completedCount = items.filter((i) => i.completed).length
  const pct = items.length ? Math.round((completedCount / items.length) * 100) : 0

  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.value),
  })).filter((cat) => cat.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Daily Checklist</h1>
          <p className="text-sm text-zinc-500">Build consistent healthy habits</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Progress */}
      <Card className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-violet-500/20">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
            <Flame className="w-7 h-7 text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-zinc-100">
              {completedCount}/{items.length} tasks completed
            </p>
            <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">{pct}% done today</p>
          </div>
        </CardContent>
      </Card>

      {/* Tasks by category */}
      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 p-10 text-center">
          <p className="text-zinc-500 mb-3">No tasks for today</p>
          <Button onClick={() => setIsAddOpen(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {byCategory.map((cat) => (
            <Card key={cat.value} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {cat.items.filter((i) => i.completed).length}/{cat.items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all group',
                      item.completed ? 'bg-zinc-800/30 border-zinc-800/50' : 'bg-zinc-800/60 border-zinc-800'
                    )}
                  >
                    <button
                      onClick={() => toggleItem(item)}
                      className={cn(
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                        item.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-zinc-600 hover:border-green-500'
                      )}
                    >
                      {item.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span
                      className={cn(
                        'flex-1 text-sm',
                        item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                      )}
                    >
                      {item.title}
                    </span>
                    {item.streak > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-400">
                        <Flame className="w-3 h-3" />
                        {item.streak}
                      </div>
                    )}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg text-zinc-500 hover:text-red-400 transition-all flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label>Task</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Drink 8 glasses of water"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
