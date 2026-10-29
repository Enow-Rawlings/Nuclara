import { Link } from 'react-router-dom'
import { useSeo } from '@/hooks/useSeo'

export default function AccessibilityPage() {
  useSeo({
    title: 'Accessibility',
    description: 'Nuclara accessibility statement — our commitment to inclusive design and how to report issues.',
    canonicalPath: '/accessibility',
  })

  const lastUpdated = '1 October 2026'

  return (
    <div>
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">Accessibility</p>
          <h1 className="font-heading text-4xl font-bold text-white">Accessibility statement</h1>
          <p className="mt-3 text-sm text-white/60">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10 text-sm leading-relaxed text-slate">

          <section aria-labelledby="a1">
            <h2 id="a1" className="mb-3 font-heading text-xl font-bold text-midnight-navy">Our commitment</h2>
            <p>
              Nuclara is committed to making our website accessible to all users, including
              those with disabilities. We aim to meet the{' '}
              <strong className="font-medium text-graphite">Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>{' '}
              as a minimum standard across our website.
            </p>
          </section>

          <section aria-labelledby="a2">
            <h2 id="a2" className="mb-3 font-heading text-xl font-bold text-midnight-navy">What we've done</h2>
            <ul className="space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
              <li>Semantic HTML throughout to support screen readers and assistive technology.</li>
              <li>ARIA labels on interactive elements, icons, and navigation landmarks.</li>
              <li>Keyboard navigation support across all interactive components.</li>
              <li>Sufficient colour contrast ratios for text and UI elements.</li>
              <li>Alt text on all meaningful images.</li>
              <li>Responsive layout that works across screen sizes and orientations.</li>
              <li>Focus indicators visible on all focusable elements.</li>
              <li>Forms with properly associated labels and error messages.</li>
            </ul>
          </section>

          <section aria-labelledby="a3">
            <h2 id="a3" className="mb-3 font-heading text-xl font-bold text-midnight-navy">Known limitations</h2>
            <p>
              While we work to meet WCAG 2.1 AA, there may be areas of the site that do not yet
              fully meet this standard, particularly in areas under active development. We are
              committed to addressing any identified issues promptly.
            </p>
            <p className="mt-3">
              Full accessibility compliance requires testing with real users and assistive
              technologies. We conduct ongoing reviews and welcome feedback from users who
              experience barriers.
            </p>
          </section>

          <section aria-labelledby="a4">
            <h2 id="a4" className="mb-3 font-heading text-xl font-bold text-midnight-navy">Assistive technology compatibility</h2>
            <p>
              Our website is designed to be compatible with the following assistive technologies:
            </p>
            <ul className="mt-3 space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
              <li>Screen readers including NVDA, JAWS, and VoiceOver.</li>
              <li>Keyboard-only navigation.</li>
              <li>Browser zoom up to 200% without loss of content or functionality.</li>
              <li>High-contrast browser modes.</li>
            </ul>
          </section>

          <section aria-labelledby="a5">
            <h2 id="a5" className="mb-3 font-heading text-xl font-bold text-midnight-navy">Reporting accessibility issues</h2>
            <p>
              If you experience an accessibility barrier on our site, please let us know. We take
              all reports seriously and aim to respond within 5 business days.
            </p>
            <p className="mt-3">
              Contact us via our{' '}
              <Link to="/contact" className="font-medium text-scientific-teal hover:underline">contact page</Link>{' '}
              or email{' '}
              <a href="mailto:accessibility@nuclara.com" className="font-medium text-scientific-teal hover:underline">
                accessibility@nuclara.com
              </a>
              . Please include:
            </p>
            <ul className="mt-3 space-y-2 pl-5" style={{ listStyleType: 'disc' }}>
              <li>The URL of the page where you encountered the issue.</li>
              <li>A description of what you were trying to do and what happened.</li>
              <li>The assistive technology or browser you were using, if applicable.</li>
            </ul>
          </section>

          <section aria-labelledby="a6">
            <h2 id="a6" className="mb-3 font-heading text-xl font-bold text-midnight-navy">Enforcement</h2>
            <p>
              If you are not satisfied with our response to an accessibility issue, you may
              contact the relevant enforcement body in your country. In the UK, this is the
              Equality and Human Rights Commission (EHRC).
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
