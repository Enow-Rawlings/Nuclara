import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string | undefined
  message?: string | undefined
  onRetry?: (() => void) | undefined
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fde8e8] text-error-red">
        <AlertCircle size={28} aria-hidden="true" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-midnight-navy">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
