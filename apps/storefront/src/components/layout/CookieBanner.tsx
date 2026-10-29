import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'nuclara_cookie_consent'

type ConsentState = 'accepted' | 'declined' | null

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState
    if (!stored) {
      // Small delay so the banner doesn't flash on initial render
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
    setConsent(stored)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setConsent('accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setConsent('declined')
    setVisible(false)
  }

  if (!visible || consent !== null) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-grey bg-cloud-white shadow-modal sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:rounded-xl sm:border"
    >
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie size={18} className="flex-shrink-0 text-scientific-teal" aria-hidden="true" />
            <p className="font-heading text-sm font-semibold text-midnight-navy">
              We use cookies
            </p>
          </div>
          <button
            type="button"
            onClick={handleDecline}
            aria-label="Dismiss cookie notice"
            className="rounded p-0.5 text-slate hover:text-graphite"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-slate">
          We use essential cookies to keep the site working and optional analytics cookies
          to understand how it is used. No personal data is sold or shared with advertisers.
          See our{' '}
          <Link
            to="/cookies"
            className="font-medium text-scientific-teal hover:underline"
          >
            Cookie Policy
          </Link>{' '}
          for details.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAccept}
            className="rounded bg-midnight-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-scientific-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scientific-teal"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="rounded border border-border-grey bg-transparent px-4 py-2 text-sm font-medium text-graphite transition-colors hover:bg-pale-ice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite"
          >
            Essential only
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Returns the current cookie consent state without triggering a re-render.
 * Use this in analytics initialisation code.
 */
export function getCookieConsent(): ConsentState {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY) as ConsentState
}
