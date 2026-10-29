import { X } from 'lucide-react'
import { useCategories } from '@/hooks/useProducts'
import type { SortOption } from '@/services/products'

interface FilterSidebarProps {
  selectedCategory: string
  selectedSort: SortOption
  onCategoryChange: (slug: string) => void
  onSortChange: (sort: SortOption) => void
  onClear: () => void
  isOpen: boolean
  onClose: () => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name: A–Z' },
]

export function FilterSidebar({
  selectedCategory,
  selectedSort,
  onCategoryChange,
  onSortChange,
  onClear,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const { data: categories = [] } = useCategories()
  const hasActiveFilters = selectedCategory !== '' || selectedSort !== 'newest'

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-grey pb-4 mb-4">
        <h2 className="font-heading text-base font-semibold text-midnight-navy">
          Filter &amp; Sort
        </h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-scientific-teal hover:underline"
            >
              Clear all
            </button>
          )}
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded p-1 text-slate hover:bg-pale-ice lg:hidden"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Sort */}
      <fieldset className="mb-6">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate">
          Sort by
        </legend>
        <div className="flex flex-col gap-1">
          {sortOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-pale-ice"
            >
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={selectedSort === opt.value}
                onChange={() => onSortChange(opt.value)}
                className="accent-scientific-teal"
              />
              <span className={selectedSort === opt.value ? 'font-medium text-midnight-navy' : 'text-graphite'}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Categories */}
      {categories.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate">
            Category
          </legend>
          <div className="flex flex-col gap-1">
            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-pale-ice">
              <input
                type="radio"
                name="category"
                value=""
                checked={selectedCategory === ''}
                onChange={() => onCategoryChange('')}
                className="accent-scientific-teal"
              />
              <span className={selectedCategory === '' ? 'font-medium text-midnight-navy' : 'text-graphite'}>
                All categories
              </span>
            </label>
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-pale-ice"
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  checked={selectedCategory === cat.slug}
                  onChange={() => onCategoryChange(cat.slug)}
                  className="accent-scientific-teal"
                />
                <span className={selectedCategory === cat.slug ? 'font-medium text-midnight-navy' : 'text-graphite'}>
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Product filters"
        className="hidden w-56 flex-shrink-0 lg:block"
      >
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
          <div
            className="absolute inset-0 bg-graphite/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute bottom-0 left-0 top-0 w-72 overflow-y-auto bg-cloud-white p-5 shadow-modal">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
