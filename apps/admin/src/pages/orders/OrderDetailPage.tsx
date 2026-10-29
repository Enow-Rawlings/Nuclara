import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminOrder, updateOrderStatus } from '@/services/orders'
import { Badge, orderStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AlertTriangle } from 'lucide-react'

const ORDER_STATUSES = [
  'pending_review', 'under_review', 'awaiting_payment',
  'processing', 'fulfilled', 'completed', 'cancelled', 'rejected',
]

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => fetchAdminOrder(id!),
    enabled: Boolean(id),
  })

  const mutation = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      updateOrderStatus(id!, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] })
      setNote('')
      setSelectedStatus('')
      setError(null)
    },
    onError: (err: unknown) => {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to update status.'
      )
    },
  })

  if (isLoading || !order) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const addr = order.shipping_address as Record<string, string> | undefined

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/orders" className="text-sm text-slate hover:text-scientific-teal">
          ← Orders
        </Link>
        <h1 className="font-heading text-xl font-bold text-midnight-navy font-mono">
          {order.public_reference}
        </h1>
        <Badge variant={orderStatusBadge(order.status)}>
          {order.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Payment status notice */}
      <div className="mb-5 rounded-lg border border-warning-amber/30 bg-[#fef9ec] p-3 text-sm">
        <strong className="font-medium text-graphite">Payment status:</strong>{' '}
        <span className="italic text-warning-amber">{order.payment_status.replace('_', ' ')}</span>.
        {' '}Payment is not configured in this phase. Do not mark as paid without a verified payment workflow.
      </div>

      <div className="grid gap-5">
        {/* Customer + address */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-3 font-heading text-base font-semibold text-midnight-navy">Customer</h2>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="font-medium text-graphite">{order.contact_name}</p>
              <a href={`mailto:${order.contact_email}`} className="text-scientific-teal">
                {order.contact_email}
              </a>
              <p className="mt-1 text-slate">Market: {order.market_code}</p>
            </div>
            {addr && (
              <address className="not-italic text-slate">
                <p>{addr['line1']}</p>
                {addr['line2'] && <p>{addr['line2']}</p>}
                <p>{addr['city']}{addr['region'] ? `, ${addr['region']}` : ''} {addr['postalCode']}</p>
                <p>{addr['country']}</p>
              </address>
            )}
          </div>
          {order.customer_notes && (
            <div className="mt-3 rounded bg-pale-ice p-3 text-sm text-graphite">
              <strong>Customer notes:</strong> {order.customer_notes}
            </div>
          )}
        </div>

        {/* Line items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="rounded-lg border border-border-grey p-5">
            <h2 className="mb-3 font-heading text-base font-semibold text-midnight-navy">Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-grey text-left">
                  <th className="pb-2 font-semibold text-midnight-navy">Product</th>
                  <th className="pb-2 font-semibold text-midnight-navy">SKU</th>
                  <th className="pb-2 text-right font-semibold text-midnight-navy">Qty</th>
                  <th className="pb-2 text-right font-semibold text-midnight-navy">Unit</th>
                  <th className="pb-2 text-right font-semibold text-midnight-navy">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-grey">
                {order.order_items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 text-graphite">{item.name_snapshot}</td>
                    <td className="py-2 font-mono text-xs text-slate">{item.sku_snapshot}</td>
                    <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-2 text-right tabular-nums">
                      {new Intl.NumberFormat('en-GB', { style: 'currency', currency: item.currency_snapshot }).format(item.price_snapshot)}
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium text-midnight-navy">
                      {new Intl.NumberFormat('en-GB', { style: 'currency', currency: item.currency_snapshot }).format(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border-grey">
                  <td colSpan={4} className="pt-3 text-right font-semibold text-midnight-navy">Subtotal</td>
                  <td className="pt-3 text-right tabular-nums font-bold text-midnight-navy">
                    {new Intl.NumberFormat('en-GB', { style: 'currency', currency: order.currency }).format(order.subtotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Status update */}
        <div className="rounded-lg border border-border-grey p-5">
          <h2 className="mb-3 font-heading text-base font-semibold text-midnight-navy">Update status</h2>
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="newStatus" className="text-sm font-medium text-graphite">New status</label>
                <select
                  id="newStatus"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none"
                >
                  <option value="">Select status…</option>
                  {ORDER_STATUSES.filter((s) => s !== order.status).map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="statusNote" className="text-sm font-medium text-graphite">Note (optional)</label>
                <input
                  id="statusNote"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reason for status change…"
                  className="rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none"
                />
              </div>
            </div>
            <div>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedStatus}
                loading={mutation.isPending}
                onClick={() => mutation.mutate({ status: selectedStatus, ...(note ? { note } : {}) })}
              >
                {mutation.isPending ? 'Updating…' : 'Update status'}
              </Button>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="rounded-lg border border-border-grey bg-pale-ice p-4 text-xs text-slate">
          <p>Submitted: {new Date(order.created_at).toLocaleString()}</p>
          {order.updated_at && <p>Last updated: {new Date(order.updated_at).toLocaleString()}</p>}
          <p className="font-mono">ID: {order.id}</p>
        </div>
      </div>
    </div>
  )
}
