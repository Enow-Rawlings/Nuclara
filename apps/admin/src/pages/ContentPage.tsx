import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, AlertTriangle, Check } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

interface ContentBlock {
  id: string
  key: string
  label: string
  value: string
  type: 'text' | 'richtext' | 'url'
  is_active: boolean
  updated_at: string
}

async function fetchContent(): Promise<ContentBlock[]> {
  const { data } = await api.get<ApiSuccess<ContentBlock[]>>('/content/admin')
  return data.data
}

const inputClass = 'rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal w-full'

export default function ContentPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['admin-content'],
    queryFn: fetchContent,
  })

  const saveMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      api.patch(`/content/admin/${id}`, { value }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] })
      setEditingId(null)
      setError(null)
      setSaveSuccess(vars.id)
      setTimeout(() => setSaveSuccess(null), 3000)
    },
    onError: () => setError('Failed to save content block.'),
  })

  const startEdit = (block: ContentBlock) => {
    setEditingId(block.id)
    setEditValue(block.value)
    setError(null)
  }

  // If the API isn't implemented yet show a useful placeholder
  const isNotImplemented = !isLoading && blocks.length === 0

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Content</h1>
        <p className="mt-1 text-sm text-slate">
          Edit site-wide text blocks, banners, and announcements.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      ) : isNotImplemented ? (
        <div className="rounded-lg border border-border-grey bg-pale-ice p-8 text-center">
          <p className="text-sm font-medium text-midnight-navy">Content management</p>
          <p className="mt-2 text-sm text-slate">
            This section will display editable content blocks — banners, announcement bars,
            homepage headlines — once the content API endpoint is implemented.
          </p>
          <p className="mt-3 text-xs text-slate">
            Endpoint required: <code className="rounded bg-border-grey px-1 py-0.5 font-mono text-graphite">GET /api/v1/content/admin</code>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block) => (
            <div key={block.id} className="rounded-lg border border-border-grey bg-cloud-white p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-midnight-navy">{block.label}</p>
                  <Badge variant={block.is_active ? 'success' : 'outline'}>
                    {block.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {saveSuccess === block.id && (
                    <span className="flex items-center gap-1 text-xs text-success-green">
                      <Check size={12} aria-hidden="true" /> Saved
                    </span>
                  )}
                </div>
                {editingId !== block.id && (
                  <button
                    type="button"
                    onClick={() => startEdit(block)}
                    className="rounded p-1 text-slate hover:bg-pale-ice hover:text-midnight-navy"
                    aria-label={`Edit ${block.label}`}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                )}
              </div>

              {editingId === block.id ? (
                <div className="flex flex-col gap-2">
                  {block.type === 'richtext' ? (
                    <textarea
                      rows={4}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={inputClass}
                      aria-label={`Edit ${block.label}`}
                    />
                  ) : (
                    <input
                      type={block.type === 'url' ? 'url' : 'text'}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={inputClass}
                      aria-label={`Edit ${block.label}`}
                    />
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      loading={saveMutation.isPending}
                      onClick={() => saveMutation.mutate({ id: block.id, value: editValue })}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate line-clamp-2">{block.value || <em className="text-slate/50">Empty</em>}</p>
              )}
              <p className="mt-2 font-mono text-[10px] text-slate/50">
                {block.key} · updated {new Date(block.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
