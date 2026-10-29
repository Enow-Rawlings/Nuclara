import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageSpinner } from '@/components/ui/PageSpinner'
import type { Session } from '@supabase/supabase-js'

/**
 * Route guard for all admin routes.
 * Checks Supabase session client-side as an UX shortcut only.
 * Every API endpoint enforces auth and role server-side independently.
 */
export function RequireAdminAuth() {
  const location = useLocation()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Still resolving
  if (session === undefined) return <PageSpinner />

  // Not authenticated — redirect to login, preserve intended destination
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
