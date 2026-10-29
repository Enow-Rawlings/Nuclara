import { useState, useRef } from 'react'
import { Upload, X, ImageIcon, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import type { ApiSuccess } from 'shared-types'

interface UploadSignature {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  allowedFormats: string
}

interface SavedMedia {
  id: string
  cloudinary_url: string
  cloudinary_public_id: string
  alt_text: string
  display_order: number
  width: number | null
  height: number | null
}

interface ImageUploaderProps {
  productId: string
  existingMedia: SavedMedia[]
  onUploaded: (media: SavedMedia) => void
  onDeleted: (mediaId: string) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function ImageUploader({ productId, existingMedia, onUploaded, onDeleted }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)

    for (const file of Array.from(files)) {
      // Client-side validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name}: only JPG, PNG, and WebP are allowed.`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name}: file exceeds the 5 MB limit.`)
        return
      }
    }

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        // 1. Get signed upload params from our API (secret never leaves server)
        const sigRes = await api.get<ApiSuccess<UploadSignature>>('/media/upload-signature', {
          params: { folder: 'products' },
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

        const cloudData = await cloudRes.json() as {
          public_id: string
          secure_url: string
          width: number
          height: number
        }

        // 3. Save record in our database
        const saveRes = await api.post<ApiSuccess<SavedMedia>>(
          `/media/products/${productId}/images`,
          {
            cloudinaryPublicId: cloudData.public_id,
            cloudinaryUrl: cloudData.secure_url,
            altText: '',
            width: cloudData.width,
            height: cloudData.height,
          }
        )

        onUploaded(saveRes.data.data)
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Remove this image? This cannot be undone.')) return
    try {
      await api.delete(`/media/images/${mediaId}`)
      onDeleted(mediaId)
    } catch {
      setError('Failed to delete image. Please try again.')
    }
  }

  const handleAltSave = async (mediaId: string, altText: string) => {
    try {
      // Update alt text via the product_media table directly
      await api.patch(`/media/images/${mediaId}/alt`, { altText })
    } catch {
      // Non-critical — just log
      console.warn('Failed to save alt text')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div role="alert" className="flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Existing images */}
      {existingMedia.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list" aria-label="Product images">
          {[...existingMedia]
            .sort((a, b) => a.display_order - b.display_order)
            .map((img) => (
              <li key={img.id} className="group relative flex flex-col gap-1.5">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border-grey bg-pale-ice">
                  <img
                    src={img.cloudinary_url}
                    alt={img.alt_text || 'Product image'}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {img.display_order === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-midnight-navy/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    aria-label="Delete image"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-error-red text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
                {/* Alt text */}
                <input
                  type="text"
                  placeholder="Alt text (accessibility)"
                  defaultValue={img.alt_text}
                  onBlur={(e) => {
                    const val = e.target.value.trim()
                    if (val !== img.alt_text) {
                      handleAltSave(img.id, val)
                    }
                  }}
                  className="w-full rounded border border-border-grey bg-cloud-white px-2 py-1 text-xs text-graphite focus:border-scientific-teal focus:outline-none"
                  aria-label={`Alt text for image ${img.display_order + 1}`}
                />
              </li>
            ))}
        </ul>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border-grey bg-pale-ice p-6 text-center transition-colors hover:border-scientific-teal"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f4f5] text-scientific-teal">
          <ImageIcon size={20} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-midnight-navy">
            Drag images here or click to upload
          </p>
          <p className="text-xs text-slate">JPG, PNG, WebP — max 5 MB each</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={14} aria-hidden="true" />
          {uploading ? 'Uploading…' : 'Choose files'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          aria-label="Upload product images"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <p className="text-xs text-slate">
        The first image is the primary product image shown in search results and product cards.
        Use client-approved images only — do not use stock photos that misrepresent the product.
      </p>
    </div>
  )
}
