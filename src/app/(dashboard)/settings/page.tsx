'use client'

import { useState, useEffect } from 'react'
import { Settings, CreditCard, Users, Save, Building } from 'lucide-react'
import { toast } from 'sonner'
import { getPlans, createPlan, updatePlan } from '@/app/actions/memberships'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { MembershipPlan } from '@/types'
import { createClient } from '@/lib/supabase/client'

const TABS = ['General', 'Plans', 'Users'] as const
type TabType = typeof TABS[number]

interface GymSettings { name: string; address: string; phone: string; whatsappApiUrl: string; whatsappToken: string }

export default function SettingsPage() {
  const [tab, setTab] = useState<TabType>('General')
  const [settings, setSettings] = useState<GymSettings>({
    name: 'Green Power Gym', address: '', phone: '', whatsappApiUrl: '', whatsappToken: '',
  })
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([])
  const [editPlanId, setEditPlanId] = useState<string | null>(null)
  const [editPlanValues, setEditPlanValues] = useState<Partial<MembershipPlan>>({})
  const [newPlan, setNewPlan] = useState({ name: '', duration_months: 1, fee: 0, description: '' })
  const [showAddPlan, setShowAddPlan] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('gym_settings')
    if (saved) setSettings(JSON.parse(saved))
    getPlans().then(setPlans)
    const supabase = createClient()
    supabase.from('user_profiles').select('*').then(({ data }) => {
      if (data) setUsers(data)
    })
  }, [])

  function saveSettings() {
    localStorage.setItem('gym_settings', JSON.stringify(settings))
    toast.success('Settings saved')
  }

  async function handleUpdatePlan(id: string) {
    setSaving(true)
    const result = await updatePlan(id, editPlanValues)
    if (result.error) { toast.error(result.error) } else {
      toast.success('Plan updated')
      setEditPlanId(null)
      getPlans().then(setPlans)
    }
    setSaving(false)
  }

  async function handleAddPlan() {
    setSaving(true)
    const result = await createPlan(newPlan)
    if (result.error) { toast.error(result.error) } else {
      toast.success('Plan created')
      setShowAddPlan(false)
      setNewPlan({ name: '', duration_months: 1, fee: 0, description: '' })
      getPlans().then(setPlans)
    }
    setSaving(false)
  }

  const roleColors: Record<string, string> = { admin: 'text-purple-400 bg-purple-500/10 border-purple-500/20', receptionist: 'text-blue-400 bg-blue-500/10 border-blue-500/20', coach: 'text-green-400 bg-green-500/10 border-green-500/20' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Configure your gym ERP system</p>
      </div>

      <div className="flex gap-1 bg-[#1e293b] border border-[#334155] rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'General' && (
        <div className="max-w-2xl bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-5 h-5 text-green-400" />
            <h2 className="text-white font-semibold">Gym Information</h2>
          </div>
          <div>
            <Label>Gym Name</Label>
            <Input value={settings.name} onChange={e => setSettings(s => ({...s, name: e.target.value}))} className="mt-1" />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={settings.address} onChange={e => setSettings(s => ({...s, address: e.target.value}))} className="mt-1" placeholder="Full gym address" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={settings.phone} onChange={e => setSettings(s => ({...s, phone: e.target.value}))} className="mt-1" placeholder="Gym phone number" />
          </div>
          <div className="border-t border-[#334155] pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-green-400" />
              <h3 className="text-white font-medium text-sm">WhatsApp API (Optional)</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label>WhatsApp API URL</Label>
                <Input value={settings.whatsappApiUrl} onChange={e => setSettings(s => ({...s, whatsappApiUrl: e.target.value}))} className="mt-1" placeholder="https://api.whatsapp.com/..." />
              </div>
              <div>
                <Label>API Token</Label>
                <Input type="password" value={settings.whatsappToken} onChange={e => setSettings(s => ({...s, whatsappToken: e.target.value}))} className="mt-1" placeholder="Your API token" />
              </div>
            </div>
          </div>
          <Button onClick={saveSettings} className="w-full"><Save className="w-4 h-4" /> Save Settings</Button>
        </div>
      )}

      {tab === 'Plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Membership Plans</h2>
            <Button size="sm" onClick={() => setShowAddPlan(v => !v)}>Add Plan</Button>
          </div>
          {showAddPlan && (
            <div className="bg-[#1e293b] rounded-2xl border border-green-500/30 p-5 space-y-4">
              <h3 className="text-white font-medium text-sm">New Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={newPlan.name} onChange={e => setNewPlan(p => ({...p, name: e.target.value}))} className="mt-1" /></div>
                <div><Label>Duration (months)</Label><Input type="number" min={1} value={newPlan.duration_months} onChange={e => setNewPlan(p => ({...p, duration_months: Number(e.target.value)}))} className="mt-1" /></div>
                <div><Label>Fee (₹)</Label><Input type="number" min={0} value={newPlan.fee} onChange={e => setNewPlan(p => ({...p, fee: Number(e.target.value)}))} className="mt-1" /></div>
                <div><Label>Description</Label><Input value={newPlan.description} onChange={e => setNewPlan(p => ({...p, description: e.target.value}))} className="mt-1" /></div>
              </div>
              <Button onClick={handleAddPlan} disabled={saving || !newPlan.name}>Create Plan</Button>
            </div>
          )}
          <div className="space-y-3">
            {plans.map(plan => (
              <div key={plan.id} className="bg-[#1e293b] rounded-xl border border-[#334155] p-4 flex items-center justify-between">
                {editPlanId === plan.id ? (
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Input value={editPlanValues.name ?? plan.name} onChange={e => setEditPlanValues(v => ({...v, name: e.target.value}))} placeholder="Name" className="h-8 text-sm" />
                    <Input type="number" value={editPlanValues.fee ?? plan.fee} onChange={e => setEditPlanValues(v => ({...v, fee: Number(e.target.value)}))} placeholder="Fee" className="h-8 text-sm" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdatePlan(plan.id)} disabled={saving}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditPlanId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="text-white font-medium">{plan.name}</div>
                      <div className="text-slate-400 text-sm">{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''} · ₹{plan.fee.toLocaleString('en-IN')}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setEditPlanId(plan.id); setEditPlanValues({ name: plan.name, fee: plan.fee }) }}>Edit</Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">System Users</h2>
            <a href="/signup" className="text-sm text-green-400 hover:text-green-300 transition-colors">+ Invite User</a>
          </div>
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
            {users.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <Users className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-slate-400 text-sm">No users found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    {['Name', 'Email', 'Role'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-[#334155] last:border-0 hover:bg-[#0f172a]/40">
                      <td className="px-4 py-3 text-white font-medium">{u.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${roleColors[u.role] ?? 'text-slate-400'}`}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
