import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, ShieldCheck, Truck } from 'lucide-react'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { useContent } from '@/hooks/useContent'
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
  const { data: content = {} } = useContent()

  const featuredProducts = featuredData?.data ?? []

  // Hero text — falls back to defaults if content blocks not yet seeded
  const heroEyebrow = content['homepage_hero_eyebrow'] || 'Research Grade Peptides'
  const heroHeading = content['homepage_hero_heading'] || 'Precision peptides for serious research.'
  const heroSubtext = content['homepage_hero_subtext'] || 'Nuclara supplies synthetic peptides to qualified researchers and laboratories. Every product is clearly documented, compliance-gated, and supplied with full transparency.'

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative border-b border-border-grey bg-midnight-navy bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      >
        {/* Overlay — light enough to see the image, dark enough for text contrast */}
        <div className="absolute inset-0 bg-midnight-navy/50" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/90">
            {heroEyebrow}
          </p>
          <h1 className="max-w-2xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {heroHeading}
          </h1>
          <p className="max-w-xl text-lg text-white/80">
            {heroSubtext}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="lg" onClick={() => (window.location.href = '/shop')}>
              Browse catalogue
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded px-6 py-3 text-base font-medium text-white no-underline transition-colors hover:text-scientific-teal"
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

      {/* ── Why Choose Us ────────────────────────────────────────────────────── */}
      <section className="border-b border-border-grey bg-cloud-white" aria-labelledby="why-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">
              Why Nuclara
            </p>
            <h2 id="why-heading" className="font-heading text-3xl font-bold text-midnight-navy sm:text-4xl">
              Built for researchers who demand precision
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate">
              We built Nuclara around one principle: researchers deserve a supplier that is as rigorous about documentation and compliance as they are about their work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Verified purity, every batch',
                body: 'Every peptide is supplied with a certificate of analysis. No generic specs — you get the actual data for the batch you receive.',
              },
              {
                number: '02',
                title: 'Compliance before checkout',
                body: 'Products are gated by destination market. If a peptide is not cleared for your region, you will know before you place an order — not after.',
              },
              {
                number: '03',
                title: 'Transparent documentation',
                body: 'Full product sheets, handling guidelines, and regulatory status per market. Everything is disclosed, nothing is buried in footnotes.',
              },
              {
                number: '04',
                title: 'Direct fulfilment, no middlemen',
                body: 'We warehouse and ship every order ourselves. That means real-time stock visibility and no third-party delays between you and your product.',
              },
              {
                number: '05',
                title: 'Research-only supply chain',
                body: 'Nuclara operates exclusively in the research supply channel. We do not sell to consumers. Every order is reviewed against qualifying criteria.',
              },
              {
                number: '06',
                title: 'Responsive specialist support',
                body: 'Questions about a peptide, your order, or your market? Our support team understands the science — not just the logistics.',
              },
            ].map((item) => (
              <div
                key={item.number}
                className="group rounded-xl border border-border-grey bg-pale-ice p-6 transition-shadow hover:shadow-card"
              >
                <span className="mb-4 block font-heading text-3xl font-bold text-scientific-teal/30 group-hover:text-scientific-teal/60 transition-colors">
                  {item.number}
                </span>
                <h3 className="mb-2 font-heading text-base font-semibold text-midnight-navy">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


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
            {content['research_notice'] ? (
              content['research_notice']
            ) : (
              <>
                All products on this website are supplied for{' '}
                <strong className="font-medium text-graphite">research and laboratory use only</strong>.
                They are not intended for human or veterinary use. No therapeutic, health, or performance
                claims are made. Availability varies by destination — not all products are eligible in
                every market.{' '}
                <Link to="/help" className="text-scientific-teal">
                  Learn more
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </section>
    </div>
  )
}
