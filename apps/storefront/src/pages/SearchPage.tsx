import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useSeo } from '@/hooks/useSeo'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import type { SortOption } from '@/services/products'

const PAGE_SIZE = 24

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const q = searchParams.get('q') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const sort = (searchParams.get('sort') ?? 'newest') as SortOption

  const { data, isLoading, isError, refetch } = useProducts({
    q: q || undefined,
    page,
    pageSize: PAGE_SIZE,
    sort,
  })

  // Focus search input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useSeo({
    title: q ? `Search: ${q}` : 'Search',
    description: 'Search the Nuclara research peptide catalogue.',
    noIndex: true, // search result pages should not be indexed
  })

  const products = data?.data ?? []
  const meta = data?.meta

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      value ? next.set(key, value) : next.delete(key)
      if (key !== 'page') next.set('page', '1')
      return next
    })
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = inputRef.current?.value.trim() ?? ''
    setParam('q', value)
  }

  const clearSearch = () => {
    setSearchParams(new URLSearchParams())
    inputRef.current?.focus()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search input */}
      <div className="mb-8">
        <h1 className="mb-4 font-heading text-3xl font-bold text-midnight-navy">Search</h1>
        <form onSubmit={handleSearch} role="search" className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor="search-input" className="sr-only">
              Search products
            </label>
            <Search
              size={16}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate"
            />
            <input
              ref={inputRef}
              id="search-input"
              type="search"
              defaultValue={q}
              placeholder="Search products…"
              autoComplete="off"
              className="w-full rounded-lg border border-border-grey bg-cloud-white py-2.5 pl-9 pr-10 text-base text-graphite placeholder-slate focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal"
            />
            {q && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate hover:text-midnight-navy"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-scientific-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#076b76] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scientific-teal"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results header */}
      {q && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate" aria-live="polite" aria-atomic="true">
            {isLoading ? (
              'Searching…'
            ) : (
              <>
                <span className="font-medium text-graphite">{meta?.total ?? 0}</span>{' '}
                result{(meta?.total ?? 0) !== 1 ? 's' : ''} for{' '}
                <span className="font-medium text-graphite">"{q}"</span>
              </>
            )}
          </p>

          <Select
            id="search-sort"
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            aria-label="Sort results"
            className="w-44"
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name_asc">Name: A–Z</option>
          </Select>
        </div>
      )}

      <ProductGrid
        products={products}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle={q ? `No results for "${q}"` : 'Enter a search term'}
        emptyDescription={
          q
            ? 'Try a different term or browse our full catalogue.'
            : 'Use the search box above to find products.'
        }
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
  )
}
