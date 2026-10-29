import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/services/products'
import { Button } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { useSeo } from '@/hooks/useSeo'

export default function CartPage() {
  useSeo({
    title: 'Cart',
    description: 'Review your research peptide order before submitting a request.',
    canonicalPath: '/cart',
    noIndex: true,
  })
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const subtotal = useCartStore((s) => s.subtotal())
  const currency = useCartStore((s) => s.currency())
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Cart' }]} />
        <div className="mt-12 flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pale-ice text-border-grey">
            <ShoppingCart size={36} aria-hidden="true" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-midnight-navy">Your cart is empty</h1>
          <p className="max-w-sm text-slate">
            Browse our research peptide catalogue to add products.
          </p>
          <Button variant="primary" onClick={() => navigate('/shop')}>
            Browse catalogue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Cart' }]} />
      <h1 className="mt-4 font-heading text-3xl font-bold text-midnight-navy">
        Cart
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        {/* Line items */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-border-grey" aria-label="Cart items">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 py-6">
                {/* Thumbnail */}
                <Link
                  to={`/product/${item.slug}`}
                  className="flex-shrink-0"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <div className="h-20 w-20 overflow-hidden rounded-lg bg-pale-ice sm:h-24 sm:w-24">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-border-grey">
                        <Package size={24} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    to={`/product/${item.slug}`}
                    className="font-heading text-sm font-semibold text-midnight-navy no-underline hover:text-scientific-teal sm:text-base"
                  >
                    {item.name}
                  </Link>
                  <p className="font-mono text-xs text-slate">{item.sku}</p>
                  <p className="text-xs text-slate">Research use only</p>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Quantity stepper */}
                    <div
                      className="flex items-center gap-1 rounded border border-border-grey"
                      role="group"
                      aria-label={`Quantity for ${item.name}`}
                    >
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-l text-slate transition-colors hover:bg-pale-ice hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} aria-hidden="true" />
                      </button>
                      <span
                        className="w-8 text-center text-sm font-medium tabular-nums text-graphite"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-r text-slate transition-colors hover:bg-pale-ice hover:text-midnight-navy disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={item.quantity >= item.stockQuantity}
                      >
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Line total */}
                      <span className="font-heading text-base font-bold text-midnight-navy">
                        {formatPrice(item.price * item.quantity, item.currency)}
                      </span>

                      {/* Remove */}
                      <button
                        type="button"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => removeItem(item.productId)}
                        className="rounded p-1 text-slate transition-colors hover:bg-[#fde8e8] hover:text-error-red"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Order summary */}
        <aside aria-label="Order summary">
          <div className="sticky top-24 rounded-lg border border-border-grey bg-cloud-white p-6">
            <h2 className="font-heading text-lg font-semibold text-midnight-navy">
              Order summary
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-2 text-slate">
                  <dt className="flex-1 truncate">
                    {item.name}{' '}
                    <span className="text-xs">× {item.quantity}</span>
                  </dt>
                  <dd className="tabular-nums">
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </dd>
                </div>
              ))}

              <div className="border-t border-border-grey pt-3">
                <div className="flex justify-between text-base font-semibold text-midnight-navy">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal, currency)}</dd>
                </div>
                <p className="mt-1 text-xs text-slate">
                  Shipping and any applicable taxes will be communicated separately.
                  No payment has been taken.
                </p>
              </div>
            </dl>

            <Button
              variant="primary"
              size="lg"
              className="mt-6 w-full"
              onClick={() => navigate('/order-request')}
            >
              Submit order request
              <ArrowRight size={16} aria-hidden="true" />
            </Button>

            <p className="mt-3 text-center text-xs text-slate">
              Submitting does not charge your card.{' '}
              <Link to="/help" className="text-scientific-teal">
                How does this work?
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
