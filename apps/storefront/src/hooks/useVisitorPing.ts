import { useEffect } from 'react'
import { api } from '@/lib/api'

const SESSION_KEY = 'nuclara_visitor_pinged'

/**
 * Fires a single visitor ping to the API once per browser session.
 * Subsequent navigations within the same tab don't re-fire.
 * Bots are filtered server-side.
 */
export function useVisitorPing() {
  useEffect(() => {
    // Only fire once per session
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')

    // Fire and forget — don't await, don't catch errors visibly
    api
      .post('/visitor-ping', {
        page: window.location.pathname,
        referrer: document.referrer,
      })
      .catch(() => {
        // Swallow silently — this must never affect the visitor
      })
  }, [])
}
