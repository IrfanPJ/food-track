'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RefreshCw, Loader2, ChevronDown, Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { renewMembership, getPlans } from '@/app/actions/memberships'
import type { MembershipPlan } from '@/types'

const today = new Date().toISOString().slice(0, 10)

const inputCls =
  'w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] hover:border-[#475569] focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30 rounded-xl text-sm text-white placeholder:text-slate-500 transition-colors'

const selectCls =
  'w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] hover:border-[#475569] focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30 rounded-xl text-sm text-white transition-colors appearance-none'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function RenewDialog({
  memberId,
  defaultOpen = false,
  label = 'Renew',
  className = '',
}: {
  memberId: string
  defaultOpen?: boolean
  label?: string
  className?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(defaultOpen)
  const [isPending, startTransition] = useTransition()
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (open && plans.length === 0 && !plansLoading) {
      setPlansLoading(true)
      getPlans().then((data) => {
        setPlans(data)
        setPlansLoading(false)
      })
    }
  }, [open, plans.length, plansLoading])

  // Auto-fill amount when plan changes
  useEffect(() => {
    if (selectedPlanId && plans.length > 0) {
      const plan = plans.find((p) => p.id === selectedPlanId)
      if (plan) setAmount(String(plan.fee))
    }
  }, [selectedPlanId, plans])

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) {
      // reset state on close
      setSelectedPlanId('')
      setStartDate(today)
      setAmount('')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlanId) return

    startTransition(async () => {
      const result = await renewMembership(memberId, {
        plan_id: selectedPlanId,
        start_date: startDate,
        amount: parseFloat(amount) || 0,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Membership renewed successfully!')
      setOpen(false)
      router.refresh()
    })
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const expiryPreview = selectedPlan
    ? (() => {
        const d = new Date(startDate)
        d.setMonth(d.getMonth() + selectedPlan.duration_months)
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      })()
    : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-green-500 hover:bg-green-400 text-white rounded-xl font-medium transition-colors ${className}`}
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {label}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-[#1e293b] border-[#334155] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-green-400" />
              Renew Membership
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {plansLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading plans…
              </div>
            ) : plans.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">
                No active plans available. Please create a membership plan first.
              </p>
            ) : (
              <>
                {/* Plan */}
                <Field label="Plan" required>
                  <div className="relative">
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      required
                      className={selectCls}
                    >
                      <option value="">Select a plan…</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} — {plan.duration_months} month
                          {plan.duration_months !== 1 ? 's' : ''} (₹{plan.fee})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </Field>

                {/* Start Date + Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start Date" required>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className={`${inputCls} pl-9`}
                      />
                    </div>
                  </Field>
                  <Field label="Amount (₹)" required>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min={0}
                      step={1}
                      placeholder="0"
                      className={inputCls}
                    />
                  </Field>
                </div>

                {expiryPreview && (
                  <div className="text-xs text-slate-500 bg-[#0f172a] rounded-xl px-3 py-2 border border-[#334155]">
                    New expiry:{' '}
                    <span className="text-slate-300 font-medium">{expiryPreview}</span>
                  </div>
                )}
              </>
            )}

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm border border-[#334155] hover:border-[#475569] text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || plansLoading || plans.length === 0 || !selectedPlanId}
                className="inline-flex items-center gap-2 px-5 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Renewing…
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Renew
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
