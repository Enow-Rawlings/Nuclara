import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Help', href: '/help' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const totalItems = useCartStore((s) => s.totalItems())

  return (
    <header className="sticky top-0 z-40 border-b border-border-grey bg-cloud-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline"
          aria-label="Nuclara — home"
        >
          <img
            src="/logo.png"
            alt="Nuclara logo"
            className="h-8 w-auto"
          />
          <span className="font-heading text-xl font-bold tracking-tight text-midnight-navy">
            Nuclara
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `text-body-md font-medium no-underline transition-colors hover:text-scientific-teal ${
                  isActive ? 'text-scientific-teal' : 'text-graphite'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/search"
            aria-label="Search products"
            className="rounded p-2 text-graphite no-underline transition-colors hover:bg-pale-ice hover:text-scientific-teal"
          >
            <Search size={20} aria-hidden="true" />
          </Link>
          <Link
            to="/account"
            aria-label="Account"
            className="rounded p-2 text-graphite no-underline transition-colors hover:bg-pale-ice hover:text-scientific-teal"
          >
            <User size={20} aria-hidden="true" />
          </Link>
          <Link
            to="/cart"
            aria-label={`Shopping cart${totalItems > 0 ? `, ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`}
            className="relative rounded p-2 text-graphite no-underline transition-colors hover:bg-pale-ice hover:text-scientific-teal"
          >
            <ShoppingCart size={20} aria-hidden="true" />
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-scientific-teal text-[10px] font-bold text-white"
              >
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 rounded p-2 text-graphite transition-colors hover:bg-pale-ice md:hidden"
          >
            {mobileOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t border-border-grey bg-cloud-white md:hidden"
        >
          <ul className="flex flex-col py-2" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-3 text-base font-medium no-underline transition-colors hover:bg-pale-ice ${
                      isActive ? 'text-scientific-teal' : 'text-graphite'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
