import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Eye, EyeOff, AlertTriangle, ImageIcon, Upload, X } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { AiGenerateButton } from '@/components/ui/AiGenerateButton'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  is_visible: boolean
  parent_id: string | null
  image_url: string | null
  created_at: string
}

interface UploadSignature {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  allowedFormats: string
}

const inputClass = 'rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal w-full'

async function fetchAllCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiSuccess<Category[]>>('/categories/admin/all')
  return data.data
}

// ─── Category image uploader ─────────────────────────────────────────────────

function CategoryImageUploader({
  currentUrl,
  onChange,
}: {
  currentUrl: string | null
  onChange: (url: string | null) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const MAX_SIZE = 3 * 1024 * 1024 // 3 MB
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

  const handleFile = async (file: File) => {
    if (!ALLOWED.includes(file.type)) { setError('Only JPG, PNG, and WebP are allowed.'); return }
    if (file.size > MAX_SIZE) { setError('File exceeds the 3 MB limit.'); return }
    setError(null)
    setUploading(true)
    try {
      // 1. Get signed upload params
      const sigRes = await api.get<ApiSuccess<UploadSignature>>('/media/upload-signature', {
        params: { folder: 'categories' },
      })
      const sig = sigRes.data.data

      // 2. Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', sig.apiKey)
      formData.append('timestamp', String(sig.timestamp))
      formData.append('signature', sig.signature)
      formData.append('folder', sig.folder)
      formData.append('allowed_formats', sig.allowedFormats)

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      if (!cloudRes.ok) {
        const errBody = await cloudRes.json() as { error?: { message?: string } }
        throw new Error(errBody.error?.message ?? 'Upload failed')
      }
      const cloudData = await cloudRes.json() as { secure_url: string }
      onChange(cloudData.secure_url)
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-graphite">Category image</p>

      {currentUrl ? (
        <div className="relative mb-2 inline-block">
          <img
            src={currentUrl}
            alt="Category image preview"
            className="h-24 w-24 rounded-lg border border-border-grey object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-error-red text-white hover:bg-[#c0392b]"
          >
            <X size={10} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          className="mb-2 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border-grey bg-pale-ice p-4 text-center"
        >
          <ImageIcon size={18} className="text-slate" aria-hidden="true" />
          <p className="text-xs text-slate">Drag an image here or click to upload</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={12} aria-hidden="true" />
            {uploading ? 'Uploading…' : 'Choose image'}
          </Button>
        </div>
      )}

      {!currentUrl && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Upload category image"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      )}

      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-error-red">
          <AlertTriangle size={11} aria-hidden="true" /> {error}
        </p>
      )}
      <p className="mt-1 text-xs text-slate">JPG, PNG, WebP — max 3 MB. Optional.</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '', is_visible: true, image_url: null as string | null })
  const [error, setError] = useState<string | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchAllCategories,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        is_visible: form.is_visible,
        image_url: form.image_url,
      }
      if (editing) return api.patch(`/categories/admin/${editing.id}`, payload)
      return api.post('/categories/admin', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      setModalOpen(false)
      setEditing(null)
      setForm({ name: '', description: '', is_visible: true, image_url: null })
      setError(null)
    },
    onError: (err: unknown) => {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to save category.')
    },
  })

  const toggleVisibility = useMutation({
    mutationFn: (cat: Category) => api.patch(`/categories/admin/${cat.id}`, { is_visible: !cat.is_visible }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  })

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', description: '', is_visible: true, image_url: null })
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description ?? '', is_visible: cat.is_visible, image_url: cat.image_url })
    setError(null)
    setModalOpen(true)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-midnight-navy">Categories</h1>
          <p className="mt-1 text-sm text-slate">Organise your product catalogue.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>
          <Plus size={14} aria-hidden="true" /> New category
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-grey">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-grey bg-pale-ice text-left">
                <th className="px-4 py-3 font-semibold text-midnight-navy">Image</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Name</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Slug</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Visibility</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grey bg-cloud-white">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate">
                    No categories yet. Create one to start organising products.
                  </td>
                </tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-pale-ice/40">
                  <td className="px-4 py-3">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="h-10 w-10 rounded-lg border border-border-grey object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border-grey bg-pale-ice text-slate">
                        <ImageIcon size={14} aria-hidden="true" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-midnight-navy">{cat.name}</p>
                    {cat.description && <p className="mt-0.5 text-xs text-slate line-clamp-1">{cat.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cat.is_visible ? 'success' : 'outline'}>
                      {cat.is_visible ? 'Visible' : 'Hidden'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEdit(cat)} className="rounded p-1 text-slate hover:bg-pale-ice hover:text-midnight-navy" aria-label={`Edit ${cat.name}`}>
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => toggleVisibility.mutate(cat)} className="rounded p-1 text-slate hover:bg-pale-ice hover:text-midnight-navy" aria-label={cat.is_visible ? `Hide ${cat.name}` : `Show ${cat.name}`}>
                        {cat.is_visible ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 px-4" role="dialog" aria-modal="true" aria-labelledby="cat-dialog-title">
          <div className="w-full max-w-md overflow-y-auto rounded-xl border border-border-grey bg-cloud-white p-6 shadow-modal" style={{ maxHeight: '90vh' }}>
            <h2 id="cat-dialog-title" className="mb-4 font-heading text-lg font-bold text-midnight-navy">
              {editing ? 'Edit category' : 'New category'}
            </h2>
            {error && (
              <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{error}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="cat-name" className="mb-1 block text-sm font-medium text-graphite">Name *</label>
                <input id="cat-name" type="text" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label htmlFor="cat-desc" className="text-sm font-medium text-graphite">Description</label>
                  <AiGenerateButton
                    type="category_description"
                    context={{ name: form.name, existing: form.description }}
                    onGenerated={(text) => setForm({ ...form, description: text })}
                    label="AI Generate"
                  />
                </div>
                <textarea id="cat-desc" rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <CategoryImageUploader
                currentUrl={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
              />
              <label className="flex items-center gap-2 text-sm text-graphite">
                <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({ ...form, is_visible: e.target.checked })} className="rounded border-border-grey" />
                Visible to customers
              </label>
              <div className="flex gap-3 pt-1">
                <Button variant="primary" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                  {editing ? 'Save changes' : 'Create category'}
                </Button>
                <Button variant="secondary" onClick={() => { setModalOpen(false); setError(null) }}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
