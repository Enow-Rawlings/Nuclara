import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, getPrimaryImage, isInStock, isLowStock } from '@/services/products'
import type { ProductListItem } from '@/services/products'

interface ProductCardProps {
  product: ProductListItem
  /** Optional override — used when rendering inside a category grid */
  categorySlug?: string
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = getPrimaryImage(product.product_media)
  const inStock = isInStock(product.stock_quantity)
  const lowStock = isLowStock(product.stock_quantity, 10)

  return (
    <article className="group flex flex-col rounded-lg border border-border-grey bg-cloud-white transition-shadow duration-200 hover:shadow-card-hover">
      {/* Image */}
      <Link
        to={`/product/${product.slug}`}
        className="block overflow-hidden rounded-t-lg"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="relative aspect-square bg-pale-ice">
          {primaryImage ? (
            <img
              src={primaryImage.cloudinary_url}
              alt={primaryImage.alt_text || product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-border-grey">
              <Package size={48} aria-hidden="true" />
            </div>
          )}

          {/* Stock badge overlaid on image */}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-cloud-white/80">
              <Badge variant="outline">Out of stock</Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Category label */}
        {product.categories?.[0]?.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-slate">
            {product.categories[0].category.name}
          </span>
        )}

        {/* Name — the accessible link */}
        <h3 className="font-heading text-sm font-semibold leading-snug text-midnight-navy sm:text-base">
          <Link
            to={`/product/${product.slug}`}
            className="no-underline hover:text-scientific-teal focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scientific-teal"
          >
            {product.name}
          </Link>
        </h3>

        {/* SKU */}
        <p className="font-mono text-xs text-slate">{product.sku}</p>

        {/* Price + stock row */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-heading text-base font-bold text-midnight-navy">
            {formatPrice(product.price, product.currency)}
          </span>
          {lowStock && inStock && (
            <Badge variant="warning">Low stock</Badge>
          )}
        </div>

        {/* Research disclaimer — always shown, non-negotiable */}
        <p className="text-xs text-slate">Research use only</p>
      </div>
    </article>
  )
}
