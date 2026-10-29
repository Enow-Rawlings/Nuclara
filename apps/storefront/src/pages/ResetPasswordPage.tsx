import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { useSeo } from '@/hooks/useSeo'

export default function ResetPasswordPage() {
  useSeo({
    title: 'Set new password',
    description: 'Set a new password for your Nuclara account.',
    canonicalPath: '/account/reset-password',
    noIndex: true,
  })

  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const inputClass =
    'w-full rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess(true)
      // Redirect to login after a short delay
      setTimeout(() => navigate('/account/login'), 3000)
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5f0]">
          <CheckCircle size={32} className="text-success-green" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Password updated</h1>
        <p className="text-sm text-slate">
          Your password has been changed successfully. Redirecting you to sign in…
        </p>
        <Link to="/account/login" className="text-sm font-medium text-scientific-teal hover:underline">
          Sign in now
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-midnight-navy">Set a new password</h1>
      <p className="mt-1 text-sm text-slate">
        Choose a strong password of at least 8 characters.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded border border-error-red/30 bg-[#fde8e8] px-3 py-2.5 text-sm text-error-red"
          >
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-graphite">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass + ' pr-10'}
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-graphite"
            >
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirm" className="text-sm font-medium text-graphite">
            Confirm new password
          </label>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            placeholder="Re-enter your password"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? 'Updating…' : 'Set new password'}
        </Button>

        <Link to="/account/login" className="text-center text-sm text-scientific-teal hover:underline">
          Back to sign in
        </Link>
      </form>
    </div>
  )
}
