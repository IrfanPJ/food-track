'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  Bot,
  User,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/food', icon: UtensilsCrossed, label: 'Food' },
  { href: '/workout', icon: Dumbbell, label: 'Workout' },
  { href: '/ai-coach', icon: Bot, label: 'AI' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
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
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[56px]',
                isActive ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-violet-400')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
