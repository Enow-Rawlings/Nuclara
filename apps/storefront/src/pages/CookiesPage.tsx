import { Link } from 'react-router-dom'
import { useSeo } from '@/hooks/useSeo'

export default function CookiesPage() {
  useSeo({
    title: 'Cookie Policy',
    description: 'Nuclara cookie policy — what cookies we use, why, and how to control them.',
    canonicalPath: '/cookies',
  })

  const lastUpdated = '1 October 2026'

  return (
    <div>
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-scientific-teal">Legal</p>
          <h1 className="font-heading text-4xl font-bold text-white">Cookie Policy</h1>
          <p className="mt-3 text-sm text-white/60">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-10 text-sm leading-relaxed text-slate">

          <section aria-labelledby="c1">
            <h2 id="c1" className="mb-3 font-heading text-xl font-bold text-midnight-navy">What are cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They
              allow the site to remember information about your visit — such as your login session
              or cart contents — and help us understand how the site is being used.
            </p>
          </section>

          <section aria-labelledby="c2">
            <h2 id="c2" className="mb-3 font-heading text-xl font-bold text-midnight-navy">Cookies we use</h2>

            <div className="space-y-6">
              {[
                {
                  category: 'Essential cookies',
                  required: true,
                  description: 'These cookies are necessary for the website to function. They enable core features such as authentication, session management, and security. You cannot opt out of essential cookies.',
                  examples: [
                    { name: 'sb-access-token', purpose: 'Supabase authentication session token', duration: 'Session' },
                    { name: 'sb-refresh-token', purpose: 'Supabase session refresh', duration: '1 year' },
                  ],
                },
                {
                  category: 'Functional cookies',
                  required: false,
                  description: 'These cookies remember your preferences and settings to improve your experience, such as your market region.',
                  examples: [
                    { name: 'nuclara-market', purpose: 'Stores your selected destination market', duration: '30 days' },
                    { name: 'nuclara-cart', purpose: 'Persists your cart between sessions', duration: '7 days' },
                  ],
                },
                {
                  category: 'Analytics cookies',
                  required: false,
                  description: 'These cookies help us understand how visitors interact with the site. Data is aggregated and anonymised. We use this to improve the site.',
                  examples: [
                    { name: '_ga, _gid', purpose: 'Google Analytics — usage statistics', duration: '2 years / 24 hours' },
                  ],
                },
              ].map((cat) => (
                <div key={cat.category} className="rounded-xl border border-border-grey bg-pale-ice p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="font-heading text-base font-semibold text-midnight-navy">{cat.category}</h3>
                    {cat.required ? (
                      <span className="rounded-full bg-midnight-navy px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Required</span>
                    ) : (
                      <span className="rounded-full bg-border-grey px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-graphite">Optional</span>
                    )}
                  </div>
                  <p className="mb-4 text-sm text-slate">{cat.description}</p>
                  <div className="overflow-hidden rounded-lg border border-border-grey">
                    <table className="w-full text-left text-xs" role="table">
                      <thead className="bg-cloud-white">
                        <tr>
                          <th className="px-3 py-2 font-semibold text-graphite">Cookie name</th>
                          <th className="px-3 py-2 font-semibold text-graphite">Purpose</th>
                          <th className="px-3 py-2 font-semibold text-graphite">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-grey bg-cloud-white/50">
                        {cat.examples.map((ex) => (
                          <tr key={ex.name}>
                            <td className="px-3 py-2 font-mono text-graphite">{ex.name}</td>
                            <td className="px-3 py-2">{ex.purpose}</td>
                            <td className="px-3 py-2">{ex.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="c3">
            <h2 id="c3" className="mb-3 font-heading text-xl font-bold text-midnight-navy">How to control cookies</h2>
            <p>
              You can control and delete cookies through your browser settings. Disabling cookies
              may affect site functionality — in particular, essential cookies are required for
              authentication and the cart to work correctly.
            </p>
            <p className="mt-3">
              Most browsers allow you to: view cookies currently stored, delete individual or all
              cookies, and block cookies from specific or all sites. Refer to your browser's help
              documentation for instructions.
            </p>
          </section>

          <section aria-labelledby="c4">
            <h2 id="c4" className="mb-3 font-heading text-xl font-bold text-midnight-navy">Third-party cookies</h2>
            <p>
              Some cookies are set by third-party services we use (such as analytics providers).
              These services operate under their own privacy policies. We do not control the
              cookies set by third parties.
            </p>
          </section>

          <p>
            For more information on how we handle personal data, see our{' '}
            <Link to="/privacy" className="font-medium text-scientific-teal hover:underline">Privacy Policy</Link>.
            Questions?{' '}
            <Link to="/contact" className="font-medium text-scientific-teal hover:underline">Contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
