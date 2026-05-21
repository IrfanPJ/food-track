'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Check, ShoppingCart, Trash2 } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('1')
  const [newUnit, setNewUnit] = useState('piece')

  useEffect(() => {
    const fetchItems = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', user.id)
        .order('completed', { ascending: true })
        .order('created_at', { ascending: false })
      setItems(data || [])
    }
    fetchItems()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('shopping_items')
      .insert({
        user_id: user.id,
        name: newItem.trim(),
        quantity: parseFloat(newQty) || 1,
        unit: newUnit,
        completed: false,
        category: 'Other',
      })
      .select()
      .single()

    if (data) {
      setItems([data, ...items])
      setNewItem('')
    }
  }

  const toggleItem = async (item: ShoppingItem) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('shopping_items')
      .update({ completed: !item.completed })
      .eq('id', item.id)
      .select()
      .single()
    if (data) {
      setItems(items.map((i) => (i.id === item.id ? data : i)))
    }
  }

  const deleteItem = async (id: string) => {
    const supabase = createClient()
    await supabase.from('shopping_items').delete().eq('id', id)
    setItems(items.filter((i) => i.id !== id))
  }

  const completedCount = items.filter((i) => i.completed).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-200">Shopping List</h3>
        <span className="text-xs text-zinc-500">
          {completedCount}/{items.length} done
        </span>
      </div>

      {/* Add item form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item..."
          className="flex-1"
        />
        <Input
          value={newQty}
          onChange={(e) => setNewQty(e.target.value)}
          type="number"
          min="0.1"
          step="0.1"
          className="w-16"
        />
        <Button type="submit" size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Shopping list is empty"
          description="Add items you need to buy"
        />
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
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
                  item.completed ? 'bg-green-500 border-green-500' : 'border-zinc-600 hover:border-green-500'
                )}
              >
                {item.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <div className="flex-1">
                <span className={cn('text-sm', item.completed && 'line-through text-zinc-500')}>
                  {item.name}
                </span>
                <span className="text-xs text-zinc-500 ml-2">
                  {item.quantity} {item.unit}
                </span>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg text-zinc-500 hover:text-red-400 transition-all flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
