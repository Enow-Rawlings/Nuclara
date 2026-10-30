import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import type { PaginatedResponse } from 'shared-types'
import { useSeo } from '@/hooks/useSeo'
import { Skeleton } from '@/components/ui/Skeleton'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface BlogPostSummary {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_image_url: string | null
  tags: string[]
  author_name: string | null
  published_at: string
}

async function fetchPosts(page: number, tag?: string): Promise<PaginatedResponse<BlogPostSummary>> {
  const { data } = await api.get<PaginatedResponse<BlogPostSummary>>('/blog', {
    params: { page, pageSize: 9, ...(tag ? { tag } : {}) },
  })
  return data
}

function PostCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border-grey bg-cloud-white transition-shadow hover:shadow-card-hover">
      {/* Cover image */}
      <Link to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true" className="block overflow-hidden">
        <div className="aspect-video bg-pale-ice">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen size={32} className="text-border-grey" aria-hidden="true" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-[#e6f4f5] px-2.5 py-0.5 text-xs font-medium text-scientific-teal">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="mb-2 font-heading text-base font-bold leading-snug text-midnight-navy">
          <Link to={`/blog/${post.slug}`} className="no-underline hover:text-scientific-teal">
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-grey pt-3">
          <div className="text-xs text-slate">
            {post.author_name && <span>{post.author_name} · </span>}
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </time>
          </div>
          <Link
            to={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-xs font-medium text-scientific-teal no-underline hover:underline"
            aria-label={`Read ${post.title}`}
          >
            Read <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-grey">
      <Skeleton className="aspect-video w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export default function BlogPage() {
  useSeo({
    title: 'Research Blog',
    description: 'Research insights, compliance updates, and peptide science articles from the Nuclara team.',
    canonicalPath: '/blog',
  })

  const [page, setPage] = useState(1)
  const [activeTag, setActiveTag] = useState<string | undefined>()

  const { data, isLoading } = useQuery({
    queryKey: ['blog-posts', page, activeTag],
    queryFn: () => fetchPosts(page, activeTag),
    placeholderData: (prev) => prev,
  })

  const posts = data?.data ?? []
  const total = data?.meta?.total ?? 0
  const totalPages = data?.meta?.totalPages ?? 1

  // Collect all unique tags from current page for filter pills
  const allTags = [...new Set(posts.flatMap((p) => p.tags))].slice(0, 8)

  return (
    <div>
      {/* Header */}
      <section className="border-b border-border-grey bg-midnight-navy">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Blog' }]} />
          <h1 className="mt-4 font-heading text-4xl font-bold text-white">Research blog</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            Insights, compliance updates, and peptide science from the Nuclara team.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-slate">
              <Tag size={12} aria-hidden="true" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => { setActiveTag(undefined); setPage(1) }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!activeTag ? 'bg-midnight-navy text-white' : 'bg-pale-ice text-slate hover:bg-border-grey'}`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => { setActiveTag(tag); setPage(1) }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeTag === tag ? 'bg-scientific-teal text-white' : 'bg-pale-ice text-slate hover:bg-border-grey'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <BookOpen size={40} className="text-border-grey" aria-hidden="true" />
            <p className="text-slate">No posts yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-border-grey px-4 py-2 text-sm text-slate hover:bg-pale-ice disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-sm text-slate">Page {page} of {totalPages} — {total} posts</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-border-grey px-4 py-2 text-sm text-slate hover:bg-pale-ice disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
