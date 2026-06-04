'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  UserCheck,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/members', icon: Users, label: 'Members' },
  { href: '/memberships', icon: CreditCard, label: 'Memberships' },
  { href: '/payments', icon: DollarSign, label: 'Payments' },
  { href: '/coaches', icon: UserCheck, label: 'Coaches' },
  { href: '/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-64 bg-[#0f172a] border-r border-[#334155] z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#334155]">
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/25">
          <span className="text-white font-bold text-sm">GP</span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Green Power</p>
          <p className="text-slate-500 text-xs leading-tight">Gym ERP</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'text-slate-400 hover:bg-[#1e293b] hover:text-slate-100'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 shrink-0',
                  isActive ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#334155]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-[#1e293b] hover:text-red-400 transition-all group"
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
