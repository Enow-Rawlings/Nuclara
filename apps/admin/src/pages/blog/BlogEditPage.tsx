import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle, ArrowLeft, X, ImageIcon, Upload } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AiGenerateButton } from '@/components/ui/AiGenerateButton'

interface UploadSignature {
  signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string; allowedFormats: string
}

function BlogCoverUploader({ currentUrl, onChange }: { currentUrl: string; onChange: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED.includes(file.type)) { setUploadError('Only JPG, PNG and WebP allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError('File exceeds 5 MB.'); return }
    setUploadError(null)
    setUploading(true)
    try {
      const sigRes = await api.get<ApiSuccess<UploadSignature>>('/media/upload-signature', { params: { folder: 'blog' } })
      const sig = sigRes.data.data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', sig.apiKey)
      formData.append('timestamp', String(sig.timestamp))
      formData.append('signature', sig.signature)
      formData.append('folder', sig.folder)
      formData.append('allowed_formats', sig.allowedFormats)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: formData })
      if (!res.ok) { const e = await res.json() as { error?: { message?: string } }; throw new Error(e.error?.message ?? 'Upload failed') }
      const data = await res.json() as { secure_url: string }
      onChange(data.secure_url)
    } catch (err: unknown) {
      setUploadError((err as Error).message ?? 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-graphite">Cover image</p>
      {currentUrl ? (
        <div className="relative mb-2">
          <img src={currentUrl} alt="Cover preview" className="h-40 w-full rounded-lg object-cover border border-border-grey" />
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Remove cover image"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error-red text-white hover:bg-[#c0392b]"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          className="mb-2 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border-grey bg-pale-ice p-6 text-center"
        >
          <ImageIcon size={24} className="text-slate" aria-hidden="true" />
          <p className="text-sm text-slate">Drag an image here or click to upload</p>
          <p className="text-xs text-slate">JPG, PNG, WebP — max 5 MB. Recommended: 1200×630 px</p>
          <Button type="button" variant="secondary" size="sm" loading={uploading} onClick={() => fileInputRef.current?.click()}>
            <Upload size={13} aria-hidden="true" />
            {uploading ? 'Uploading…' : 'Choose image'}
          </Button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload cover image" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      {uploadError && <p className="mt-1 flex items-center gap-1 text-xs text-error-red"><AlertTriangle size={11} aria-hidden="true" /> {uploadError}</p>}
    </div>
  )
}

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  seo_title: string | null
  seo_description: string | null
  author_name: string | null
  published_at: string | null
  updated_at: string
}

interface BlogPostPayload {
  title: string
  excerpt?: string | undefined
  content: string
  coverImageUrl?: string | null | undefined
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  seoTitle?: string | undefined
  seoDescription?: string | undefined
  authorName?: string | undefined
}

const inputClass = 'rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal w-full'

export default function BlogEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = !id || id === 'new'

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [seeded, setSeeded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: post, isLoading } = useQuery({
    queryKey: ['admin-blog-post', id],
    queryFn: async () => {
      const { data } = await api.get<ApiSuccess<BlogPost>>(`/blog/admin/${id}`)
      return data.data
    },
    enabled: !isNew,
  })

  useEffect(() => {
    if (post && !seeded) {
      setTitle(post.title)
      setExcerpt(post.excerpt ?? '')
      setContent(post.content)
      setCoverUrl(post.cover_image_url ?? '')
      setTags(post.tags)
      setStatus(post.status)
      setSeoTitle(post.seo_title ?? '')
      setSeoDesc(post.seo_description ?? '')
      setAuthorName(post.author_name ?? '')
      setSeeded(true)
    }
  }, [post, seeded])

  const buildPayload = (): BlogPostPayload => ({
    title,
    excerpt: excerpt || undefined,
    content,
    coverImageUrl: coverUrl || null,
    tags,
    status,
    seoTitle: seoTitle || undefined,
    seoDescription: seoDesc || undefined,
    authorName: authorName || undefined,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isNew) {
        const { data } = await api.post<ApiSuccess<{ id: string }>>('/blog/admin', buildPayload())
        return data.data
      }
      const { data } = await api.patch<ApiSuccess<{ id: string }>>(`/blog/admin/${id}`, buildPayload())
      return data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] })
      setSaved(true)
      setError(null)
      setTimeout(() => setSaved(false), 3000)
      if (isNew) navigate(`/blog/${data.id}/edit`, { replace: true })
    },
    onError: (err: unknown) => {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to save post.'
      )
    },
  })

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  if (!isNew && isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const aiCtx = { name: title, shortDescription: excerpt, existing: content }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/blog" className="text-sm text-slate hover:text-scientific-teal">
          <ArrowLeft size={14} className="inline mr-1" aria-hidden="true" />Blog
        </Link>
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">
          {isNew ? 'New post' : 'Edit post'}
        </h1>
        {!isNew && post && (
          <Badge variant={post.status === 'published' ? 'success' : post.status === 'archived' ? 'outline' : 'warning'}>
            {post.status}
          </Badge>
        )}
      </div>

      {error && (
        <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{error}
        </div>
      )}
      {saved && (
        <div role="status" className="mb-4 flex gap-2 rounded border border-success-green/30 bg-[#e8f5f0] p-3 text-sm text-success-green">
          <CheckCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          Post saved successfully.
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Main content */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-midnight-navy">Content</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-graphite">Title *</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. BPC-157: Research Overview" />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label htmlFor="excerpt" className="text-sm font-medium text-graphite">Excerpt</label>
                <AiGenerateButton
                  type="blog_excerpt"
                  context={{ name: title, existing: excerpt }}
                  onGenerated={setExcerpt}
                  label="AI Generate"
                />
              </div>
              <textarea
                id="excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                maxLength={500}
                className={[inputClass, 'resize-none'].join(' ')}
                placeholder="Brief summary shown on the blog list page…"
              />
              <p className="mt-0.5 text-xs text-slate">{excerpt.length}/500</p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label htmlFor="content" className="text-sm font-medium text-graphite">Body *</label>
                <AiGenerateButton
                  type="blog_content"
                  context={aiCtx}
                  onGenerated={setContent}
                  label="AI Draft"
                />
              </div>
              <p className="mb-1 text-xs text-slate">Use double line breaks to separate paragraphs. No HTML — plain text only.</p>
              <textarea
                id="content"
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={[inputClass, 'resize-y font-mono text-xs leading-relaxed'].join(' ')}
                placeholder="Write your article here…&#10;&#10;Separate paragraphs with a blank line."
              />
            </div>

            <BlogCoverUploader
              currentUrl={coverUrl}
              onChange={setCoverUrl}
            />

            {/* Tags */}
            <div>
              <label className="mb-1 block text-sm font-medium text-graphite">Tags</label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-[#e6f4f5] px-2.5 py-0.5 text-xs font-medium text-scientific-teal">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-error-red" aria-label={`Remove tag ${tag}`}>
                      <X size={10} aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="Type a tag and press Enter"
                  className={inputClass}
                  aria-label="Add tag"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addTag}>Add</Button>
              </div>
              <p className="mt-0.5 text-xs text-slate">{tags.length}/10 tags</p>
            </div>

            <div>
              <label htmlFor="authorName" className="mb-1 block text-sm font-medium text-graphite">Author name</label>
              <input id="authorName" type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className={inputClass} placeholder="e.g. Nuclara Research Team" />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-midnight-navy">SEO</h2>
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label htmlFor="seoTitle" className="text-sm font-medium text-graphite">SEO title <span className="text-xs text-slate">(max 60 chars)</span></label>
                <AiGenerateButton
                  type="product_seo_title"
                  context={{ name: title, shortDescription: excerpt }}
                  onGenerated={setSeoTitle}
                  label="Generate"
                />
              </div>
              <input id="seoTitle" type="text" maxLength={70} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} />
              <p className="mt-0.5 text-xs text-slate">{seoTitle.length}/60</p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label htmlFor="seoDesc" className="text-sm font-medium text-graphite">Meta description <span className="text-xs text-slate">(max 155 chars)</span></label>
                <AiGenerateButton
                  type="product_seo_description"
                  context={{ name: title, shortDescription: excerpt }}
                  onGenerated={setSeoDesc}
                  label="Generate"
                />
              </div>
              <textarea id="seoDesc" rows={2} maxLength={160} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className={[inputClass, 'resize-none'].join(' ')} />
              <p className="mt-0.5 text-xs text-slate">{seoDesc.length}/155</p>
            </div>
          </div>
        </div>

        {/* Publish controls */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-midnight-navy">Publication</h2>
          <div className="mb-4 flex flex-col gap-1">
            <label htmlFor="post-status" className="text-sm font-medium text-graphite">Status</label>
            <select id="post-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}>
              <option value="draft">Draft — not visible to readers</option>
              <option value="published">Published — live on the blog</option>
              <option value="archived">Archived — hidden from blog list</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? 'Saving…' : isNew ? 'Create post' : 'Save changes'}
            </Button>
            {!isNew && status === 'draft' && (
              <Button
                variant="secondary"
                loading={saveMutation.isPending}
                onClick={() => { setStatus('published'); setTimeout(() => saveMutation.mutate(), 0) }}
              >
                Publish now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
