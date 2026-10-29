import { useParams, useLocation, Link, Navigate } from 'react-router-dom'
import { CheckCircle, Mail, Clock, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSeo } from '@/hooks/useSeo'

interface LocationState {
  reference: string
  status: string
  message: string
  email: string
}

export default function OrderConfirmationPage() {
  useSeo({
    title: 'Order received',
    description: 'Your order request has been received.',
    noIndex: true,
  })
  const { reference } = useParams<{ reference: string }>()
  const location = useLocation()
  const state = location.state as LocationState | null

  // Guard — someone navigated here directly without an order
  if (!state?.reference) {
    return <Navigate to="/shop" replace />
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Success icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f5f0]">
          <CheckCircle size={40} className="text-success-green" aria-hidden="true" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-midnight-navy">
          Order request received
        </h1>
        <p className="mt-3 text-lg text-slate">
          Thank you. Your request has been submitted successfully.
        </p>
      </div>

      {/* Reference */}
      <div className="mt-8 rounded-lg border border-border-grey bg-pale-ice p-5 text-center">
        <p className="text-sm text-slate">Your reference number</p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-midnight-navy">
          {reference ?? state.reference}
        </p>
        <p className="mt-1 text-xs text-slate">Save this for your records.</p>
      </div>

      {/* What happens next */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-midnight-navy">
          What happens next?
        </h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              icon: <Mail size={18} aria-hidden="true" />,
              title: 'Confirmation email',
              body: `A confirmation has been sent to ${state.email}. Check your spam folder if it does not arrive within a few minutes.`,
            },
            {
              icon: <Clock size={18} aria-hidden="true" />,
              title: 'Team review',
              body: 'Our team will review your request and prepare payment and fulfilment details. We aim to respond within 1–2 business days.',
            },
            {
              icon: <HelpCircle size={18} aria-hidden="true" />,
              title: 'No payment taken yet',
              body: 'Nothing has been charged. Payment instructions will be sent separately after your request is reviewed and approved.',
            },
          ].map((step, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e6f4f5] text-scientific-teal">
                {step.icon}
              </div>
              <div>
                <p className="font-medium text-midnight-navy">{step.title}</p>
                <p className="mt-0.5 text-sm text-slate">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Important notice — payment deferred */}
      <div className="mt-8 rounded-lg border border-warning-amber/30 bg-[#fef9ec] p-4 text-sm text-graphite">
        <strong className="font-medium">Important:</strong> This is a request only — not a confirmed
        or paid order. Do not attempt to send payment until you receive instructions from our team.
        If you have questions, contact us at{' '}
        <a href="mailto:support@nuclara.com" className="text-scientific-teal">
          support@nuclara.com
        </a>
        .
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="primary" onClick={() => (window.location.href = '/shop')}>
          Continue shopping
        </Button>
        <Link to="/account/orders">
          <Button variant="secondary" className="w-full sm:w-auto">
            View my orders
          </Button>
        </Link>
      </div>
    </div>
  )
}
