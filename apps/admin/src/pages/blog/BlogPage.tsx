import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, BookOpen, Eye } from 'lucide-react'
import { api } from '@/lib/api'
import type { PaginatedResponse } from 'shared-types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'

interface BlogPostSummary {
  id: string
  slug: string
  title: string
  status: 'draft' | 'published' | 'archived'
  tags: string[]
  author_name: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

async function fetchAdminPosts(page: number, q?: string): Promise<PaginatedResponse<BlogPostSummary>> {
  const { data } = await api.get<PaginatedResponse<BlogPostSummary>>('/blog/admin/all', {
    params: { page, pageSize: 20, ...(q ? { q } : {}) },
  })
  return data
}

const statusBadge = (status: string) => {
  if (status === 'published') return 'success' as const
  if (status === 'archived') return 'outline' as const
  return 'warning' as const
}

export default function AdminBlogPage() {
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [page] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog-posts', page, q],
    queryFn: () => fetchAdminPosts(page, q || undefined),
  })

  const posts = data?.data ?? []
  const total = data?.meta?.total ?? 0

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/blog/admin/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] }),
  })

  const handleDelete = (post: BlogPostSummary) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    deleteMutation.mutate(post.id)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-midnight-navy">Blog</h1>
          <p className="mt-1 text-sm text-slate">
            {total} post{total !== 1 ? 's' : ''} · manage research articles and updates.
          </p>
        </div>
        <Link to="/blog/new">
          <Button variant="primary" size="sm">
            <Plus size={14} aria-hidden="true" /> New post
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-2 rounded-lg border border-border-grey bg-cloud-white px-3 py-2 max-w-sm">
        <input
          type="search"
          placeholder="Search posts…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 bg-transparent text-sm text-graphite placeholder:text-slate/50 focus:outline-none"
          aria-label="Search blog posts"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border-grey bg-cloud-white py-16 text-center">
          <BookOpen size={28} className="text-border-grey" aria-hidden="true" />
          <p className="text-sm text-slate">No posts yet. Create your first article.</p>
          <Link to="/blog/new">
            <Button variant="primary" size="sm">
              <Plus size={14} aria-hidden="true" /> Write first post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-grey">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-grey bg-pale-ice text-left">
                <th className="px-4 py-3 font-semibold text-midnight-navy">Title</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Status</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Published</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Updated</th>
                <th className="px-4 py-3 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grey bg-cloud-white">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-pale-ice/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-midnight-navy line-clamp-1">{post.title}</p>
                    {post.tags.length > 0 && (
                      <p className="mt-0.5 text-xs text-slate">{post.tags.slice(0, 3).join(', ')}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge(post.status)}>{post.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {post.status === 'published' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1 text-slate hover:bg-pale-ice hover:text-midnight-navy"
                          aria-label="Preview"
                        >
                          <Eye size={14} aria-hidden="true" />
                        </a>
                      )}
                      <Link
                        to={`/blog/${post.id}/edit`}
                        className="rounded p-1 text-slate hover:bg-pale-ice hover:text-midnight-navy"
                        aria-label={`Edit ${post.title}`}
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(post)}
                        className="rounded p-1 text-slate hover:bg-[#fde8e8] hover:text-error-red"
                        aria-label={`Delete ${post.title}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
