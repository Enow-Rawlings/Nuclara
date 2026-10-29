import { Link } from 'react-router-dom'
import { useSeo } from '@/hooks/useSeo'

export default function PrivacyPage() {
  useSeo({
    title: 'Privacy Policy',
    description: 'Nuclara privacy notice — how we collect, use, and protect your personal data.',
    canonicalPath: '/privacy',
  })

  const lastUpdated = '1 October 2026'

  return (
    <div>
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">Legal</p>
          <h1 className="font-heading text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-3 text-sm text-white/60">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10 text-sm leading-relaxed text-slate">

          <section aria-labelledby="intro-heading">
            <h2 id="intro-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">1. Who we are</h2>
            <p>
              Nuclara ("we", "us", "our") is a research peptide supplier. This Privacy Policy
              explains how we collect, use, store, and protect your personal data when you use
              our website at <strong className="font-medium text-graphite">nuclara.com</strong> and
              when you place orders with us.
            </p>
            <p className="mt-3">
              If you have questions about this policy or how we handle your data, contact us at{' '}
              <a href="mailto:privacy@nuclara.com" className="font-medium text-scientific-teal hover:underline">
                privacy@nuclara.com
              </a>.
            </p>
          </section>

          <section aria-labelledby="collect-heading">
            <h2 id="collect-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">2. Data we collect</h2>
            <p className="mb-3">We collect personal data in the following ways:</p>
            <ul className="space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
              <li><strong className="font-medium text-graphite">Account registration:</strong> name, email address, institutional affiliation.</li>
              <li><strong className="font-medium text-graphite">Order requests:</strong> name, delivery address, contact details, product selections.</li>
              <li><strong className="font-medium text-graphite">Communications:</strong> messages you send via the contact form or live chat.</li>
              <li><strong className="font-medium text-graphite">Usage data:</strong> pages visited, browser type, IP address, and session information collected automatically via cookies.</li>
            </ul>
            <p className="mt-3">
              We do not collect payment card data. Orders are invoiced and paid by bank transfer.
            </p>
          </section>

          <section aria-labelledby="use-heading">
            <h2 id="use-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">3. How we use your data</h2>
            <ul className="space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
              <li>To process and fulfil your order requests.</li>
              <li>To verify eligibility and compliance for regulated products.</li>
              <li>To communicate order status, tracking, and support responses.</li>
              <li>To maintain your account and order history.</li>
              <li>To comply with legal and regulatory obligations.</li>
              <li>To improve our website and services using aggregated, anonymised analytics.</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal data with third parties for marketing
              purposes.
            </p>
          </section>

          <section aria-labelledby="basis-heading">
            <h2 id="basis-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">4. Legal basis for processing</h2>
            <p>We process your personal data under the following legal bases (UK/EU GDPR):</p>
            <ul className="mt-3 space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
              <li><strong className="font-medium text-graphite">Contract:</strong> processing necessary to fulfil your order.</li>
              <li><strong className="font-medium text-graphite">Legal obligation:</strong> compliance records, regulatory requirements.</li>
              <li><strong className="font-medium text-graphite">Legitimate interests:</strong> fraud prevention, security, site improvement.</li>
              <li><strong className="font-medium text-graphite">Consent:</strong> for optional cookies and marketing communications, where applicable.</li>
            </ul>
          </section>

          <section aria-labelledby="retention-heading">
            <h2 id="retention-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">5. Data retention</h2>
            <p>
              We retain personal data for as long as necessary to fulfil the purposes set out in
              this policy and to comply with legal obligations. Order records are retained for a
              minimum of 7 years for accounting and regulatory purposes. Account data is retained
              for the lifetime of your account and for 2 years after closure.
            </p>
          </section>

          <section aria-labelledby="thirdparty-heading">
            <h2 id="thirdparty-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">6. Third-party services</h2>
            <p>We use the following third-party services to operate our platform:</p>
            <ul className="mt-3 space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
              <li><strong className="font-medium text-graphite">Supabase:</strong> database and authentication (EU-hosted).</li>
              <li><strong className="font-medium text-graphite">Cloudinary:</strong> image hosting.</li>
              <li><strong className="font-medium text-graphite">Resend:</strong> transactional email delivery.</li>
              <li><strong className="font-medium text-graphite">Vercel:</strong> website hosting.</li>
            </ul>
            <p className="mt-3">
              Each service operates under its own privacy and data processing agreements. We have
              data processing agreements in place where required by law.
            </p>
          </section>

          <section aria-labelledby="rights-heading">
            <h2 id="rights-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">7. Your rights</h2>
            <p>Under UK and EU data protection law, you have the right to:</p>
            <ul className="mt-3 space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
              <li>Access the personal data we hold about you.</li>
              <li>Rectify inaccurate or incomplete data.</li>
              <li>Request erasure of your data (subject to legal retention obligations).</li>
              <li>Object to or restrict certain processing.</li>
              <li>Data portability where processing is based on consent or contract.</li>
              <li>Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact{' '}
              <a href="mailto:privacy@nuclara.com" className="font-medium text-scientific-teal hover:underline">
                privacy@nuclara.com
              </a>
              . We will respond within 30 days. You also have the right to lodge a complaint with
              your national data protection authority.
            </p>
          </section>

          <section aria-labelledby="cookies-privacy-heading">
            <h2 id="cookies-privacy-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">8. Cookies</h2>
            <p>
              We use cookies and similar technologies to operate the site and analyse usage. See
              our{' '}
              <Link to="/cookies" className="font-medium text-scientific-teal hover:underline">
                Cookie Policy
              </Link>{' '}
              for details and controls.
            </p>
          </section>

          <section aria-labelledby="changes-heading">
            <h2 id="changes-heading" className="mb-3 font-heading text-xl font-bold text-midnight-navy">9. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with a revised "last updated" date. We will notify registered users of material
              changes by email.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
