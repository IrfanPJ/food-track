'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { UserRole } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('receptionist')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      const userId = data.user?.id
      if (userId) {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          user_id: userId,
          name,
          email,
          role,
        })
        if (profileError) throw profileError
      }

      setSuccess(true)
      toast.success('Account created successfully!')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      {/* Green glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-green-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <span className="text-white font-bold text-2xl">GP</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Green Power Gym</h1>
            <p className="text-green-400 text-sm font-medium mt-0.5">Stronger Every Day</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
              <p className="text-slate-400 text-sm">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
              <p className="text-slate-400 text-sm mb-6">Set up your gym staff account</p>

              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Smith"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="staff@greenpower.gym"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option value="admin">Admin</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="coach">Coach</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/20"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-slate-600 text-xs">Green Power Gym ERP &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
