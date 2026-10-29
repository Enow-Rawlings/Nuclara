import { useState } from 'react'
import { Package, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductMediaItem } from '@/services/products'

interface ProductGalleryProps {
  media: ProductMediaItem[]
  productName: string
}

export function ProductGallery({ media, productName }: ProductGalleryProps) {
  const sorted = [...media].sort((a, b) => a.display_order - b.display_order)
  const [activeIndex, setActiveIndex] = useState(0)

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-pale-ice text-border-grey">
        <Package size={64} aria-label={`No image available for ${productName}`} />
      </div>
    )
  }

  const active = sorted[activeIndex]

  const prev = () => setActiveIndex((i) => (i === 0 ? sorted.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === sorted.length - 1 ? 0 : i + 1))

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-pale-ice">
        <img
          key={active.cloudinary_url}
          src={active.cloudinary_url}
          alt={active.alt_text || productName}
          className="h-full w-full object-cover"
          decoding="async"
        />

        {sorted.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-cloud-white/90 shadow-card transition-colors hover:bg-cloud-white"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-cloud-white/90 shadow-card transition-colors hover:bg-cloud-white"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2" role="list" aria-label="Product images">
          {sorted.map((img, i) => (
            <button
              key={img.cloudinary_url}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex ? 'true' : undefined}
              className={[
                'h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors',
                i === activeIndex ? 'border-scientific-teal' : 'border-border-grey hover:border-slate',
              ].join(' ')}
            >
              <img
                src={img.cloudinary_url}
                alt={img.alt_text || `${productName} image ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
