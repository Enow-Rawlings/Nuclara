import type { ReactNode } from 'react'

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'purple'

const variants: Record<Variant, string> = {
  default: 'bg-pale-ice text-midnight-navy',
  success: 'bg-[#e8f5f0] text-success-green',
  warning: 'bg-[#fef3e2] text-warning-amber',
  error: 'bg-[#fde8e8] text-error-red',
  info: 'bg-[#e6f4f5] text-scientific-teal',
  outline: 'border border-border-grey text-slate bg-transparent',
  purple: 'bg-[#f0eeff] text-[#6344c8]',
}

export function Badge({
  variant = 'default',
  children,
  className = '',
}: {
  variant?: Variant
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

// Status → badge variant maps

export function productStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    draft: 'outline',
    pending_review: 'warning',
    approved: 'info',
    published: 'success',
    archived: 'default',
    blocked: 'error',
  }
  return map[status] ?? 'default'
}

export function complianceStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    not_submitted: 'outline',
    pending_review: 'warning',
    approved: 'success',
    rejected: 'error',
    expired: 'error',
    requires_resubmission: 'warning',
  }
  return map[status] ?? 'default'
}

export function orderStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    pending_review: 'warning',
    under_review: 'info',
    awaiting_payment: 'purple',
    processing: 'info',
    fulfilled: 'success',
    completed: 'success',
    cancelled: 'default',
    rejected: 'error',
  }
  return map[status] ?? 'default'
}
