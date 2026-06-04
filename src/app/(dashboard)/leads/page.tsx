'use client'

import { useState, useEffect, useTransition } from 'react'
import { Plus, Target, Phone, Calendar, Trash2, MessageCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { format, isToday } from 'date-fns'
import { getLeads, createLead, updateLead, deleteLead } from '@/app/actions/leads'
import { formatDate, getStatusColor } from '@/lib/utils'
import type { Lead, LeadStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Converted', value: 'converted' },
  { label: 'Lost', value: 'lost' },
]

const SOURCE_LABELS: Record<string, string> = {
  walk_in: 'Walk-in', referral: 'Referral', social_media: 'Social Media',
  phone: 'Phone', website: 'Website', other: 'Other',
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New', contacted: 'Contacted', converted: 'Converted', lost: 'Lost',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: '', mobile: '', email: '', source: 'walk_in', followup_date: '', notes: '' })

  async function load() {
    setLoading(true)
    const data = await getLeads()
    setLeads(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = tab === 'all' ? leads : leads.filter(l => l.status === tab)
  const todayFollowups = leads.filter(l => l.followup_date && isToday(new Date(l.followup_date))).length

  async function handleAdd() {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
    startTransition(async () => {
      const result = await createLead(fd)
      if (result.error) { toast.error(result.error) } else {
        toast.success('Lead added')
        setAddOpen(false)
        setForm({ name: '', mobile: '', email: '', source: 'walk_in', followup_date: '', notes: '' })
        load()
      }
    })
  }

  async function handleStatus(id: string, status: LeadStatus) {
    const result = await updateLead(id, { status })
    if (result.error) { toast.error(result.error) } else {
      toast.success('Status updated')
      load()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lead?')) return
    const result = await deleteLead(id)
    if (result.error) { toast.error(result.error) } else {
      toast.success('Lead deleted')
      load()
    }
  }

  const statusColor = (s: LeadStatus) => getStatusColor(s)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads & CRM</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {leads.length} total leads
            {todayFollowups > 0 && <span className="ml-2 text-yellow-400">· {todayFollowups} follow-up{todayFollowups > 1 ? 's' : ''} today</span>}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4" /> Add Lead</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="mt-1" placeholder="Full name" />
                </div>
                <div>
                  <Label>Mobile *</Label>
                  <Input value={form.mobile} onChange={e => setForm(f => ({...f, mobile: e.target.value}))} className="mt-1" placeholder="Mobile" />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Source</Label>
                  <Select value={form.source} onValueChange={v => setForm(f => ({...f, source: v}))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SOURCE_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Follow-up Date</Label>
                  <Input type="date" value={form.followup_date} onChange={e => setForm(f => ({...f, followup_date: e.target.value}))} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className="mt-1" rows={3} />
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={pending || !form.name || !form.mobile}>
                {pending ? 'Adding...' : 'Add Lead'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-[#1e293b] border border-[#334155] rounded-xl p-1 w-fit">
        {STATUS_TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.value ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <Target className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No leads found</p>
            <p className="text-slate-500 text-sm mt-1">Add your first lead to start tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  {['Name', 'Mobile', 'Source', 'Follow-up', 'Status', 'Notes', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const isFollowupToday = lead.followup_date && isToday(new Date(lead.followup_date))
                  return (
                    <tr key={lead.id} className={`border-b border-[#334155] last:border-0 hover:bg-[#0f172a]/40 ${isFollowupToday ? 'bg-yellow-500/5' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{lead.name}</div>
                        {lead.email && <div className="text-slate-500 text-xs">{lead.email}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <a href={`tel:${lead.mobile}`} className="text-slate-300 hover:text-green-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />{lead.mobile}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-400">{SOURCE_LABELS[lead.source] ?? lead.source}</span>
                      </td>
                      <td className="px-4 py-3">
                        {lead.followup_date ? (
                          <span className={`flex items-center gap-1 ${isFollowupToday ? 'text-yellow-400 font-medium' : 'text-slate-400'}`}>
                            <Calendar className="w-3 h-3" />
                            {isFollowupToday ? 'Today' : formatDate(lead.followup_date)}
                          </span>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Select value={lead.status} onValueChange={v => handleStatus(lead.id, v as LeadStatus)}>
                          <SelectTrigger className={`h-7 w-28 text-xs border ${statusColor(lead.status)}`}>
                            <SelectValue>{STATUS_LABELS[lead.status]}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="text-slate-400 text-xs truncate block">{lead.notes || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a href={`https://wa.me/91${lead.mobile.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          {lead.status === 'converted' && (
                            <a href={`/members/new?name=${encodeURIComponent(lead.name)}&mobile=${encodeURIComponent(lead.mobile)}`}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button onClick={() => handleDelete(lead.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
