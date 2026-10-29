import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { fetchAdminOrders } from '@/services/orders'
import { Badge, orderStatusBadge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'

export default function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAdminOrders,
    refetchInterval: 30_000, // poll every 30s — new orders surface automatically
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Orders</h1>
        <span className="text-sm text-slate">{orders.length} request{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : isError ? (
        <p role="alert" className="text-sm text-error-red">Failed to load orders.</p>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <ShoppingBag size={36} className="text-border-grey" aria-hidden="true" />
          <p className="text-slate">No order requests yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-grey">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-grey bg-pale-ice text-left">
                <th className="px-4 py-3 font-semibold text-midnight-navy">Reference</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Customer</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Market</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Subtotal</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Status</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Payment</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Submitted</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy sr-only">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grey">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-pale-ice/50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-midnight-navy">
                    {order.public_reference}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-graphite">{order.contact_name}</div>
                    <div className="text-xs text-slate">{order.contact_email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate">{order.market_code}</td>
                  <td className="px-4 py-3 tabular-nums text-graphite">
                    {new Intl.NumberFormat('en-GB', { style: 'currency', currency: order.currency }).format(order.subtotal)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={orderStatusBadge(order.status)}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate italic">
                      {order.payment_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-xs font-medium text-scientific-teal no-underline hover:underline"
                    >
                      View
                    </Link>
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
