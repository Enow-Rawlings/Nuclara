import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'

export default function ReturnsPage() {
  useSeo({
    title: 'Returns & Cancellations',
    description: 'Nuclara returns, cancellations, and damaged goods policy for research peptide orders.',
    canonicalPath: '/returns',
  })

  return (
    <div>
      {/* ── Header ── */}
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">Returns</p>
          <h1 className="font-heading text-4xl font-bold text-white">Returns &amp; cancellations</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            Our policy for order cancellations, damaged goods, and returns.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10 text-sm leading-relaxed text-slate">

          <section aria-labelledby="nature-heading">
            <h2 id="nature-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">
              Nature of our products
            </h2>
            <p>
              Nuclara supplies synthetic peptides for research and laboratory use. Due to the
              specialist nature of these products — including specific storage requirements,
              batch traceability, and regulatory considerations — our returns policy is more
              limited than a standard retail policy. Please read this page carefully before placing
              an order.
            </p>
          </section>

          <section aria-labelledby="cancellations-heading">
            <h2 id="cancellations-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">
              Order cancellations
            </h2>
            <p>
              You may request a cancellation before your order has been dispatched. To cancel,
              contact us as soon as possible via{' '}
              <Link to="/contact" className="font-medium text-scientific-teal hover:underline">
                our contact page
              </Link>{' '}
              or the live chat, quoting your order reference.
            </p>
            <p className="mt-3">
              Once an order has been dispatched, it cannot be cancelled. Orders that have been
              prepared for dispatch (packaged, labelled, and allocated a tracking number) are
              considered dispatched for this purpose.
            </p>
          </section>

          <section aria-labelledby="damaged-heading">
            <h2 id="damaged-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">
              Damaged or incorrect goods
            </h2>
            <p>
              If your order arrives damaged, incomplete, or does not match what you ordered, please
              contact us within <strong className="font-medium text-graphite">5 business days</strong> of
              delivery. Include your order reference, a description of the issue, and photographic
              evidence where possible.
            </p>
            <p className="mt-3">
              We will arrange a replacement shipment or issue a credit at no additional cost.
              Replacements for cold-chain items are subject to availability and may require
              re-ordering from production.
            </p>
          </section>

          <section aria-labelledby="returns-heading">
            <h2 id="returns-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">
              Returns
            </h2>
            <p>
              Due to the regulated nature of synthetic peptides and the requirements of cold-chain
              integrity, we are generally unable to accept returns of opened or used products.
            </p>
            <p className="mt-3">
              Unopened returns may be considered in exceptional circumstances at our sole
              discretion. Any approved return must be arranged with our team before shipping
              product back to us. Unauthorised returns will not be accepted.
            </p>
            <p className="mt-3">
              Return shipping costs for non-defective goods are the responsibility of the buyer.
            </p>
          </section>

          <section aria-labelledby="quality-heading">
            <h2 id="quality-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">
              Quality disputes
            </h2>
            <p>
              If you believe a product does not meet the specification stated in the certificate of
              analysis, contact us with your batch number, observed results, and supporting data.
              We take quality disputes seriously and will investigate in conjunction with our
              quality assurance process.
            </p>
          </section>

          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-sm text-amber-800">
              All products are supplied for <strong>research use only</strong> and are not eligible
              for return on the basis of a change of intended use or regulatory status at the
              buyer's location.
            </p>
          </div>

          <p>
            To raise a returns or cancellation request:{' '}
            <Link to="/contact" className="font-medium text-scientific-teal hover:underline">
              contact our team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
