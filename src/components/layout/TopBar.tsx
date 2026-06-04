'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/memberships': 'Memberships',
  '/payments': 'Payments',
  '/coaches': 'Coaches',
  '/leads': 'Leads',
  '/whatsapp': 'WhatsApp',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return title
    }
  }
  return 'Green Power Gym'
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-green-500/15 text-green-400 border border-green-500/25'
    case 'coach':
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
    case 'receptionist':
      return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
    default:
      return 'bg-slate-500/15 text-slate-400 border border-slate-500/25'
  }
}

export default function TopBar() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) setProfile(data as UserProfile)
    }

    fetchProfile()
  }, [])

  const pageTitle = getPageTitle(pathname)
  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'GP'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-[#1e293b] border-b border-[#334155]">
      <h2 className="text-lg font-semibold text-white">{pageTitle}</h2>

      <div className="flex items-center gap-3">
        {profile && (
          <span className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getRoleBadgeClass(profile.role)}`}>
            {profile.role}
          </span>
        )}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-md shadow-green-500/20 shrink-0">
            <span className="text-white font-bold text-xs">{initials}</span>
          </div>
          {profile && (
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white leading-tight">{profile.name}</p>
              <p className="text-xs text-slate-400 leading-tight">{profile.email}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
