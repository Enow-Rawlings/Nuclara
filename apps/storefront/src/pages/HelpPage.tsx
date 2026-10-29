import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useSeo } from '@/hooks/useSeo'

const faqs: { question: string; answer: string }[] = [
  {
    question: 'Who can order from Nuclara?',
    answer:
      'Nuclara supplies research-grade peptides to qualified laboratories, research institutions, and professional researchers. Products are not available for consumer purchase. You may be asked to provide institutional affiliation or research credentials before your order is processed.',
  },
  {
    question: 'How do I know if a product is available in my country?',
    answer:
      'Each product page displays its compliance status for your destination market. Products that are not cleared for your region are marked as unavailable and cannot be added to an order for that address. If you believe a status is incorrect, contact our team.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'Nuclara currently processes orders by invoice. After your order request is submitted and reviewed, we will send a proforma invoice. Payment is accepted by bank transfer. Card payment is not available at this time.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Standard international delivery takes 3–7 business days after dispatch. Express delivery (1–3 business days) is available for most regions. Processing takes 1–2 business days before dispatch. See our Shipping page for full details.',
  },
  {
    question: 'Do you offer cold-chain shipping?',
    answer:
      'Yes. Products that require refrigerated or frozen storage are shipped with appropriate cold-chain packaging. Cold-chain shipments are dispatched Monday to Wednesday only to avoid weekend delays. This is noted on each relevant product page.',
  },
  {
    question: 'Can I cancel or return an order?',
    answer:
      'Cancellations can be requested before dispatch. Due to the specialist nature of research peptides, returns of opened products are generally not accepted. Damaged or incorrect goods must be reported within 5 business days of delivery. See our Returns page for the full policy.',
  },
  {
    question: 'What documentation comes with my order?',
    answer:
      'Every shipment includes a batch-specific certificate of analysis, a packing list, and relevant handling guidelines. Additional regulatory documentation can be requested at the time of ordering.',
  },
  {
    question: 'How do I track my order?',
    answer:
      'A dispatch confirmation email with tracking information is sent when your order leaves our warehouse. You can also view order status in your account under Order History.',
  },
  {
    question: 'I have a question about a specific peptide. Who should I contact?',
    answer:
      'Use the contact form or live chat to reach our team. Please include the product name or SKU and a description of your question. Our support team has scientific knowledge and can address product, handling, and documentation queries.',
  },
  {
    question: 'Are your products for human use?',
    answer:
      'No. All products supplied by Nuclara are strictly for research and laboratory use only. They are not intended for human or veterinary administration. No therapeutic, health, or performance claims are made.',
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border-grey last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-heading text-sm font-semibold text-midnight-navy">{question}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`flex-shrink-0 text-slate transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-slate">{answer}</p>
      )}
    </div>
  )
}

export default function HelpPage() {
  useSeo({
    title: 'Help Centre',
    description: 'Answers to common questions about ordering, shipping, compliance, and products at Nuclara.',
    canonicalPath: '/help',
  })

  return (
    <div>
      {/* ── Header ── */}
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">Help Centre</p>
          <h1 className="font-heading text-4xl font-bold text-white">How can we help?</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            Answers to the most common questions about ordering, shipping, compliance, and products.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ── Quick links ── */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Shipping information', href: '/shipping' },
            { label: 'Returns & cancellations', href: '/returns' },
            { label: 'Contact support', href: '/contact' },
          ].map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-lg border border-border-grey bg-pale-ice px-4 py-3 text-center text-sm font-medium text-midnight-navy no-underline transition-colors hover:border-scientific-teal hover:text-scientific-teal"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── FAQ ── */}
        <h2 className="mb-6 font-heading text-2xl font-bold text-midnight-navy">
          Frequently asked questions
        </h2>
        <div className="rounded-xl border border-border-grey bg-cloud-white px-6">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} {...faq} />
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-border-grey bg-pale-ice p-6 text-center">
          <p className="text-sm text-slate">Didn't find what you were looking for?</p>
          <Link
            to="/contact"
            className="mt-2 inline-block text-sm font-medium text-scientific-teal no-underline hover:underline"
          >
            Contact our support team →
          </Link>
        </div>
      </div>
    </div>
  )
}
