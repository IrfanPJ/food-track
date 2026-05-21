import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-lg">FitTrack AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered Fitness Tracking
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Personal
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Fitness Coach
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Track calories, log workouts, prep meals, and get AI-powered coaching to
            crush your fitness goals. All in one beautiful app.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              Start for Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border border-white/10 hover:border-white/20 text-zinc-300 rounded-2xl font-semibold text-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            {
              icon: '🥗',
              title: 'Smart Food Tracking',
              desc: 'Log meals with ease. Track calories, protein, carbs, and fats with a comprehensive food database.',
            },
            {
              icon: '💪',
              title: 'Workout Planning',
              desc: 'Plan your push/pull/legs splits, track sets and reps, and monitor your strength progress.',
            },
            {
              icon: '🤖',
              title: 'AI Fitness Coach',
              desc: 'Chat with your personal AI coach for nutrition advice, workout tips, and motivation.',
            },
            {
              icon: '📊',
              title: 'Detailed Analytics',
              desc: 'Visualize your progress with beautiful charts. Track weight trends and macro distributions.',
            },
            {
              icon: '🛒',
              title: 'Meal Prep & Inventory',
              desc: 'Manage your pantry, create shopping lists, and plan your meals for the week ahead.',
            },
            {
              icon: '🔥',
              title: 'Habit Tracking',
              desc: 'Build consistency with daily checklists and streak tracking. Never miss a day.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-violet-500/20 transition-all group"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-violet-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-zinc-600 text-sm border-t border-white/5">
        <p>FitTrack AI &copy; {new Date().getFullYear()} - Track, Train, Transform</p>
      </footer>
    </div>
  )
}
