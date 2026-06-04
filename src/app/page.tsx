import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Dumbbell, Users, CreditCard, MessageCircle, Check } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full bg-green-500/5 blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full bg-green-500/5 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-base">GP</span>
          </div>
          <span className="font-bold text-lg text-white">Green Power Gym</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 text-sm bg-green-500 hover:bg-green-400 text-white rounded-xl font-medium transition-colors"
          >
            Staff Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Logo icon large */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 mb-8 shadow-lg shadow-green-500/30">
          <span className="text-white font-extrabold text-3xl">GP</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-green-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
            Green Power Gym
          </span>
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-slate-300 mb-6">
          Stronger Every Day
        </p>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          Manage members, track payments, and send WhatsApp reminders — all in one powerful ERP built for gyms.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-10 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
          >
            Staff Login
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16 text-center">
          {[
            { value: '500+', label: 'Active Members' },
            { value: '99%', label: 'Uptime' },
            { value: '24/7', label: 'Access' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold text-green-400">{stat.value}</span>
              <span className="text-slate-500 text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Feature cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-center text-slate-400 text-sm font-semibold uppercase tracking-widest mb-10">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Users,
              iconColor: 'text-blue-400',
              iconBg: 'bg-blue-500/10',
              title: 'Member Management',
              desc: 'Register members, track their plans, renewal history, and personal details in one place.',
              highlights: ['Member profiles', 'Bulk import via CSV', 'Advanced search'],
            },
            {
              icon: CreditCard,
              iconColor: 'text-green-400',
              iconBg: 'bg-green-500/10',
              title: 'Payment Tracking',
              desc: 'Record payments, generate receipts, and monitor monthly revenue with instant insights.',
              highlights: ['Cash, UPI, bank transfer', 'Monthly revenue reports', 'Payment history'],
            },
            {
              icon: MessageCircle,
              iconColor: 'text-yellow-400',
              iconBg: 'bg-yellow-500/10',
              title: 'WhatsApp Reminders',
              desc: 'Auto-remind members about expiring memberships and send custom messages via WhatsApp.',
              highlights: ['Expiry alerts', 'Bulk messaging', 'Custom templates'],
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 hover:border-green-500/30 transition-colors"
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${feature.iconBg} mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{feature.desc}</p>
              <ul className="space-y-1.5">
                {feature.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-slate-400 text-sm">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-10 text-center">
          <Dumbbell className="w-10 h-10 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Ready to power your gym?</h2>
          <p className="text-slate-400 mb-6">Log in and start managing your members today.</p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl font-semibold transition-colors"
          >
            Staff Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-slate-600 text-sm border-t border-[#334155]">
        <p>&copy; 2026 Green Power Gym. All rights reserved.</p>
      </footer>
    </div>
  )
}
