import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { ShoppingCart, AlertTriangle, Truck, RotateCcw, Check } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useSeo } from '@/hooks/useSeo'
import { useProductStructuredData } from '@/hooks/useProductStructuredData'
import { ProductGallery } from '@/components/product/ProductGallery'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProductDetailSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatPrice, isInStock, isLowStock } from '@/services/products'
import { useCartStore } from '@/store/cartStore'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError, refetch } = useProduct(slug ?? '')

  // SEO — use API-provided seo_records if available, fall back to product data
  const seoRecord = product?.seo_records?.[0]
  const primaryImage = product?.product_media?.[0]?.cloudinary_url
  useSeo({
    title: seoRecord?.seo_title ?? product?.name,
    description: seoRecord?.meta_description ?? product?.short_description ?? undefined,
    canonicalPath: seoRecord?.canonical_url ? undefined : `/product/${product?.slug}`,
    noIndex: seoRecord?.robots_directive?.includes('noindex') ?? false,
    image: primaryImage,
  })
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    if (!product) return
    // Build a ProductListItem-compatible shape from the detail response
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      currency: product.currency,
      short_description: product.short_description,
      stock_quantity: product.stock_quantity,
      product_media: product.product_media ?? [],
      categories: product.categories ?? [],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Structured data
  useProductStructuredData(product)

  const alreadyInCart = cartItems.some((i) => i.productId === product?.id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductDetailSkeleton />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState
          title="Product not available"
          message="This product may not be available in your region, or the link may be incorrect."
          onRetry={refetch}
        />
      </div>
    )
  }

  const category = product.categories?.[0]?.category
  const inStock = isInStock(product.stock_quantity)
  const lowStock = isLowStock(product.stock_quantity, 10)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Shop', href: '/shop' },
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery media={product.product_media ?? []} productName={product.name} />

        {/* Product info */}
        <div className="flex flex-col gap-5">
          {/* Category label */}
          {category && (
            <Link
              to={`/category/${category.slug}`}
              className="text-xs font-medium uppercase tracking-wider text-slate no-underline hover:text-scientific-teal"
            >
              {category.name}
            </Link>
          )}

          {/* Name */}
          <h1 className="font-heading text-2xl font-bold text-midnight-navy sm:text-3xl">
            {product.name}
          </h1>

          {/* SKU */}
          <p className="font-mono text-sm text-slate">SKU: {product.sku}</p>

          {/* Price */}
          <p className="font-heading text-2xl font-bold text-midnight-navy">
            {formatPrice(product.price, product.currency)}
          </p>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            {inStock ? (
              <>
                <span className="h-2 w-2 rounded-full bg-success-green" aria-hidden="true" />
                <span className="text-sm font-medium text-success-green">In stock</span>
                {lowStock && <Badge variant="warning">Low stock</Badge>}
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-error-red" aria-hidden="true" />
                <span className="text-sm font-medium text-error-red">Out of stock</span>
              </>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-base leading-relaxed text-graphite">{product.short_description}</p>
          )}

          {/* Add to cart */}
          {inStock ? (
            <Button
              variant={added ? 'secondary' : 'primary'}
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check size={18} aria-hidden="true" />
                  Added to cart
                </>
              ) : (
                <>
                  <ShoppingCart size={18} aria-hidden="true" />
                  {alreadyInCart ? 'Add another' : 'Add to cart'}
                </>
              )}
            </Button>
          ) : (
            <Button variant="secondary" size="lg" disabled className="w-full sm:w-auto">
              Out of stock
            </Button>
          )}

          {/* Research use disclaimer — required, non-negotiable */}
          <div className="flex gap-2 rounded-lg border border-warning-amber/30 bg-[#fef9ec] p-3 text-sm">
            <AlertTriangle
              size={16}
              className="mt-0.5 flex-shrink-0 text-warning-amber"
              aria-hidden="true"
            />
            <p className="text-graphite">
              <strong className="font-medium">Research use only.</strong> This product is not
              intended for human or veterinary use. No therapeutic or health claims are made.
            </p>
          </div>

          {/* Shipping & returns links */}
          <div className="flex flex-col gap-2 border-t border-border-grey pt-4 text-sm text-slate">
            <Link to="/shipping" className="flex items-center gap-2 no-underline hover:text-scientific-teal">
              <Truck size={14} aria-hidden="true" />
              Shipping information
            </Link>
            <Link to="/returns" className="flex items-center gap-2 no-underline hover:text-scientific-teal">
              <RotateCcw size={14} aria-hidden="true" />
              Returns &amp; cancellations
            </Link>
          </div>
        </div>
      </div>

      {/* Long description */}
      {product.long_description && (
        <section className="mt-12 border-t border-border-grey pt-10">
          <h2 className="font-heading text-xl font-semibold text-midnight-navy">
            Product information
          </h2>
          <div className="prose prose-slate mt-4 max-w-3xl text-base leading-relaxed text-graphite">
            {product.long_description}
          </div>
        </section>
      )}
    </div>
  )
}
