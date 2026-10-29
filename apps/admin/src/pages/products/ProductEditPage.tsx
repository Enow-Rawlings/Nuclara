import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminProduct, updateProduct } from '@/services/products'
import { Badge, productStatusBadge, complianceStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { ImageUploader } from '@/components/forms/ImageUploader'
import { AiGenerateButton } from '@/components/ui/AiGenerateButton'

const PRODUCT_STATUSES = ['draft', 'pending_review', 'approved', 'published', 'archived', 'blocked']
const COMPLIANCE_STATUSES = ['not_submitted', 'pending_review', 'approved', 'rejected', 'expired', 'requires_resubmission']

type MediaItem = {
  id: string; cloudinary_url: string; cloudinary_public_id: string
  alt_text: string; display_order: number; width: number | null; height: number | null
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [mediaSeeded, setMediaSeeded] = useState(false)

  // Controlled state for AI-editable fields
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [stockQty, setStockQty] = useState('')
  const [lowStock, setLowStock] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [shortDesc, setShortDesc] = useState('')
  const [longDesc, setLongDesc] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [fieldsSeeded, setFieldsSeeded] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => fetchAdminProduct(id!),
    enabled: Boolean(id),
  })

  // Seed state once on first load
  if (product && !fieldsSeeded) {
    setName(product.name)
    setSku(product.sku)
    setPrice(String(product.price))
    setStockQty(String(product.stock_quantity))
    setLowStock(String(product.low_stock_threshold))
    setIsVisible(product.is_visible)
    setShortDesc(product.short_description ?? '')
    setLongDesc(product.long_description ?? '')
    setInternalNotes(product.internal_notes ?? '')
    setFieldsSeeded(true)
  }
  if (product && !mediaSeeded) {
    setMediaItems((product.product_media ?? []) as MediaItem[])
    setMediaSeeded(true)
  }

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateProduct>[1]) => updateProduct(id!, payload),
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
  const aiCtx = { name, sku, shortDescription: shortDesc, longDescription: longDesc }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/products" className="text-sm text-slate hover:text-scientific-teal">← Products</Link>
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">{product.name}</h1>
        <Badge variant={productStatusBadge(product.status)}>{product.status.replace('_', ' ')}</Badge>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{error}
        </div>
      )}
      {saved && (
        <div role="status" className="mb-4 flex gap-2 rounded border border-success-green/30 bg-[#e8f5f0] p-3 text-sm text-success-green">
          <CheckCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          Product updated successfully.
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Status controls */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-1 font-heading text-base font-semibold text-midnight-navy">Publication status</h2>
          <p className="mb-4 text-xs text-slate">A product can only be published when compliance status is <strong>approved</strong>.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="status" className="text-sm font-medium text-graphite">Status</label>
              <select id="status" defaultValue={product.status} onChange={(e) => mutation.mutate({ status: e.target.value })} className={inputClass}>
                {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="complianceStatus" className="text-sm font-medium text-graphite">Compliance status</label>
              <select id="complianceStatus" defaultValue={product.compliance_status} onChange={(e) => mutation.mutate({ complianceStatus: e.target.value })} className={inputClass}>
                {COMPLIANCE_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <Badge variant={complianceStatusBadge(product.compliance_status)} className="mt-1 self-start">
                {product.compliance_status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Core fields */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-midnight-navy">Product details</h2>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-sm font-medium text-graphite">Name <span className="text-error-red">*</span></label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="sku" className="text-sm font-medium text-graphite">SKU <span className="text-error-red">*</span></label>
                <input id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} required />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="price" className="text-sm font-medium text-graphite">Price <span className="text-error-red">*</span></label>
                <input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="stockQty" className="text-sm font-medium text-graphite">Stock</label>
                  <input id="stockQty" type="number" min="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="lowStock" className="text-sm font-medium text-graphite">Low stock at</label>
                  <input id="lowStock" type="number" min="0" value={lowStock} onChange={(e) => setLowStock(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Short description */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="shortDesc" className="text-sm font-medium text-graphite">Short description</label>
                <AiGenerateButton
                  type="product_short_description"
                  context={{ ...aiCtx, existing: shortDesc }}
                  onGenerated={setShortDesc}
                  label="AI Generate"
                />
              </div>
              <input id="shortDesc" type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className={inputClass} />
              <p className="text-xs text-slate">{shortDesc.length}/500 characters</p>
            </div>

            {/* Long description */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <label htmlFor="longDesc" className="text-sm font-medium text-graphite">Long description</label>
                  <p className="text-xs text-slate">Approved content only. No dosage, treatment, or human-use claims.</p>
                </div>
                <AiGenerateButton
                  type="product_long_description"
                  context={{ ...aiCtx, existing: longDesc }}
                  onGenerated={setLongDesc}
                  label="AI Generate"
                />
              </div>
              <textarea id="longDesc" rows={6} value={longDesc} onChange={(e) => setLongDesc(e.target.value)} className={[inputClass, 'resize-y'].join(' ')} />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-graphite">
              <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="accent-scientific-teal" />
              Visible on storefront
            </label>

            <div>
              <Button
                type="button"
                variant="primary"
                loading={mutation.isPending}
                onClick={() => mutation.mutate({
                  name,
                  sku,
                  price: parseFloat(price),
                  shortDescription: shortDesc || undefined,
                  longDescription: longDesc || undefined,
                  stockQuantity: parseInt(stockQty, 10),
                  lowStockThreshold: parseInt(lowStock, 10),
                  isVisible,
                })}
              >
                {mutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* SEO section */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-1 font-heading text-base font-semibold text-midnight-navy">SEO</h2>
          <p className="mb-4 text-xs text-slate">
            Generate optimised meta content for this product page. Values are saved to seo_records via the SEO page.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-graphite">SEO title</p>
              <AiGenerateButton
                type="product_seo_title"
                context={aiCtx}
                onGenerated={(text) => {
                  const el = document.getElementById('seo-title-preview') as HTMLInputElement | null
                  if (el) el.value = text
                }}
                label="Generate SEO title"
              />
              <input id="seo-title-preview" type="text" readOnly placeholder="Click generate…" className={[inputClass, 'cursor-default bg-pale-ice'].join(' ')} />
              <p className="text-xs text-slate">Max 60 characters. Copy to SEO page to save.</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-graphite">Meta description</p>
              <AiGenerateButton
                type="product_seo_description"
                context={aiCtx}
                onGenerated={(text) => {
                  const el = document.getElementById('seo-desc-preview') as HTMLTextAreaElement | null
                  if (el) el.value = text
                }}
                label="Generate meta description"
              />
              <textarea id="seo-desc-preview" rows={3} readOnly placeholder="Click generate…" className={[inputClass, 'resize-none cursor-default bg-pale-ice'].join(' ')} />
              <p className="text-xs text-slate">Max 155 characters. Copy to SEO page to save.</p>
            </div>
          </div>
        </div>

        {/* Internal notes */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-1 font-heading text-base font-semibold text-midnight-navy">Internal notes</h2>
          <p className="mb-3 text-xs text-slate">Admin-only. Never visible to customers or the public API.</p>
          <textarea
            rows={4}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            className={[inputClass, 'resize-y w-full'].join(' ')}
          />
          <div className="mt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={mutation.isPending}
              onClick={() => mutation.mutate({ internalNotes })}
            >
              Save notes
            </Button>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-1 font-heading text-base font-semibold text-midnight-navy">Images</h2>
          <p className="mb-4 text-xs text-slate">Upload client-approved product images only.</p>
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
