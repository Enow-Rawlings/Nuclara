import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'

interface AuditEvent {
  id: string
  actor_email: string | null
  actor_type: string
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

interface AuditLogResponse {
  data: AuditEvent[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

async function fetchAuditLog(page: number): Promise<AuditLogResponse> {
  const { data } = await api.get<ApiSuccess<AuditLogResponse>>('/audit/admin', {
    params: { page, pageSize: 25 },
  })
  return data.data
}

function actionBadge(action: string) {
  if (action.includes('created')) return 'success'
  if (action.includes('deleted') || action.includes('revoked')) return 'error'
  if (action.includes('updated') || action.includes('patched')) return 'info'
  if (action.includes('published')) return 'success'
  if (action.includes('blocked')) return 'error'
  return 'default' as const
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit-log', page],
    queryFn: () => fetchAuditLog(page),
  })

  const events = data?.data ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Audit Log</h1>
        <p className="mt-1 text-sm text-slate">
          A record of all admin actions taken on this platform.
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : isError ? (
        <p className="text-sm text-error-red">Failed to load audit log.</p>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border-grey bg-cloud-white py-16 text-center">
          <ClipboardList size={28} className="text-border-grey" aria-hidden="true" />
          <p className="text-sm text-slate">No audit events recorded yet.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border-grey">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-grey bg-pale-ice text-left">
                  <th className="px-4 py-3 font-semibold text-midnight-navy">Time</th>
                  <th className="px-4 py-3 font-semibold text-midnight-navy">Actor</th>
                  <th className="px-4 py-3 font-semibold text-midnight-navy">Action</th>
                  <th className="px-4 py-3 font-semibold text-midnight-navy">Entity</th>
                  <th className="px-4 py-3 font-semibold text-midnight-navy">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-grey bg-cloud-white">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-pale-ice/40">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-graphite">{event.actor_email ?? 'System'}</p>
                      <p className="text-xs text-slate capitalize">{event.actor_type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={actionBadge(event.action)}>
                        {event.action.replace(/\./g, ' → ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate">
                      {event.entity_type && (
                        <span className="capitalize">{event.entity_type}</span>
                      )}
                      {event.entity_id && (
                        <span className="ml-1 font-mono text-[10px] text-slate/60">
                          {event.entity_id.slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <p className="truncate font-mono text-[10px] text-slate">
                          {JSON.stringify(event.metadata)}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-slate">
                Page {page} of {totalPages} — {pagination?.total} events
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border border-border-grey p-1.5 text-slate hover:bg-pale-ice disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-border-grey p-1.5 text-slate hover:bg-pale-ice disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
