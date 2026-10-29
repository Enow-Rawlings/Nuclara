import { Link } from 'react-router-dom'
import { ArrowRight, Search, ShoppingBag, Home } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  useSeo({
    title: 'Page not found',
    description: 'The page you were looking for could not be found.',
    noIndex: true,
  })

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="font-heading text-8xl font-bold text-scientific-teal/20 sm:text-9xl" aria-hidden="true">
        404
      </p>
      <h1 className="-mt-4 font-heading text-3xl font-bold text-midnight-navy sm:text-4xl">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base text-slate">
        The page you're looking for doesn't exist or may have been moved.
        Here are some links that might help.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="md" onClick={() => (window.location.href = '/')}>
          <Home size={16} aria-hidden="true" />
          Go home
        </Button>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded border border-border-grey bg-pale-ice px-5 py-2.5 text-sm font-medium text-midnight-navy no-underline transition-colors hover:border-scientific-teal hover:text-scientific-teal"
        >
          <ShoppingBag size={16} aria-hidden="true" />
          Browse catalogue
        </Link>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 rounded border border-border-grey bg-pale-ice px-5 py-2.5 text-sm font-medium text-midnight-navy no-underline transition-colors hover:border-scientific-teal hover:text-scientific-teal"
        >
          <Search size={16} aria-hidden="true" />
          Search products
        </Link>
      </div>

      <div className="mt-12 border-t border-border-grey pt-8">
        <p className="text-sm text-slate">
          Need help?{' '}
          <Link to="/contact" className="font-medium text-scientific-teal hover:underline">
            Contact our team
            <ArrowRight size={12} className="ml-1 inline" aria-hidden="true" />
          </Link>
        </p>
      </div>
    </div>
  )
}
