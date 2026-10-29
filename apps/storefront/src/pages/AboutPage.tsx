import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, ShieldCheck, FileText, Users, Truck, Globe } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { Button } from '@/components/ui/Button'

export default function AboutPage() {
  useSeo({
    title: 'About Nuclara',
    description:
      'Nuclara is a research peptide supplier focused on transparency, compliance, and accurate documentation. Learn who we are, how we operate, and why researchers trust us.',
    canonicalPath: '/about',
  })

  return (
    <div>
      {/* ── Page hero ──────────────────────────────────────────────────────── */}
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-scientific-teal">
            About Us
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
            A research supplier built on rigour, not shortcuts.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Nuclara was founded to solve a specific problem: the research peptide market is
            fragmented, inconsistently documented, and riddled with compliance ambiguity.
            We built the supplier we wished existed.
          </p>
        </div>
      </section>

      {/* ── Mission ────────────────────────────────────────────────────────── */}
      <section className="border-b border-border-grey bg-cloud-white" aria-labelledby="mission-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">
                Our Mission
              </p>
              <h2 id="mission-heading" className="font-heading text-3xl font-bold text-midnight-navy sm:text-4xl">
                Precision peptides. Transparent supply.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate">
                Our mission is to make research-grade synthetic peptides accessible to qualified
                laboratories and researchers worldwide — with documentation that matches the
                quality of the science being done with them.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate">
                We believe the supply chain for research compounds should be as transparent as the
                research itself. Every product we supply comes with the actual data, not
                a generic spec sheet.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Products catalogued', value: '150+' },
                { label: 'Markets reviewed', value: '30+' },
                { label: 'Batches documented', value: '100%' },
                { label: 'Research-only supply', value: 'Always' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border-grey bg-pale-ice p-6 text-center"
                >
                  <p className="font-heading text-3xl font-bold text-scientific-teal">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border-grey bg-pale-ice" aria-labelledby="values-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">
              Our Values
            </p>
            <h2 id="values-heading" className="font-heading text-3xl font-bold text-midnight-navy sm:text-4xl">
              What guides every decision we make
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <FlaskConical size={22} aria-hidden="true" />,
                title: 'Scientific integrity',
                body: 'We only supply what we can document. Every peptide is accompanied by a certificate of analysis tied to the specific batch, not a generic product average.',
              },
              {
                icon: <ShieldCheck size={22} aria-hidden="true" />,
                title: 'Compliance first',
                body: 'We review every product against the regulatory status of each destination market before it is made available. No grey-area listings, no ambiguous access.',
              },
              {
                icon: <FileText size={22} aria-hidden="true" />,
                title: 'Radical transparency',
                body: 'Full product documentation, handling guidelines, and known limitations are published for every product. We do not hide inconvenient data.',
              },
              {
                icon: <Users size={22} aria-hidden="true" />,
                title: 'Researcher respect',
                body: 'Our customers are scientists. We communicate accordingly — no marketing fluff, no exaggerated claims, just accurate information delivered clearly.',
              },
              {
                icon: <Truck size={22} aria-hidden="true" />,
                title: 'Operational reliability',
                body: 'We manage our own warehouse and fulfilment. Real-time inventory, honest lead times, and direct visibility into every order from placement to delivery.',
              },
              {
                icon: <Globe size={22} aria-hidden="true" />,
                title: 'Responsible access',
                body: 'Research compounds should reach qualified researchers, not general consumers. Our compliance gates, verification checks, and market reviews exist to protect both.',
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-border-grey bg-cloud-white p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6f4f5] text-scientific-teal">
                  {value.icon}
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold text-midnight-navy">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="border-b border-border-grey bg-cloud-white" aria-labelledby="how-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">
              How It Works
            </p>
            <h2 id="how-heading" className="font-heading text-3xl font-bold text-midnight-navy sm:text-4xl">
              From catalogue to your laboratory
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate">
              Every step in our process is designed to ensure you receive exactly what you need,
              legally and accurately.
            </p>
          </div>
          <div className="relative">
            {/* Connecting line — desktop only */}
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-border-grey lg:block" aria-hidden="true" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {[
                {
                  step: '1',
                  title: 'Browse the catalogue',
                  body: 'Search and filter our catalogue by peptide class, research application, or compliance status for your market.',
                },
                {
                  step: '2',
                  title: 'Verify eligibility',
                  body: 'Each product page shows real-time compliance status for your destination market. Ineligible products are clearly marked before checkout.',
                },
                {
                  step: '3',
                  title: 'Submit your order request',
                  body: 'Place your order request with quantity and delivery details. No card processing — we confirm eligibility and invoice separately.',
                },
                {
                  step: '4',
                  title: 'Receive with documentation',
                  body: 'Your shipment arrives with a batch-specific certificate of analysis, handling guidelines, and full product documentation.',
                },
              ].map((item) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-scientific-teal bg-cloud-white font-heading text-xl font-bold text-scientific-teal">
                    {item.step}
                  </div>
                  <h3 className="mb-2 font-heading text-base font-semibold text-midnight-navy">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Compliance commitment ──────────────────────────────────────────── */}
      <section className="border-b border-border-grey bg-midnight-navy" aria-labelledby="compliance-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">
                Compliance Commitment
              </p>
              <h2 id="compliance-heading" className="font-heading text-3xl font-bold text-white sm:text-4xl">
                We take regulatory compliance seriously — so you don't have to second-guess us.
              </h2>
            </div>
            <div className="space-y-6">
              {[
                {
                  title: 'Per-market product review',
                  body: 'Every product on our catalogue is individually reviewed against the regulatory framework of each market we serve. We do not apply blanket approvals.',
                },
                {
                  title: 'Research-only positioning',
                  body: 'All products are supplied strictly for research and laboratory use. We make no therapeutic, health, or performance claims — and we actively enforce this.',
                },
                {
                  title: 'Qualifying criteria',
                  body: 'Accounts are reviewed against qualifying criteria before access to restricted products is granted. This protects both our customers and the integrity of the research supply channel.',
                },
              ].map((item) => (
                <div key={item.title} className="border-l-2 border-scientific-teal pl-5">
                  <h3 className="mb-1 font-heading text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="bg-pale-ice" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 id="cta-heading" className="font-heading text-3xl font-bold text-midnight-navy sm:text-4xl">
            Ready to explore the catalogue?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate">
            Browse our full range of research-grade synthetic peptides. Every product is
            documented, compliance-reviewed, and available to qualified researchers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => (window.location.href = '/shop')}
            >
              Browse catalogue
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded px-6 py-3 text-base font-medium text-midnight-navy no-underline transition-colors hover:text-scientific-teal"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      {/* ── Research notice ────────────────────────────────────────────────── */}
      <section className="border-t border-border-grey bg-cloud-white">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-slate">
            All products supplied by Nuclara are for{' '}
            <strong className="font-medium text-graphite">research and laboratory use only</strong>.
            Not intended for human or veterinary use. Availability varies by market.{' '}
            <Link to="/help" className="text-scientific-teal hover:underline">
              Learn more
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
