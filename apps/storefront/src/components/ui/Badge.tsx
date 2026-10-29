import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-pale-ice text-midnight-navy',
  success:  'bg-[#e8f5f0] text-success-green',
  warning:  'bg-[#fef3e2] text-warning-amber',
  error:    'bg-[#fde8e8] text-error-red',
  info:     'bg-[#e6f4f5] text-scientific-teal',
  outline:  'border border-border-grey text-slate bg-transparent',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
