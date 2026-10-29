import { Link } from 'react-router-dom'
import { ArrowRight, FolderOpen } from 'lucide-react'
import type { CategoryItem } from '@/services/products'

interface CategoryCardProps {
  category: CategoryItem
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border-grey bg-cloud-white no-underline transition-shadow hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-scientific-teal"
    >
      {/* Image or placeholder */}
      <div className="aspect-video bg-pale-ice">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-border-grey">
            <FolderOpen size={36} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-between gap-2 p-4">
        <div>
          <h3 className="font-heading text-sm font-semibold text-midnight-navy sm:text-base">
            {category.name}
          </h3>
          {category.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate">{category.description}</p>
          )}
        </div>
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="flex-shrink-0 text-slate transition-transform duration-200 group-hover:translate-x-1 group-hover:text-scientific-teal"
        />
      </div>
    </Link>
  )
}
