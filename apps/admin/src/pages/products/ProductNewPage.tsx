import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createProduct } from '@/services/products'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Required').max(300),
  sku: z.string().min(1, 'Required').max(100),
  price: z.coerce.number().positive('Must be positive'),
  currency: z.string().length(3),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().max(10000).optional(),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  isVisible: z.boolean(),
  internalNotes: z.string().max(2000).optional(),
})
type FormValues = z.infer<typeof schema>

function Field({ label, id, error, required, children }: {
  label: string; id: string; error?: string | undefined; required?: boolean | undefined; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-graphite">
        {label}{required && <span className="ml-0.5 text-error-red" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-error-red">{error}</p>}
    </div>
  )
}

const inputClass = (err?: string) =>
  `rounded border px-3 py-2 text-sm text-graphite focus:outline-none focus:ring-1 focus:ring-scientific-teal focus:border-scientific-teal ${err ? 'border-error-red' : 'border-border-grey bg-cloud-white'}`

export default function ProductNewPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'EUR', stockQuantity: 0, lowStockThreshold: 5, isVisible: false },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const product = await createProduct({
        name: values.name,
        sku: values.sku,
        price: values.price,
        currency: values.currency,
        stockQuantity: values.stockQuantity,
        lowStockThreshold: values.lowStockThreshold,
        isVisible: values.isVisible,
        ...(values.shortDescription ? { shortDescription: values.shortDescription } : {}),
        ...(values.longDescription ? { longDescription: values.longDescription } : {}),
        ...(values.internalNotes ? { internalNotes: values.internalNotes } : {}),
      })
      navigate(`/products/${product.id}`)
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to create product.'
      )
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/products" className="text-sm text-slate hover:text-scientific-teal">
          ← Products
        </Link>
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">New product</h1>
      </div>

      {serverError && (
        <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-midnight-navy">Basic information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name" id="name" error={errors.name?.message} required>
              <input id="name" type="text" className={inputClass(errors.name?.message)} {...register('name')} />
            </Field>
            <Field label="SKU" id="sku" error={errors.sku?.message} required>
              <input id="sku" type="text" className={inputClass(errors.sku?.message)} {...register('sku')} />
            </Field>
            <Field label="Price" id="price" error={errors.price?.message} required>
              <input id="price" type="number" step="0.01" min="0" className={inputClass(errors.price?.message)} {...register('price')} />
            </Field>
            <Field label="Currency" id="currency" error={errors.currency?.message} required>
              <select id="currency" className={inputClass(errors.currency?.message)} {...register('currency')}>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="USD">USD — US Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
                <option value="CAD">CAD — Canadian Dollar</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-1 font-heading text-base font-semibold text-midnight-navy">Descriptions</h2>
          <p className="mb-4 text-xs text-slate">Approved, client-reviewed content only. No dosage, treatment, or human-use claims.</p>
          <div className="flex flex-col gap-4">
            <Field label="Short description" id="shortDescription" error={errors.shortDescription?.message}>
              <input id="shortDescription" type="text" className={inputClass()} {...register('shortDescription')} />
            </Field>
            <Field label="Long description" id="longDescription" error={errors.longDescription?.message}>
              <textarea id="longDescription" rows={6} className={[inputClass(), 'resize-y'].join(' ')} {...register('longDescription')} />
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-midnight-navy">Inventory</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Stock quantity" id="stockQuantity" error={errors.stockQuantity?.message} required>
              <input id="stockQuantity" type="number" min="0" className={inputClass(errors.stockQuantity?.message)} {...register('stockQuantity')} />
            </Field>
            <Field label="Low stock threshold" id="lowStockThreshold" error={errors.lowStockThreshold?.message} required>
              <input id="lowStockThreshold" type="number" min="0" className={inputClass(errors.lowStockThreshold?.message)} {...register('lowStockThreshold')} />
            </Field>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-graphite">
            <input type="checkbox" className="accent-scientific-teal" {...register('isVisible')} />
            Visible on storefront
          </label>
        </div>

        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-1 font-heading text-base font-semibold text-midnight-navy">Internal notes</h2>
          <p className="mb-3 text-xs text-slate">Admin-only. Never exposed to customers or the public API.</p>
          <Field label="Internal notes" id="internalNotes" error={errors.internalNotes?.message}>
            <textarea id="internalNotes" rows={3} className={[inputClass(), 'resize-y'].join(' ')} {...register('internalNotes')} />
          </Field>
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create product'}
          </Button>
          <Link to="/products">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
