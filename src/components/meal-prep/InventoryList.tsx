'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { InventoryItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, AlertTriangle, Package } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import EmptyState from '@/components/shared/EmptyState'
import { INVENTORY_CATEGORIES } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('g')
  const [threshold, setThreshold] = useState('100')
  const [category, setCategory] = useState('Other')

  useEffect(() => {
    const fetchItems = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true })
      setItems(data || [])
    }
    fetchItems()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('inventory_items')
      .insert({
        user_id: user.id,
        name,
        quantity: parseFloat(quantity),
        unit,
        low_stock_threshold: parseFloat(threshold),
        category,
      })
      .select()
      .single()

    if (data) {
      setItems([...items, data])
      setIsAddOpen(false)
      setName('')
      setQuantity('')
    }
  }

  const lowStock = items.filter((i) => i.quantity <= i.low_stock_threshold)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-zinc-200">Pantry Inventory</h3>
          {lowStock.length > 0 && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              {lowStock.length} low
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Empty pantry"
          description="Start tracking your food inventory"
          action={{ label: 'Add First Item', onClick: () => setIsAddOpen(true) }}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isLow = item.quantity <= item.low_stock_threshold
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isLow ? 'bg-orange-500/5 border-orange-500/20' : 'bg-zinc-800/50 border-zinc-800'
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${isLow ? 'bg-orange-400' : 'bg-green-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{item.name}</p>
                  <p className="text-xs text-zinc-500">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isLow ? 'text-orange-400' : 'text-zinc-100'}`}>
                    {item.quantity} {item.unit}
                  </p>
                  {isLow && <p className="text-xs text-orange-500">Low stock</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label>Item Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity</Label>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="0" className="mt-1.5" />
              </div>
              <div>
                <Label>Unit</Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Low Stock Alert Threshold</Label>
              <Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} min="0" className="mt-1.5" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Add Item</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
