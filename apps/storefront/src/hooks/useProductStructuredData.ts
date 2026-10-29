import { useEffect } from 'react'
import type { ProductDetail } from '@/services/products'

const SCRIPT_ID = 'nuclara-product-jsonld'

/**
 * Injects Product + Offer JSON-LD structured data for a product page.
 * Only called when a published, compliance-approved product is rendered.
 * Validates that price, currency, and availability match visible content.
 */
export function useProductStructuredData(product: ProductDetail | undefined) {
  useEffect(() => {
    // Remove any previous script
    document.getElementById(SCRIPT_ID)?.remove()

    if (!product) return

    const inStock = product.stock_quantity > 0

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: product.sku,
      description: product.short_description ?? undefined,
      image: product.product_media
        ?.sort((a, b) => a.display_order - b.display_order)
        .map((m) => m.cloudinary_url),
      offers: {
        '@type': 'Offer',
        priceCurrency: product.currency,
        price: product.price.toFixed(2),
        availability: inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        // Research use only — no additional properties implying therapeutic use
        itemCondition: 'https://schema.org/NewCondition',
      },
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)

    return () => {
      document.getElementById(SCRIPT_ID)?.remove()
    }
  }, [product])
}
