import Link from 'next/link'
import { Suspense } from 'react'
import {
  Users,
  Search,
  Plus,
  Upload,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserX,
} from 'lucide-react'
import { getMembers } from '@/app/actions/members'
import { formatDate, getMembershipStatus, getStatusColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Member } from '@/types'

const PAGE_SIZE = 20

type SearchParams = Promise<{
  search?: string
  status?: string
  page?: string
}>

// ─── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ member }: { member: Member }) {
  if (!member.active_membership) {
    return (
      <Badge className="border text-xs text-slate-400 bg-slate-500/10 border-slate-500/20">
        No Plan
      </Badge>
    )
  }
  const status = getMembershipStatus(member.active_membership.expiry_date)
  const colors = getStatusColor(status)
  const label =
    status === 'active' ? 'Active' : status === 'expiring_soon' ? 'Expiring' : 'Expired'
  return (
    <Badge className={`border text-xs ${colors}`}>{label}</Badge>
  )
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

function FilterTab({
  label,
  value,
  active,
  count,
}: {
  label: string
  value: string
  active: boolean
  count?: number
}) {
  return (
    <Link
      href={value === 'all' ? '/members' : `/members?status=${value}`}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-green-500 text-white'
          : 'text-slate-400 hover:text-white hover:bg-[#334155]/50'
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
            active ? 'bg-white/20 text-white' : 'bg-[#334155] text-slate-300'
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  )
}

// ─── Members table (server) ──────────────────────────────────────────────────

async function MembersTable({
  search,
  statusFilter,
  page,
}: {
  search?: string
  statusFilter?: string
  page: number
}) {
  const allMembers = await getMembers(search)

  // Client-side status filtering after fetch
  const filtered = allMembers.filter((m) => {
    if (!statusFilter || statusFilter === 'all') return true
    if (!m.active_membership) return statusFilter === 'expired'
    const status = getMembershipStatus(m.active_membership.expiry_date)
    if (statusFilter === 'active') return status === 'active'
    if (statusFilter === 'expiring') return status === 'expiring_soon'
    if (statusFilter === 'expired') return status === 'expired'
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Counts for tabs
  const totalCount = allMembers.length
  const activeCount = allMembers.filter(
    (m) => m.active_membership && getMembershipStatus(m.active_membership.expiry_date) === 'active'
  ).length
  const expiringCount = allMembers.filter(
    (m) =>
      m.active_membership &&
      getMembershipStatus(m.active_membership.expiry_date) === 'expiring_soon'
  ).length
  const expiredCount = allMembers.filter(
    (m) =>
      !m.active_membership ||
      getMembershipStatus(m.active_membership.expiry_date) === 'expired'
  ).length

  const activeTab = statusFilter || 'all'

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `/members${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        <FilterTab label="All" value="all" active={activeTab === 'all'} count={totalCount} />
        <FilterTab label="Active" value="active" active={activeTab === 'active'} count={activeCount} />
        <FilterTab label="Expiring" value="expiring" active={activeTab === 'expiring'} count={expiringCount} />
        <FilterTab label="Expired" value="expired" active={activeTab === 'expired'} count={expiredCount} />
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <UserX className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-slate-300 font-semibold text-base">No members found</p>
            <p className="text-slate-500 text-sm mt-1">
              {search
                ? `No results for "${search}". Try a different search term.`
                : 'Add your first member to get started.'}
            </p>
            {!search && (
              <Link
                href="/members/new"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#334155] bg-[#0f172a]/50">
                    <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">
                      Expiry
                    </th>
                    <th className="px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {paginated.map((member) => {
                    const expiryDate = member.active_membership?.expiry_date
                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-slate-400 font-mono text-xs">
                            #{member.member_id}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/members/${member.id}`}
                            className="font-medium text-white hover:text-green-400 transition-colors"
                          >
                            {member.full_name}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">{member.mobile}</td>
                        <td className="px-4 py-3.5 text-slate-400 capitalize">
                          {member.gender}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                          {formatDate(member.join_date)}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge member={member} />
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                          {expiryDate ? formatDate(expiryDate) : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/members/${member.id}`}
                              className="inline-flex items-center gap-1 text-xs bg-[#334155]/60 hover:bg-[#334155] text-slate-300 hover:text-white rounded-lg px-2.5 py-1.5 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Link>
                            <Link
                              href={`/members/${member.id}?renew=1`}
                              className="inline-flex items-center gap-1 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg px-2.5 py-1.5 transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Renew
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-[#334155]">
                <p className="text-xs text-slate-500">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  {safePage > 1 ? (
                    <Link
                      href={buildHref(safePage - 1)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-[#334155]/40 hover:bg-[#334155] rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-[#334155]/20 rounded-lg px-3 py-1.5 cursor-not-allowed">
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </span>
                  )}
                  <span className="text-xs text-slate-400 px-2">
                    {safePage} / {totalPages}
                  </span>
                  {safePage < totalPages ? (
                    <Link
                      href={buildHref(safePage + 1)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-[#334155]/40 hover:bg-[#334155] rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-[#334155]/20 rounded-lg px-3 py-1.5 cursor-not-allowed">
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function MembersPage({ searchParams }: { searchParams: SearchParams }) {
  const { search, status, page: pageStr } = await searchParams
  const page = parseInt(pageStr ?? '1', 10) || 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Members</h1>
            <p className="text-slate-500 text-xs">Manage your gym members</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/members/import"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-[#334155] hover:border-[#475569] text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </Link>
          <Link
            href="/members/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-500 hover:bg-green-400 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <form method="GET" action="/members">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name, mobile, or member ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-[#334155] hover:border-[#475569] focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30 rounded-xl text-sm text-white placeholder:text-slate-500 transition-colors"
          />
        </div>
      </form>

      {/* Table with filter tabs */}
      <Suspense
        fallback={
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm mt-3">Loading members...</p>
          </div>
        }
      >
        <MembersTable search={search} statusFilter={status} page={page} />
      </Suspense>
    </div>
  )
}
