import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { useProducts, useCategories, useCategory } from '@/hooks/useProducts'
import { useSeo } from '@/hooks/useSeo'
import { ProductGrid } from '@/components/product/ProductGrid'
import { CategoryCard } from '@/components/product/CategoryCard'
import { FilterSidebar } from '@/components/product/FilterSidebar'
import { Pagination } from '@/components/ui/Pagination'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import type { SortOption } from '@/services/products'

const PAGE_SIZE = 24

export default function CategoryPage() {
  const { slug } = useParams<{ slug?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const isCategoryDirectory = !slug

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const sort = (searchParams.get('sort') ?? 'newest') as SortOption

  const { data: category, isLoading: catLoading } = useCategory(slug ?? '')
  const { data: allCategories = [] } = useCategories()

  useSeo(
    isCategoryDirectory
      ? { title: 'Categories', description: 'Browse research peptides by category.', canonicalPath: '/categories' }
      : {
          title: category?.name ?? slug,
          description: category?.description ?? `Browse ${category?.name ?? slug} research peptides.`,
          canonicalPath: `/category/${slug}`,
        }
  )

  const { data, isLoading, isError, refetch } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    category: slug,
    sort,
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

  // ── Category directory page (/categories) ────────────────────────────────────
  if (isCategoryDirectory) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Categories' }]} />
        <h1 className="mt-4 font-heading text-3xl font-bold text-midnight-navy">Categories</h1>
        <p className="mt-2 text-slate">Browse our research peptide catalogue by category.</p>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {allCategories.map((cat) => (
            <li key={cat.id}>
              <CategoryCard category={cat} />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // ── Individual category page (/category/:slug) ────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/categories' },
          { label: catLoading ? '…' : (category?.name ?? slug) },
        ]}
      />

      <div className="mb-6 mt-4 flex items-start justify-between gap-4">
        <div>
          {catLoading ? (
            <>
              <Skeleton className="h-8 w-56" />
              <Skeleton className="mt-2 h-4 w-96" />
            </>
          ) : (
            <>
              <h1 className="font-heading text-3xl font-bold text-midnight-navy">
                {category?.name ?? slug}
              </h1>
              {category?.description && (
                <p className="mt-2 max-w-2xl text-slate">{category.description}</p>
              )}
            </>
          )}
          {meta && !isLoading && (
            <p className="mt-2 text-sm text-slate">
              {meta.total} product{meta.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFilterOpen(true)}
          className="lg:hidden"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          Sort
        </Button>
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          selectedCategory={slug ?? ''}
          selectedSort={sort}
          onCategoryChange={(s) =>
            s && s !== slug
              ? setSearchParams(new URLSearchParams({ page: '1' }))
              : undefined
          }
          onSortChange={(s) => setParam('sort', s)}
          onClear={() => setSearchParams(new URLSearchParams())}
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            emptyTitle="No products in this category"
            emptyDescription="Check back soon or browse other categories."
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
