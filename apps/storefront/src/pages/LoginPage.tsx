import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'

export default function LoginPage() {
  useSeo({
    title: 'Sign in',
    description: 'Sign in to your Nuclara account.',
    canonicalPath: '/account/login',
    noIndex: true,
  })
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        // Generic message — don't reveal whether email exists
        setError('Invalid email or password. Please check your details and try again.')
        return
      }
      navigate(from, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite placeholder-slate focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal'

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-midnight-navy">Sign in</h1>
      <p className="mt-1 text-sm text-slate">
        Don't have an account?{' '}
        <Link to="/account/register" className="text-scientific-teal">Create one</Link>
      </p>

      {error && (
        <div role="alert" className="mt-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-graphite">Email address</label>
          <input
            id="email" type="email" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-graphite">Password</label>
            <Link to="/account/forgot-password" className="text-xs text-scientific-teal">
              Forgot password?
            </Link>
          </div>
          <input
            id="password" type="password" autoComplete="current-password" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
