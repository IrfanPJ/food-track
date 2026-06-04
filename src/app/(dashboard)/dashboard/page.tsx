import Link from 'next/link'
import {
  Users,
  UserCheck,
  Clock,
  IndianRupee,
  AlertCircle,
  MessageCircle,
} from 'lucide-react'
import { getDashboardStats, getRecentMembers, getExpiringMembers } from '@/app/actions/dashboard'
import { formatDate, formatCurrency, getMembershipStatus, getStatusColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-[#334155] flex items-start gap-4">
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-white leading-none mb-1">{value}</p>
        <p className="text-slate-400 text-sm truncate">{label}</p>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const [stats, recentMembers, expiringMembers] = await Promise.all([
    getDashboardStats(),
    getRecentMembers(6),
    getExpiringMembers(7),
  ])

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const statCards = [
    {
      label: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Active Members',
      value: stats.activeMembers,
      icon: UserCheck,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
    },
    {
      label: 'Expiring Soon',
      value: stats.expiringThisWeek,
      icon: Clock,
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
    },
    {
      label: 'Revenue This Month',
      value: formatCurrency(stats.revenueThisMonth),
      icon: IndianRupee,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
    },
    {
      label: 'Due Today',
      value: stats.dueToday,
      icon: AlertCircle,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">{dateStr}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Expiring Soon Table */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <h2 className="font-semibold text-white text-sm">Expiring Soon</h2>
              {expiringMembers.length > 0 && (
                <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5 font-medium">
                  {expiringMembers.length}
                </span>
              )}
            </div>
            <Link
              href="/members?status=expiring"
              className="text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              View all
            </Link>
          </div>

          {expiringMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Clock className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No expiring members</p>
              <p className="text-slate-600 text-xs mt-1">Members expiring in the next 7 days will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Member</th>
                    <th className="text-left px-3 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Expiry</th>
                    <th className="text-left px-3 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Days</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {expiringMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/members/${member.id}`} className="hover:text-green-400 transition-colors">
                          <p className="font-medium text-white leading-none">{member.full_name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">#{member.member_id}</p>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-slate-300 whitespace-nowrap">
                        {formatDate(member.expiry_date)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            member.days_left <= 0
                              ? 'text-red-400 font-semibold'
                              : member.days_left <= 3
                              ? 'text-orange-400 font-semibold'
                              : 'text-yellow-400 font-semibold'
                          }
                        >
                          {member.days_left <= 0 ? 'Today' : `${member.days_left}d`}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/whatsapp?member=${member.id}`}
                          className="inline-flex items-center gap-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg px-2.5 py-1.5 font-medium transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Remind
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Members */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold text-white text-sm">Recent Members</h2>
            </div>
            <Link
              href="/members"
              className="text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              View all
            </Link>
          </div>

          {recentMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <Users className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No members yet</p>
              <p className="text-slate-600 text-xs mt-1">Add your first member to get started.</p>
              <Link
                href="/members/new"
                className="mt-4 text-xs bg-green-500 hover:bg-green-400 text-white rounded-lg px-4 py-2 font-medium transition-colors"
              >
                Add Member
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#334155]">
              {recentMembers.map((member) => {
                const status = member.active_membership
                  ? getMembershipStatus(member.active_membership.expiry_date)
                  : 'expired'
                const statusColors = getStatusColor(status)
                const statusLabel =
                  status === 'active'
                    ? 'Active'
                    : status === 'expiring_soon'
                    ? 'Expiring'
                    : 'Expired'

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-400 text-xs font-bold">
                          {member.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/members/${member.id}`}
                          className="text-white text-sm font-medium hover:text-green-400 transition-colors truncate block"
                        >
                          {member.full_name}
                        </Link>
                        <p className="text-slate-500 text-xs">
                          #{member.member_id} &middot; Joined {formatDate(member.join_date)}
                        </p>
                      </div>
                    </div>
                    <Badge className={`ml-3 flex-shrink-0 border text-xs ${statusColors}`}>
                      {statusLabel}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
