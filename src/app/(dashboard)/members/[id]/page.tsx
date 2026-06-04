import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Phone,
  User,
  Dumbbell,
  CreditCard,
  Clock,
  Edit,
} from 'lucide-react'
import { getMember } from '@/app/actions/members'
import { getPayments } from '@/app/actions/payments'
import { formatDate, formatCurrency, getMembershipStatus, getStatusColor, getDaysUntilExpiry } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import RenewDialog from './renew-dialog'
import type { Payment } from '@/types'

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ renew?: string }>

// ─── Info row ────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#334155]/60 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm text-white mt-0.5 break-words">{value ?? '—'}</p>
      </div>
    </div>
  )
}

// ─── Payment method badge ────────────────────────────────────────────────────

function PaymentMethodBadge({ method }: { method: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    cash: { label: 'Cash', cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
    upi: { label: 'UPI', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    bank_transfer: {
      label: 'Bank Transfer',
      cls: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  }
  const m = map[method] ?? { label: method, cls: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
  return (
    <Badge className={`border text-xs ${m.cls}`}>{m.label}</Badge>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { id } = await params
  const { renew } = await searchParams

  const [member, payments] = await Promise.all([getMember(id), getPayments(id)])

  if (!member) notFound()

  const membership = member.active_membership ?? null
  const membershipStatus = membership ? getMembershipStatus(membership.expiry_date) : null
  const daysLeft = membership ? getDaysUntilExpiry(membership.expiry_date) : null
  const statusColors = membershipStatus ? getStatusColor(membershipStatus) : getStatusColor('expired')
  const statusLabel =
    membershipStatus === 'active'
      ? 'Active'
      : membershipStatus === 'expiring_soon'
      ? 'Expiring Soon'
      : 'Expired'

  const genderLabel =
    member.gender === 'male' ? 'Male' : member.gender === 'female' ? 'Female' : 'Other'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Link
          href="/members"
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#1e293b] border border-[#334155] hover:border-[#475569] text-slate-400 hover:text-white transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge className="border text-xs text-slate-400 bg-slate-500/10 border-slate-500/20 font-mono">
              #{member.member_id}
            </Badge>
            {membership && (
              <Badge className={`border text-xs ${statusColors}`}>{statusLabel}</Badge>
            )}
            {!membership && (
              <Badge className="border text-xs text-slate-400 bg-slate-500/10 border-slate-500/20">
                No Active Plan
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white truncate">{member.full_name}</h1>
          <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            {member.mobile}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/members/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-[#334155] hover:border-[#475569] text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>
          <RenewDialog memberId={id} defaultOpen={renew === '1'} />
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — info */}
        <div className="lg:col-span-1 space-y-5">
          {/* Personal info */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Personal Info</h2>
            </div>

            <InfoRow icon={Mail} label="Email" value={member.email || '—'} />
            <InfoRow icon={MapPin} label="Address" value={member.address || '—'} />
            <InfoRow icon={User} label="Gender" value={genderLabel} />
            <InfoRow icon={Calendar} label="Date Joined" value={formatDate(member.join_date)} />
            {member.notes && (
              <InfoRow icon={FileText} label="Notes" value={member.notes} />
            )}
          </div>
        </div>

        {/* Right column — membership + payments */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Membership */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Dumbbell className="w-3.5 h-3.5 text-green-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Active Membership</h2>
              </div>
              {membership && (
                <Badge className={`border text-xs ${statusColors}`}>{statusLabel}</Badge>
              )}
            </div>

            {!membership ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Dumbbell className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No active membership</p>
                <p className="text-slate-600 text-xs mt-1">
                  Add a membership plan to track this member&apos;s subscription.
                </p>
                <RenewDialog memberId={id} label="Add Membership" className="mt-4" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Start Date
                  </p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(membership.start_date)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Expiry Date
                  </p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(membership.expiry_date)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Amount Paid
                  </p>
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(membership.amount)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Days Left
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      daysLeft !== null && daysLeft <= 0
                        ? 'text-red-400'
                        : daysLeft !== null && daysLeft <= 7
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}
                  >
                    {daysLeft !== null
                      ? daysLeft <= 0
                        ? 'Expired'
                        : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                      : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment history */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#334155] flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Payment History</h2>
              {payments.length > 0 && (
                <span className="ml-auto text-xs text-slate-500">
                  {payments.length} record{payments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <CreditCard className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No payments recorded</p>
                <p className="text-slate-600 text-xs mt-1">
                  Payments will appear here once recorded.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-[#334155] bg-[#0f172a]/40">
                      <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                        Method
                      </th>
                      <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                        Receipt #
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {(payments as Payment[]).map((payment) => (
                      <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {formatDate(payment.payment_date)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-green-400">
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <PaymentMethodBadge method={payment.payment_method} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">
                          {payment.receipt_number ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
