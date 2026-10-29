import { ProductCard } from './ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PackageSearch } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ProductListItem } from '@/services/products'

interface ProductGridProps {
  products: ProductListItem[]
  isLoading: boolean
  isError: boolean
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
}

export function ProductGrid({
  products,
  isLoading,
  isError,
  onRetry,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters or search term.',
}: ProductGridProps) {
  const navigate = useNavigate()

  if (isLoading) return <ProductGridSkeleton count={12} />

  if (isError) {
    return (
      <ErrorState
        message="We could not load the product catalogue. Please try again."
        onRetry={onRetry}
      />
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch size={28} aria-hidden="true" />}
        title={emptyTitle}
        description={emptyDescription}
        action={{ label: 'Browse all products', onClick: () => navigate('/shop') }}
      />
    )
  }

  return (
    <ul
      className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      aria-label="Product grid"
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}
