import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, Lock } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { submitOrderRequest } from '@/services/orders'
import { formatPrice } from '@/services/products'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { useSeo } from '@/hooks/useSeo'

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
  contactName: z.string().min(1, 'Full name is required').max(200),
  contactEmail: z.string().email('Enter a valid email address').max(320),
  line1: z.string().min(1, 'Address line 1 is required').max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, 'City is required').max(100),
  region: z.string().max(100).optional(),
  postalCode: z.string().min(1, 'Postcode is required').max(20),
  country: z.string().length(2, 'Select a country'),
  notes: z.string().max(1000).optional(),
})

type FormValues = z.infer<typeof schema>

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label,
  id,
  error,
  required,
  children,
  hint,
}: {
  label: string
  id: string
  error?: string | undefined
  required?: boolean | undefined
  children: React.ReactNode
  hint?: string | undefined
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-graphite">
        {label}
        {required && <span className="ml-0.5 text-error-red" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-error-red">
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass = (error?: string) =>
  [
    'rounded border px-3 py-2 text-sm text-graphite placeholder-slate',
    'focus:outline-none focus:ring-2 focus:ring-scientific-teal focus:border-scientific-teal',
    error
      ? 'border-error-red bg-[#fde8e8]/30'
      : 'border-border-grey bg-cloud-white',
  ].join(' ')

// ─── Countries (minimal list — expand as markets are confirmed) ────────────────

const COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CA', name: 'Canada' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'DE', name: 'Germany' },
  { code: 'DK', name: 'Denmark' },
  { code: 'ES', name: 'Spain' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'PL', name: 'Poland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'US', name: 'United States' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderRequestPage() {
  useSeo({
    title: 'Order request',
    description: 'Submit a research peptide order request.',
    canonicalPath: '/order-request',
    noIndex: true,
  })
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const currency = useCartStore((s) => s.currency())
  const clearCart = useCartStore((s) => s.clearCart)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: '' },
  })

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Order request' }]} />
        <div className="mt-12 text-center">
          <p className="text-slate">Your cart is empty.</p>
          <Link to="/shop" className="mt-4 inline-block text-scientific-teal">
            Browse catalogue
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const result = await submitOrderRequest({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        contactName: values.contactName,
        contactEmail: values.contactEmail,
        shippingAddress: {
          line1: values.line1,
          ...(values.line2 ? { line2: values.line2 } : {}),
          city: values.city,
          ...(values.region ? { region: values.region } : {}),
          postalCode: values.postalCode,
          country: values.country,
        },
        marketCode: values.country === 'DE' ? 'DE'
          : values.country === 'AU' || values.country === 'NZ' ? 'AU'
          : values.country === 'CA' ? 'CA'
          : 'EU',
        ...(values.notes ? { notes: values.notes } : {}),
      })

      clearCart()
      navigate(`/order-confirmation/${result.reference}`, {
        state: {
          reference: result.reference,
          status: result.status,
          message: result.message,
          email: values.contactEmail,
        },
        replace: true,
      })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Something went wrong. Please try again.'
      setServerError(msg)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Order request' }]} />
      <h1 className="mt-4 font-heading text-3xl font-bold text-midnight-navy">Order request</h1>

      {/* No-payment notice */}
      <div className="mt-4 flex gap-3 rounded-lg border border-border-grey bg-pale-ice p-4 text-sm">
        <Lock size={16} className="mt-0.5 flex-shrink-0 text-scientific-teal" aria-hidden="true" />
        <p className="text-graphite">
          <strong className="font-medium">No payment is taken at this stage.</strong> Submitting
          this form sends a request to our team. We will contact you directly with payment and
          fulfilment details.
        </p>
      </div>

      {serverError && (
        <div role="alert" className="mt-4 flex gap-3 rounded-lg border border-error-red/30 bg-[#fde8e8] p-4 text-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-error-red" aria-hidden="true" />
          <p className="text-error-red">{serverError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 grid gap-8 lg:grid-cols-3"
      >
        {/* Form fields */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Contact */}
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="mb-4 font-heading text-lg font-semibold text-midnight-navy">
              Contact details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" id="contactName" error={errors.contactName?.message} required>
                <input
                  id="contactName"
                  type="text"
                  autoComplete="name"
                  aria-describedby={errors.contactName ? 'contactName-error' : undefined}
                  aria-invalid={!!errors.contactName}
                  className={inputClass(errors.contactName?.message)}
                  {...register('contactName')}
                />
              </Field>
              <Field label="Email address" id="contactEmail" error={errors.contactEmail?.message} required
                hint="Order confirmation will be sent to this address">
                <input
                  id="contactEmail"
                  type="email"
                  autoComplete="email"
                  aria-describedby={errors.contactEmail ? 'contactEmail-error' : undefined}
                  aria-invalid={!!errors.contactEmail}
                  className={inputClass(errors.contactEmail?.message)}
                  {...register('contactEmail')}
                />
              </Field>
            </div>
          </section>

          {/* Shipping address */}
          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="mb-4 font-heading text-lg font-semibold text-midnight-navy">
              Shipping address
            </h2>
            <div className="grid gap-4">
              <Field label="Address line 1" id="line1" error={errors.line1?.message} required>
                <input
                  id="line1"
                  type="text"
                  autoComplete="address-line1"
                  aria-invalid={!!errors.line1}
                  className={inputClass(errors.line1?.message)}
                  {...register('line1')}
                />
              </Field>
              <Field label="Address line 2" id="line2" error={errors.line2?.message}>
                <input
                  id="line2"
                  type="text"
                  autoComplete="address-line2"
                  className={inputClass()}
                  {...register('line2')}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" id="city" error={errors.city?.message} required>
                  <input
                    id="city"
                    type="text"
                    autoComplete="address-level2"
                    aria-invalid={!!errors.city}
                    className={inputClass(errors.city?.message)}
                    {...register('city')}
                  />
                </Field>
                <Field label="State / Region" id="region" error={errors.region?.message}>
                  <input
                    id="region"
                    type="text"
                    autoComplete="address-level1"
                    className={inputClass()}
                    {...register('region')}
                  />
                </Field>
                <Field label="Postcode / ZIP" id="postalCode" error={errors.postalCode?.message} required>
                  <input
                    id="postalCode"
                    type="text"
                    autoComplete="postal-code"
                    aria-invalid={!!errors.postalCode}
                    className={inputClass(errors.postalCode?.message)}
                    {...register('postalCode')}
                  />
                </Field>
                <Field label="Country" id="country" error={errors.country?.message} required>
                  <div className="relative">
                    <select
                      id="country"
                      autoComplete="country"
                      aria-invalid={!!errors.country}
                      className={[inputClass(errors.country?.message), 'w-full appearance-none pr-8'].join(' ')}
                      {...register('country')}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <Field label="Order notes (optional)" id="notes" error={errors.notes?.message}
              hint="Any specific instructions for this order">
              <textarea
                id="notes"
                rows={3}
                className={[inputClass(), 'resize-none'].join(' ')}
                {...register('notes')}
              />
            </Field>
          </section>
        </div>

        {/* Summary + submit */}
        <aside aria-label="Order summary">
          <div className="sticky top-24 rounded-lg border border-border-grey bg-cloud-white p-5">
            <h2 className="font-heading text-base font-semibold text-midnight-navy">Summary</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between gap-2">
                  <span className="flex-1 truncate">
                    {item.name} <span className="text-xs">×{item.quantity}</span>
                  </span>
                  <span className="tabular-nums">
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border-grey pt-3 text-base font-semibold text-midnight-navy">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal, currency)}</span>
            </div>
            <p className="mt-1 text-xs text-slate">
              Shipping &amp; taxes communicated separately.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="mt-5 w-full"
            >
              {isSubmitting ? 'Submitting…' : 'Submit order request'}
            </Button>

            <p className="mt-3 text-center text-xs text-slate">
              By submitting you agree to our{' '}
              <Link to="/terms" className="text-scientific-teal">terms</Link>.
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}
