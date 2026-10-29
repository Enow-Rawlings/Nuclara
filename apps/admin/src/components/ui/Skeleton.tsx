export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={['animate-pulse rounded bg-border-grey', className].join(' ')} />
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
