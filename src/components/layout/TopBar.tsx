'use client'

import { useTheme } from 'next-themes'
import { format } from 'date-fns'
import { Sun, Moon, Bell } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { getGreeting } from '@/lib/utils'

export default function TopBar() {
  const { theme, setTheme } = useTheme()
  const { profile } = useUserStore()
  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div>
        <p className="text-xs text-zinc-500">{today}</p>
        <h2 className="text-sm font-semibold text-zinc-100">
          {getGreeting()}, {profile?.name?.split(' ')[0] || 'there'} 👋
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  )
}
