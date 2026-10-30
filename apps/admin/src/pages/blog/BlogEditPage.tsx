import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle, ArrowLeft, X } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AiGenerateButton } from '@/components/ui/AiGenerateButton'

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
                  type="product_short_description"
                  context={{ name: title }}
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
                  type="product_long_description"
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

            <div>
              <label htmlFor="coverUrl" className="mb-1 block text-sm font-medium text-graphite">Cover image URL</label>
              <input id="coverUrl" type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className={inputClass} placeholder="https://…" />
              {coverUrl && (
                <img src={coverUrl} alt="Cover preview" className="mt-2 h-24 w-full rounded-lg object-cover" onError={() => setCoverUrl('')} />
              )}
            </div>

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
