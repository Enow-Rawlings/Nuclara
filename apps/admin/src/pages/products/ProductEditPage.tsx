import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminProduct, updateProduct } from '@/services/products'
import { Badge, productStatusBadge, complianceStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { ImageUploader } from '@/components/forms/ImageUploader'

const PRODUCT_STATUSES = ['draft', 'pending_review', 'approved', 'published', 'archived', 'blocked']
const COMPLIANCE_STATUSES = ['not_submitted', 'pending_review', 'approved', 'rejected', 'expired', 'requires_resubmission']

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  type MediaItem = {
    id: string; cloudinary_url: string; cloudinary_public_id: string
    alt_text: string; display_order: number; width: number | null; height: number | null
  }
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => fetchAdminProduct(id!),
    enabled: Boolean(id),
  })

  // Seed local media state when product first loads
  const [mediaSeeded, setMediaSeeded] = useState(false)
  if (product && !mediaSeeded) {
    const raw = product.product_media ?? []
    setMediaItems(raw as MediaItem[])
    setMediaSeeded(true)
  }

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateProduct>[1]) =>
      updateProduct(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (err: unknown) => {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to update product.'
      )
    },
  })

  if (isLoading || !product) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const inputClass = 'rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal'

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/products" className="text-sm text-slate hover:text-scientific-teal">
          ← Products
        </Link>
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">{product.name}</h1>
        <Badge variant={productStatusBadge(product.status)}>{product.status.replace('_', ' ')}</Badge>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      {saved && (
        <div role="status" className="mb-4 flex gap-2 rounded border border-success-green/30 bg-[#e8f5f0] p-3 text-sm text-success-green">
          <CheckCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          Product updated successfully.
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Status controls — the compliance gate */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-1 font-heading text-base font-semibold text-midnight-navy">Publication status</h2>
          <p className="mb-4 text-xs text-slate">
            A product can only be published when compliance status is <strong>approved</strong>.
            Changing sensitive claims or destination rules requires re-review.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="status" className="text-sm font-medium text-graphite">Status</label>
              <select
                id="status"
                defaultValue={product.status}
                onChange={(e) => mutation.mutate({ status: e.target.value })}
                className={inputClass}
              >
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="complianceStatus" className="text-sm font-medium text-graphite">Compliance status</label>
              <select
                id="complianceStatus"
                defaultValue={product.compliance_status}
                onChange={(e) => mutation.mutate({ complianceStatus: e.target.value })}
                className={inputClass}
              >
                {COMPLIANCE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <div className="mt-1">
                <Badge variant={complianceStatusBadge(product.compliance_status)}>
                  {product.compliance_status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Core fields */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-midnight-navy">Product details</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              mutation.mutate({
                name: fd.get('name') as string,
                sku: fd.get('sku') as string,
                price: parseFloat(fd.get('price') as string),
                shortDescription: (fd.get('shortDescription') as string) || undefined,
                longDescription: (fd.get('longDescription') as string) || undefined,
                stockQuantity: parseInt(fd.get('stockQuantity') as string, 10),
                lowStockThreshold: parseInt(fd.get('lowStockThreshold') as string, 10),
                isVisible: fd.has('isVisible'),
              })
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-sm font-medium text-graphite">Name <span className="text-error-red">*</span></label>
                <input id="name" name="name" type="text" defaultValue={product.name} className={inputClass} required />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="sku" className="text-sm font-medium text-graphite">SKU <span className="text-error-red">*</span></label>
                <input id="sku" name="sku" type="text" defaultValue={product.sku} className={inputClass} required />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="price" className="text-sm font-medium text-graphite">Price <span className="text-error-red">*</span></label>
                <input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product.price} className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="stockQuantity" className="text-sm font-medium text-graphite">Stock</label>
                  <input id="stockQuantity" name="stockQuantity" type="number" min="0" defaultValue={product.stock_quantity} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="lowStockThreshold" className="text-sm font-medium text-graphite">Low stock at</label>
                  <input id="lowStockThreshold" name="lowStockThreshold" type="number" min="0" defaultValue={product.low_stock_threshold} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="shortDescription" className="text-sm font-medium text-graphite">Short description</label>
              <input id="shortDescription" name="shortDescription" type="text" defaultValue={product.short_description ?? ''} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="longDescription" className="text-sm font-medium text-graphite">Long description</label>
              <p className="text-xs text-slate">Approved content only. No dosage, treatment, or human-use claims.</p>
              <textarea id="longDescription" name="longDescription" rows={6} defaultValue={product.long_description ?? ''} className={[inputClass, 'resize-y'].join(' ')} />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-graphite">
              <input type="checkbox" name="isVisible" defaultChecked={product.is_visible} className="accent-scientific-teal" />
              Visible on storefront
            </label>
            <div>
              <Button type="submit" variant="primary" loading={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Internal notes */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-1 font-heading text-base font-semibold text-midnight-navy">Internal notes</h2>
          <p className="mb-3 text-xs text-slate">Admin-only. Never visible to customers or the public API.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              mutation.mutate({ internalNotes: fd.get('internalNotes') as string })
            }}
            className="flex flex-col gap-3"
          >
            <textarea
              name="internalNotes"
              rows={4}
              defaultValue={product.internal_notes ?? ''}
              className={[inputClass, 'resize-y w-full'].join(' ')}
            />
            <div>
              <Button type="submit" variant="secondary" size="sm" loading={mutation.isPending}>
                Save notes
              </Button>
            </div>
          </form>
        </div>

        {/* Images */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-1 font-heading text-base font-semibold text-midnight-navy">Images</h2>
          <p className="mb-4 text-xs text-slate">
            Upload client-approved product images only. Do not use stock images that misrepresent the product.
          </p>
          <ImageUploader
            productId={product.id}
            existingMedia={mediaItems}
            onUploaded={(media) => setMediaItems((prev) => [...prev, media as MediaItem])}
            onDeleted={(mediaId) => setMediaItems((prev) => prev.filter((m) => m.id !== mediaId))}
          />
        </div>

        {/* Meta */}
        <div className="rounded-lg border border-border-grey bg-pale-ice p-4 text-xs text-slate">
          <p>Created: {new Date(product.created_at).toLocaleString()}</p>
          <p>Last updated: {new Date(product.updated_at).toLocaleString()}</p>
          <p className="font-mono">ID: {product.id}</p>
        </div>
      </div>
    </div>
  )
}
