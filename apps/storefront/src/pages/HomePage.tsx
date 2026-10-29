import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, ShieldCheck, Truck } from 'lucide-react'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { CategoryCard } from '@/components/product/CategoryCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { useSeo } from '@/hooks/useSeo'

export default function HomePage() {
  useSeo({
    
    description: 'Nuclara supplies research-grade synthetic peptides to qualified laboratories. Precision peptides, compliance-gated, transparently documented.',
    canonicalPath: '/',
  })
  const { data: featuredData, isLoading: productsLoading } = useProducts({
    page: 1,
    pageSize: 8,
    sort: 'newest',
  })
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()

  const featuredProducts = featuredData?.data ?? []

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-scientific-teal">
            Research Grade Peptides
          </p>
          <h1 className="max-w-2xl font-heading text-4xl font-bold leading-tight text-pale-ice sm:text-5xl lg:text-6xl">
            Precision peptides for serious research.
          </h1>
          <p className="max-w-xl text-lg text-slate">
            Nuclara supplies synthetic peptides to qualified researchers and laboratories.
            Every product is clearly documented, compliance-gated, and supplied with full
            transparency.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="lg" onClick={() => (window.location.href = '/shop')}>
              Browse catalogue
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded px-6 py-3 text-base font-medium text-pale-ice no-underline transition-colors hover:text-scientific-teal"
            >
              About Nuclara
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust pillars ────────────────────────────────────────────────────── */}
      <section className="border-b border-border-grey bg-pale-ice" aria-label="Why Nuclara">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 sm:px-6 sm:grid-cols-3 lg:px-8">
          {[
            {
              icon: <FlaskConical size={20} aria-hidden="true" />,
              title: 'Research grade',
              body: 'Synthetic peptides supplied with full product documentation for laboratory use.',
            },
            {
              icon: <ShieldCheck size={20} aria-hidden="true" />,
              title: 'Compliance gated',
              body: 'Every product is reviewed per destination market before it is made available.',
            },
            {
              icon: <Truck size={20} aria-hidden="true" />,
              title: 'Direct fulfilment',
              body: 'Stored and shipped by us — no third-party warehousing, direct order visibility.',
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="flex gap-4 border-b border-border-grey p-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#e6f4f5] text-scientific-teal">
                {pillar.icon}
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold text-midnight-navy">
                  {pillar.title}
                </h3>
                <p className="mt-1 text-sm text-slate">{pillar.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="featured-heading">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="featured-heading" className="font-heading text-2xl font-bold text-midnight-navy">
            Featured products
          </h2>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-sm font-medium text-scientific-teal no-underline hover:underline"
          >
            View all
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {productsLoading ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" role="list" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} aria-hidden="true">
                <ProductCardSkeleton />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" role="list" aria-label="Featured products">
            {featuredProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Categories ──────────────────────────────────────────────────────── */}
      {(categoriesLoading || categories.length > 0) && (
        <section className="border-t border-border-grey bg-pale-ice">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="categories-heading">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 id="categories-heading" className="font-heading text-2xl font-bold text-midnight-navy">
                Browse by category
              </h2>
              <Link
                to="/categories"
                className="flex items-center gap-1 text-sm font-medium text-scientific-teal no-underline hover:underline"
              >
                All categories
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {categoriesLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} aria-hidden="true" className="h-36 animate-pulse rounded-lg bg-border-grey" />
                ))}
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <CategoryCard category={cat} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ── Research notice ──────────────────────────────────────────────────── */}
      <section className="border-t border-border-grey bg-cloud-white">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate">
            All products on this website are supplied for{' '}
            <strong className="font-medium text-graphite">research and laboratory use only</strong>.
            They are not intended for human or veterinary use. No therapeutic, health, or performance
            claims are made. Availability varies by destination — not all products are eligible in
            every market.{' '}
            <Link to="/help" className="text-scientific-teal">
              Learn more
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
