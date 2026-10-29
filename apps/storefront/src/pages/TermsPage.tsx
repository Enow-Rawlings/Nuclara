import { Link } from 'react-router-dom'
import { useSeo } from '@/hooks/useSeo'

export default function TermsPage() {
  useSeo({
    title: 'Terms of Service',
    description: 'Nuclara terms of service — conditions governing use of our website and purchase of research peptides.',
    canonicalPath: '/terms',
  })

  const lastUpdated = '1 October 2026'

  return (
    <div>
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">Legal</p>
          <h1 className="font-heading text-4xl font-bold text-white">Terms of Service</h1>
          <p className="mt-3 text-sm text-white/60">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10 text-sm leading-relaxed text-slate">

          <section aria-labelledby="t1">
            <h2 id="t1" className="mb-3 font-heading text-xl font-bold text-midnight-navy">1. Acceptance of terms</h2>
            <p>
              By accessing or using the Nuclara website (<strong className="font-medium text-graphite">nuclara.com</strong>)
              or placing an order with us, you agree to be bound by these Terms of Service and our{' '}
              <Link to="/privacy" className="font-medium text-scientific-teal hover:underline">Privacy Policy</Link>.
              If you do not agree, please do not use this site.
            </p>
          </section>

          <section aria-labelledby="t2">
            <h2 id="t2" className="mb-3 font-heading text-xl font-bold text-midnight-navy">2. Eligibility</h2>
            <p>
              Nuclara products are supplied exclusively for research and laboratory use by qualified
              professionals. By placing an order, you confirm that:
            </p>
            <ul className="mt-3 space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
              <li>You are a professional researcher, scientist, or authorised representative of a research institution.</li>
              <li>The products will be used solely for lawful research or laboratory purposes.</li>
              <li>You are not purchasing products for human, veterinary, or consumer use.</li>
              <li>You have verified that ordering and receiving the products is lawful in your jurisdiction.</li>
            </ul>
          </section>

          <section aria-labelledby="t3">
            <h2 id="t3" className="mb-3 font-heading text-xl font-bold text-midnight-navy">3. Products and compliance</h2>
            <p>
              All products are subject to compliance review per destination market. Availability
              displayed on the site reflects our current assessment and may change. We reserve the
              right to decline any order that we believe may breach applicable regulations or our
              eligibility requirements.
            </p>
            <p className="mt-3">
              Product specifications, including purity and composition, are as stated in the
              batch-specific certificate of analysis supplied with each order. We make no
              representations beyond the documented specification.
            </p>
          </section>

          <section aria-labelledby="t4">
            <h2 id="t4" className="mb-3 font-heading text-xl font-bold text-midnight-navy">4. Orders and payment</h2>
            <p>
              Orders are submitted as requests and are confirmed only upon our written acceptance.
              We reserve the right to refuse or cancel any order at any stage. Payment is due
              upon receipt of our proforma invoice. Goods remain our property until payment is
              received in full.
            </p>
          </section>

          <section aria-labelledby="t5">
            <h2 id="t5" className="mb-3 font-heading text-xl font-bold text-midnight-navy">5. Pricing</h2>
            <p>
              All prices are displayed exclusive of VAT and shipping unless otherwise stated.
              Prices are subject to change without notice. The price applicable to your order is
              the price confirmed in your order acceptance.
            </p>
          </section>

          <section aria-labelledby="t6">
            <h2 id="t6" className="mb-3 font-heading text-xl font-bold text-midnight-navy">6. Shipping and delivery</h2>
            <p>
              Delivery terms are as set out in our{' '}
              <Link to="/shipping" className="font-medium text-scientific-teal hover:underline">Shipping Policy</Link>.
              Risk in goods passes to the buyer upon dispatch. We are not liable for delays caused
              by customs, carrier issues, or circumstances beyond our control.
            </p>
          </section>

          <section aria-labelledby="t7">
            <h2 id="t7" className="mb-3 font-heading text-xl font-bold text-midnight-navy">7. Returns and cancellations</h2>
            <p>
              Returns and cancellations are governed by our{' '}
              <Link to="/returns" className="font-medium text-scientific-teal hover:underline">Returns Policy</Link>.
            </p>
          </section>

          <section aria-labelledby="t8">
            <h2 id="t8" className="mb-3 font-heading text-xl font-bold text-midnight-navy">8. Intellectual property</h2>
            <p>
              All content on this website — including text, images, data, and design — is the
              property of Nuclara or its licensors. You may not reproduce, distribute, or create
              derivative works without our prior written consent.
            </p>
          </section>

          <section aria-labelledby="t9">
            <h2 id="t9" className="mb-3 font-heading text-xl font-bold text-midnight-navy">9. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, Nuclara shall not be liable for any
              indirect, incidental, or consequential loss arising from the use of our products or
              website. Our total liability in connection with any order shall not exceed the value
              of that order.
            </p>
            <p className="mt-3">
              Products are supplied for research use only. We make no warranty regarding
              fitness for any particular research purpose beyond the documented specification.
            </p>
          </section>

          <section aria-labelledby="t10">
            <h2 id="t10" className="mb-3 font-heading text-xl font-bold text-midnight-navy">10. Governing law</h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes shall be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section aria-labelledby="t11">
            <h2 id="t11" className="mb-3 font-heading text-xl font-bold text-midnight-navy">11. Changes to these terms</h2>
            <p>
              We may update these Terms of Service at any time. Continued use of the site
              following notification of changes constitutes acceptance. The current version is
              always available at this URL.
            </p>
          </section>

          <p>
            Questions about these terms?{' '}
            <Link to="/contact" className="font-medium text-scientific-teal hover:underline">Contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
