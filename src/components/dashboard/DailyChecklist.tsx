'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ChecklistItem } from '@/types'
import { getTodayISO } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function DailyChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([])

  useEffect(() => {
    const fetchItems = async () => {
      try {
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
          .limit(5)

        setItems(data || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchItems()
  }, [])

  const toggleItem = async (item: ChecklistItem) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('checklist_items')
        .update({ completed: !item.completed })
        .eq('id', item.id)
        .select()
        .single()
      if (data) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? data : i)))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const completedCount = items.filter((i) => i.completed).length

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm text-zinc-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-green-400" />
            Daily Checklist
          </div>
          <span className="text-xs text-zinc-500">{completedCount}/{items.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-3">No tasks for today</p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                  item.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-zinc-600 group-hover:border-green-500'
                )}
              >
                {item.completed && <Check className="w-3 h-3 text-white" />}
              </div>
              <span
                className={cn(
                  'text-sm transition-all',
                  item.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'
                )}
              >
                {item.title}
              </span>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
