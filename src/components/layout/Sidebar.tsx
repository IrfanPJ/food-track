'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUIStore } from '@/store/useUIStore'
import { useUserStore } from '@/store/useUserStore'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  ShoppingCart,
  Bot,
  BarChart3,
  CheckSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/food', icon: UtensilsCrossed, label: 'Food Log' },
  { href: '/workout', icon: Dumbbell, label: 'Workout' },
  { href: '/meal-prep', icon: ShoppingCart, label: 'Meal Prep' },
  { href: '/ai-coach', icon: Bot, label: 'AI Coach' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/checklist', icon: CheckSquare, label: 'Checklist' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { profile, setProfile } = useUserStore()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 bg-zinc-950 border-r border-zinc-800 transition-all duration-300 z-30',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-zinc-800', sidebarCollapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
          <Flame className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-bold text-white text-base">FitTrack AI</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
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
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-500/20'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
                sidebarCollapsed && 'justify-center px-2'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 shrink-0',
                  isActive ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'
                )}
              />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div className="p-2 border-t border-zinc-800 space-y-1">
        {!sidebarCollapsed && profile && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">{profile.name}</p>
              <p className="text-xs text-zinc-500 truncate">{profile.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-all',
            sidebarCollapsed && 'justify-center'
          )}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all',
            sidebarCollapsed && 'justify-center'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
