import { Link } from 'react-router-dom'
import { Globe, ArrowRight, ShoppingBag } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { Button } from '@/components/ui/Button'

export default function UnavailablePage() {
  useSeo({
    title: 'Not available in your region',
    description: 'This product or page is not available in your region.',
    noIndex: true,
  })

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f4f5] text-scientific-teal">
        <Globe size={32} aria-hidden="true" />
      </div>
      <h1 className="font-heading text-3xl font-bold text-midnight-navy sm:text-4xl">
        Not available in your region
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base text-slate">
        This product is not currently available for your destination market based on our
        compliance review. Availability is assessed per product, per market, and may change
        over time.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-left">
        <p className="text-sm font-medium text-amber-800">Why is this?</p>
        <p className="mt-1 text-sm text-amber-700">
          Synthetic peptides are regulated differently across jurisdictions. We review each
          product against the rules of each market before making it available. Some products
          are restricted or pending review for certain destinations.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="md" onClick={() => (window.location.href = '/shop')}>
          <ShoppingBag size={16} aria-hidden="true" />
          Browse available products
        </Button>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 rounded border border-border-grey bg-pale-ice px-5 py-2.5 text-sm font-medium text-midnight-navy no-underline transition-colors hover:border-scientific-teal hover:text-scientific-teal"
        >
          Ask about availability
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-10 text-xs text-slate">
        If you believe this is an error or your circumstances have changed,{' '}
        <Link to="/contact" className="font-medium text-scientific-teal hover:underline">
          contact our compliance team
        </Link>
        .
      </p>
    </div>
  )
}
