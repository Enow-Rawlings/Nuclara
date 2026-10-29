import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  // Build visible page numbers — always show first, last, current ±1
  const pages: (number | 'ellipsis')[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
      pages.push(p)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {/* Summary */}
      <p className="text-sm text-slate">
        Showing <span className="font-medium text-graphite">{start}–{end}</span> of{' '}
        <span className="font-medium text-graphite">{total}</span> products
      </p>

      {/* Controls */}
      <ol className="flex items-center gap-1" role="list">
        {/* Previous */}
        <li>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded border border-border-grey text-slate transition-colors hover:border-midnight-navy hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
        </li>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <li key={`ellipsis-${i}`} aria-hidden="true">
              <span className="flex h-8 w-8 items-center justify-center text-sm text-slate">
                …
              </span>
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={[
                  'flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-midnight-navy text-white'
                    : 'border border-border-grey text-slate hover:border-midnight-navy hover:text-midnight-navy',
                ].join(' ')}
              >
                {p}
              </button>
            </li>
          )
        )}

        {/* Next */}
        <li>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded border border-border-grey text-slate transition-colors hover:border-midnight-navy hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </li>
      </ol>
    </nav>
  )
}
