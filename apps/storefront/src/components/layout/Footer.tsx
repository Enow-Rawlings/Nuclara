import { Link } from 'react-router-dom'

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'Search', href: '/search' },
  ],
  Support: [
    { label: 'Help Centre', href: '/help' },
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
  Company: [
    { label: 'About Nuclara', href: '/about' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border-grey bg-midnight-navy text-slate">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-pale-ice">
                {group}
              </h3>
              <ul className="space-y-2" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate no-underline transition-colors hover:text-pale-ice"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate/20 pt-8 sm:flex-row sm:items-center">
          <p className="font-heading text-base font-bold text-pale-ice">Nuclara</p>
          <p className="text-xs text-slate">
            &copy; {new Date().getFullYear()} Nuclara. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
