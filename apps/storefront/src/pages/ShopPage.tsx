import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useSeo } from '@/hooks/useSeo'
import { ProductGrid } from '@/components/product/ProductGrid'
import { FilterSidebar } from '@/components/product/FilterSidebar'
import { Pagination } from '@/components/ui/Pagination'
import { Button } from '@/components/ui/Button'
import type { SortOption } from '@/services/products'

const PAGE_SIZE = 24

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const category = searchParams.get('category') ?? ''
  const sort = (searchParams.get('sort') ?? 'newest') as SortOption

  const { data, isLoading, isError, refetch } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    category: category || undefined,
    sort,
  })

  useSeo({
    title: 'Shop',
    description: 'Browse our full catalogue of research-grade synthetic peptides. Compliance-gated, transparently documented, supplied for laboratory use only.',
    canonicalPath: '/shop',
  })

  const setParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
        // Reset to page 1 when filters change
        if (key !== 'page') next.set('page', '1')
        return next
      })
    },
    [setSearchParams]
  )

  const handleClear = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  const products = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-midnight-navy">Shop</h1>
          {meta && !isLoading && (
            <p className="mt-1 text-sm text-slate">
              {meta.total} product{meta.total !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        {/* Mobile filter toggle */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFilterOpen(true)}
          className="lg:hidden"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          Filters
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <FilterSidebar
          selectedCategory={category}
          selectedSort={sort}
          onCategoryChange={(slug) => setParam('category', slug)}
          onSortChange={(s) => setParam('sort', s)}
          onClear={handleClear}
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Active filter chips */}
          {(category || sort !== 'newest') && (
            <div className="mb-4 flex flex-wrap gap-2" aria-label="Active filters">
              {category && (
                <button
                  type="button"
                  onClick={() => setParam('category', '')}
                  className="flex items-center gap-1 rounded-full border border-scientific-teal bg-[#e6f4f5] px-3 py-1 text-xs font-medium text-scientific-teal"
                >
                  {category}
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remove category filter</span>
                </button>
              )}
              {sort !== 'newest' && (
                <button
                  type="button"
                  onClick={() => setParam('sort', 'newest')}
                  className="flex items-center gap-1 rounded-full border border-scientific-teal bg-[#e6f4f5] px-3 py-1 text-xs font-medium text-scientific-teal"
                >
                  Sort: {sort.replace('_', ' ')}
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remove sort filter</span>
                </button>
              )}
            </div>
          )}

          <ProductGrid
            products={products}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
          />

          {meta && meta.totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                page={page}
                totalPages={meta.totalPages}
                total={meta.total}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setParam('page', String(p))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
