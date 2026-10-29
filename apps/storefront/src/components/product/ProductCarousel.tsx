import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/Skeleton'

interface ProductCarouselProps {
  /** Slug of the current product — excluded from results */
  currentSlug: string
  /** Category slug to filter by — shows same-category products first */
  categorySlug?: string | undefined
  heading?: string
}

export function ProductCarousel({
  currentSlug,
  categorySlug,
  heading = 'You may also like',
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Fetch same-category products if we have a category, else recent products
  const { data: categoryData, isLoading: catLoading } = useProducts({
    category: categorySlug,
    pageSize: 12,
    sort: 'newest',
  })

  const { data: recentData, isLoading: recentLoading } = useProducts({
    pageSize: 12,
    sort: 'newest',
  })

  const isLoading = categorySlug ? catLoading : recentLoading
  const rawProducts = (categorySlug ? categoryData?.data : recentData?.data) ?? []

  // Exclude the currently viewed product
  const products = rawProducts.filter((p) => p.slug !== currentSlug).slice(0, 10)

  // Update scroll button visibility
  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect() }
  }, [updateScrollState, products.length])

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const cardWidth = el.querySelector('li')?.offsetWidth ?? 240
    const gap = 16
    el.scrollBy({ left: dir === 'left' ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2, behavior: 'smooth' })
  }

  if (!isLoading && products.length === 0) return null

  return (
    <section aria-labelledby="carousel-heading" className="border-t border-border-grey pt-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2
          id="carousel-heading"
          className="font-heading text-2xl font-bold text-midnight-navy"
        >
          {heading}
        </h2>

        {/* Scroll arrows — desktop */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-grey bg-cloud-white text-graphite transition-colors hover:border-scientific-teal hover:text-scientific-teal disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border-grey bg-cloud-white text-graphite transition-colors hover:border-scientific-teal hover:text-scientific-teal disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Track */}
      <div className="relative">
        {/* Left fade */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-cloud-white to-transparent transition-opacity duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Right fade */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-cloud-white to-transparent transition-opacity duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
        />

        <ul
          ref={trackRef}
          role="list"
          aria-label={heading}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <li key={i} aria-hidden="true" className="w-52 flex-shrink-0 sm:w-60">
                  <div className="flex flex-col gap-3 rounded-lg border border-border-grey p-3">
                    <Skeleton className="aspect-square w-full rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </li>
              ))
            : products.map((product) => (
                <li key={product.id} className="w-52 flex-shrink-0 sm:w-60">
                  <ProductCard product={product} />
                </li>
              ))}
        </ul>
      </div>

      {/* View all link */}
      {categorySlug && (
        <div className="mt-4 text-center">
          <Link
            to={`/category/${categorySlug}`}
            className="text-sm font-medium text-scientific-teal no-underline hover:underline"
          >
            View all in this category →
          </Link>
        </div>
      )}
    </section>
  )
}
