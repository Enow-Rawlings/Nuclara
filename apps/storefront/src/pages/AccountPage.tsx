import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { User, ShoppingBag, LogOut } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { useSeo } from '@/hooks/useSeo'

export default function AccountPage() {
  useSeo({
    title: 'My account',
    description: 'Manage your Nuclara account and order history.',
    canonicalPath: '/account',
    noIndex: true,
  })
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pale-ice text-slate">
          <User size={28} aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Your account</h1>
        <p className="text-slate">Sign in to view your order history and manage your details.</p>
        <Button variant="primary" onClick={() => navigate('/account/login')}>Sign in</Button>
        <Link to="/account/register" className="text-sm text-scientific-teal">Create an account</Link>
      </div>
    )
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-midnight-navy">My account</h1>
          <p className="mt-1 text-sm text-slate">{session.user.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut size={14} aria-hidden="true" />
          Sign out
        </Button>
      </div>

      <nav aria-label="Account navigation">
        <ul className="divide-y divide-border-grey rounded-lg border border-border-grey" role="list">
          <li>
            <Link
              to="/account/orders"
              className="flex items-center gap-4 px-5 py-4 no-underline transition-colors hover:bg-pale-ice"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6f4f5] text-scientific-teal">
                <ShoppingBag size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-midnight-navy">Order history</p>
                <p className="text-sm text-slate">View your order requests and their status.</p>
              </div>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
