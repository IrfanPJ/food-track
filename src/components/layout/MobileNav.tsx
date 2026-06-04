'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/members', icon: Users, label: 'Members' },
  { href: '/payments', icon: DollarSign, label: 'Payments' },
  { href: '/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { href: '/settings', icon: MoreHorizontal, label: 'More' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-t border-[#334155] px-2 pb-safe">
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
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[56px] relative',
                isActive ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-400 rounded-full" />
              )}
              <item.icon className={cn('w-5 h-5', isActive && 'text-green-400')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
