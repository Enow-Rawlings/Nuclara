import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'

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

const inputClass = 'rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal w-full'

async function fetchAllCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiSuccess<Category[]>>('/categories/admin/all')
  return data.data
}

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '', is_visible: true })
  const [error, setError] = useState<string | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchAllCategories,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return api.patch(`/categories/admin/${editing.id}`, form)
      }
      return api.post('/categories/admin', form)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      setModalOpen(false)
      setEditing(null)
      setForm({ name: '', description: '', is_visible: true })
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
    setForm({ name: '', description: '', is_visible: true })
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description ?? '', is_visible: cat.is_visible })
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
                <th className="px-4 py-3 font-semibold text-midnight-navy">Name</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Slug</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Visibility</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grey bg-cloud-white">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate">
                    No categories yet. Create one to start organising products.
                  </td>
                </tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-pale-ice/40">
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
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        className="rounded p-1 text-slate hover:bg-pale-ice hover:text-midnight-navy"
                        aria-label={`Edit ${cat.name}`}
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleVisibility.mutate(cat)}
                        className="rounded p-1 text-slate hover:bg-pale-ice hover:text-midnight-navy"
                        aria-label={cat.is_visible ? `Hide ${cat.name}` : `Show ${cat.name}`}
                      >
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
          <div className="w-full max-w-md rounded-xl border border-border-grey bg-cloud-white p-6 shadow-modal">
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
                <label htmlFor="cat-desc" className="mb-1 block text-sm font-medium text-graphite">Description</label>
                <textarea id="cat-desc" rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
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
