import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'

export default function ForgotPasswordPage() {
  useSeo({
    title: 'Reset password',
    description: 'Reset your Nuclara account password.',
    canonicalPath: '/account/forgot-password',
    noIndex: true,
  })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const inputClass = 'w-full rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/password-reset-request', { email })
    } finally {
      // Always show success — non-enumeration
      setSubmitted(true)
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5f0]">
          <CheckCircle size={32} className="text-success-green" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Check your email</h1>
        <p className="text-slate">
          If an account with that email exists, a password reset link has been sent.
        </p>
        <Link to="/account/login" className="text-scientific-teal">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="font-heading text-2xl font-bold text-midnight-navy">Reset password</h1>
      <p className="mt-1 text-sm text-slate">
        Enter your email and we'll send a reset link if an account exists.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-graphite">Email address</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
        <Link to="/account/login" className="text-center text-sm text-scientific-teal">
          Back to sign in
        </Link>
      </form>
    </div>
  )
}
