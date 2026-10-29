import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, ...items]

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          return (
            <li key={index} className="flex items-center gap-1">
              {index === 0 ? (
                item.href ? (
                  <Link
                    to={item.href}
                    className="flex items-center gap-1 text-slate no-underline transition-colors hover:text-scientific-teal"
                  >
                    <Home size={13} aria-hidden="true" />
                    <span className="sr-only">Home</span>
                  </Link>
                ) : (
                  <Home size={13} aria-hidden="true" className="text-slate" />
                )
              ) : item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-slate no-underline transition-colors hover:text-scientific-teal"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'font-medium text-midnight-navy' : 'text-slate'}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  size={13}
                  aria-hidden="true"
                  className="flex-shrink-0 text-border-grey"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
