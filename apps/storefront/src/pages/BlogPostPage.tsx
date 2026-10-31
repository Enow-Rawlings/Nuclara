import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { useSeo } from '@/hooks/useSeo'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  tags: string[]
  seo_title: string | null
  seo_description: string | null
  author_name: string | null
  published_at: string
  created_at: string
}

async function fetchPost(slug: string): Promise<BlogPost> {
  const { data } = await api.get<ApiSuccess<BlogPost>>(`/blog/${slug}`)
  return data.data
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data: post, isLoading, isError, refetch } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchPost(slug!),
    enabled: Boolean(slug),
  })

  useSeo({
    title: post?.seo_title ?? post?.title,
    description: post?.seo_description ?? post?.excerpt ?? undefined,
    canonicalPath: `/blog/${slug}`,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState
          title="Post not found"
          message="This post may have been removed or the link may be incorrect."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80 no-underline hover:bg-scientific-teal hover:text-white"
                >
                  <Tag size={10} aria-hidden="true" />{tag}
                </Link>
              ))}
            </div>
          )}
          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
            {post.author_name && (
              <span className="flex items-center gap-1.5">
                <User size={14} aria-hidden="true" />{post.author_name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={14} aria-hidden="true" />
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Cover image */}
        {post.cover_image_url && (
          <div className="mb-10 overflow-hidden rounded-xl">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-8 text-xl leading-relaxed text-graphite font-light border-l-4 border-scientific-teal pl-5">
            {post.excerpt}
          </p>
        )}

        {/* Content — renders paragraphs and bullet point lists */}
        <div className="prose prose-slate max-w-none">
          {post.content.split('\n\n').filter(Boolean).map((block, i) => {
            const lines = block.split('\n').filter(Boolean)
            const isBulletBlock = lines.every((l) => l.trim().startsWith('•') || l.trim().startsWith('-'))

            if (isBulletBlock) {
              return (
                <ul key={i} className="mb-6 space-y-2 pl-4">
                  {lines.map((line, j) => (
                    <li key={j} className="flex items-start gap-2 text-base leading-relaxed text-graphite">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-scientific-teal" aria-hidden="true" />
                      <span>{line.replace(/^[•\-]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              )
            }

            // Check if it's a heading line (short, no period at end, followed by bullets)
            if (lines.length === 1 && lines[0].length < 80 && !lines[0].endsWith('.')) {
              return (
                <h3 key={i} className="mb-3 mt-6 font-heading text-lg font-semibold text-midnight-navy">
                  {lines[0]}
                </h3>
              )
            }

            return (
              <p key={i} className="mb-4 text-base leading-relaxed text-graphite">
                {block}
              </p>
            )
          })}
        </div>

        {/* Back link */}
        <div className="mt-12 border-t border-border-grey pt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-scientific-teal no-underline hover:underline"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to all posts
          </Link>
        </div>

        {/* Research notice */}
        <p className="mt-6 text-xs text-slate">
          All content on this site is for informational purposes only. Products supplied by Nuclara are for{' '}
          <strong className="font-medium text-graphite">research and laboratory use only</strong>.
        </p>
      </div>
    </div>
  )
}
