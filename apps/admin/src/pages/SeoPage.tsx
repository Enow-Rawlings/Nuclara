import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Search, AlertTriangle, Check } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'

interface SeoRecord {
  id: string
  entity_type: string
  entity_id: string
  entity_name: string
  seo_title: string | null
  meta_description: string | null
  canonical_url: string | null
  robots_directive: string
  updated_at: string
}

async function fetchSeoRecords(): Promise<SeoRecord[]> {
  const { data } = await api.get<ApiSuccess<SeoRecord[]>>('/seo/admin')
  return data.data
}

const inputClass = 'rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal w-full'

export default function SeoPage() {
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ seo_title: '', meta_description: '', robots_directive: 'index,follow' })
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['admin-seo'],
    queryFn: fetchSeoRecords,
  })

  const saveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/seo/admin/${id}`, editForm),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-seo'] })
      setEditingId(null)
      setError(null)
      setSaved(id)
      setTimeout(() => setSaved(null), 3000)
    },
    onError: () => setError('Failed to save SEO record.'),
  })

  const startEdit = (r: SeoRecord) => {
    setEditingId(r.id)
    setEditForm({
      seo_title: r.seo_title ?? '',
      meta_description: r.meta_description ?? '',
      robots_directive: r.robots_directive,
    })
    setError(null)
  }

  const filtered = q
    ? records.filter((r) => r.entity_name.toLowerCase().includes(q.toLowerCase()) || (r.seo_title ?? '').toLowerCase().includes(q.toLowerCase()))
    : records

  const isNotImplemented = !isLoading && records.length === 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">SEO</h1>
        <p className="mt-1 text-sm text-slate">
          Manage meta titles, descriptions, and robots directives for products and pages.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{error}
        </div>
      )}

      {!isNotImplemented && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-border-grey bg-cloud-white px-3 py-2 max-w-sm">
          <Search size={16} className="flex-shrink-0 text-slate" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by product or title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent text-sm text-graphite placeholder:text-slate/50 focus:outline-none"
            aria-label="Search SEO records"
          />
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isNotImplemented ? (
        <div className="rounded-lg border border-border-grey bg-pale-ice p-8 text-center">
          <p className="text-sm font-medium text-midnight-navy">SEO records</p>
          <p className="mt-2 text-sm text-slate">
            SEO records are created automatically when products are published. They will
            appear here once the SEO admin endpoint is implemented.
          </p>
          <p className="mt-3 text-xs text-slate">
            Endpoint required: <code className="rounded bg-border-grey px-1 py-0.5 font-mono text-graphite">GET /api/v1/seo/admin</code>
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-grey">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-grey bg-pale-ice text-left">
                <th className="px-4 py-3 font-semibold text-midnight-navy">Entity</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">SEO title</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Meta description</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Robots</th>
                <th className="px-4 py-3 sr-only">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grey bg-cloud-white">
              {filtered.map((r) => (
                <>
                  <tr key={r.id} className="hover:bg-pale-ice/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-midnight-navy">{r.entity_name}</p>
                      <p className="text-xs text-slate capitalize">{r.entity_type}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="truncate text-xs text-graphite">{r.seo_title ?? <em className="text-slate/50">Not set</em>}</p>
                      {r.seo_title && <p className="text-[10px] text-slate">{r.seo_title.length}/60 chars</p>}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="line-clamp-2 text-xs text-slate">{r.meta_description ?? <em className="text-slate/50">Not set</em>}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate">{r.robots_directive}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {saved === r.id && <Check size={12} className="text-success-green" aria-hidden="true" />}
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          className="rounded p-1 text-slate hover:bg-pale-ice hover:text-midnight-navy"
                          aria-label={`Edit SEO for ${r.entity_name}`}
                        >
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === r.id && (
                    <tr key={`${r.id}-edit`} className="bg-pale-ice">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="flex flex-col gap-3 max-w-xl">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-graphite">SEO title (max 60 chars)</label>
                            <input
                              type="text"
                              maxLength={60}
                              value={editForm.seo_title}
                              onChange={(e) => setEditForm({ ...editForm, seo_title: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-graphite">Meta description (max 160 chars)</label>
                            <textarea
                              rows={2}
                              maxLength={160}
                              value={editForm.meta_description}
                              onChange={(e) => setEditForm({ ...editForm, meta_description: e.target.value })}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-graphite">Robots directive</label>
                            <select
                              value={editForm.robots_directive}
                              onChange={(e) => setEditForm({ ...editForm, robots_directive: e.target.value })}
                              className={inputClass}
                            >
                              <option value="index,follow">index, follow</option>
                              <option value="noindex,nofollow">noindex, nofollow</option>
                              <option value="noindex,follow">noindex, follow</option>
                              <option value="index,nofollow">index, nofollow</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="primary" loading={saveMutation.isPending} onClick={() => saveMutation.mutate(r.id)}>Save</Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
