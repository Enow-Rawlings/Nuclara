import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fetchMyOrders } from '@/services/orders'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Badge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { ShoppingBag } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { useSeo } from '@/hooks/useSeo'

function orderStatusVariant(status: string) {
  const map: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
    pending_review: 'warning',
    under_review: 'info',
    awaiting_payment: 'info',
    processing: 'info',
    fulfilled: 'success',
    completed: 'success',
    cancelled: 'default',
    rejected: 'error',
  }
  return map[status] ?? 'default'
}

export default function OrdersPage() {
  useSeo({
    title: 'Order history',
    description: 'View your Nuclara order requests.',
    canonicalPath: '/account/orders',
    noIndex: true,
  })
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchMyOrders,
    enabled: Boolean(session),
  })

  if (session === undefined || isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <TableSkeleton rows={5} />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <p className="text-slate">Please sign in to view your orders.</p>
        <Link to="/account/login" className="mt-4 inline-block text-scientific-teal">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Account', href: '/account' }, { label: 'Orders' }]} />
      <h1 className="mt-4 font-heading text-2xl font-bold text-midnight-navy">Order history</h1>

      {orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 py-12 text-center">
          <ShoppingBag size={36} className="text-border-grey" aria-hidden="true" />
          <p className="text-slate">You haven't submitted any order requests yet.</p>
          <Link to="/shop" className="text-scientific-teal">Browse catalogue</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border-grey p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-midnight-navy">
                    {order.public_reference}
                  </p>
                  <p className="text-xs text-slate">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={orderStatusVariant(order.status)}>
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="tabular-nums font-medium text-midnight-navy">
                    {new Intl.NumberFormat('en-GB', {
                      style: 'currency', currency: order.currency,
                    }).format(order.subtotal)}
                  </span>
                </div>
              </div>

              {/* Line items summary */}
              {order.order_items && order.order_items.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-border-grey pt-3 text-sm text-slate">
                  {order.order_items.map((item, i) => (
                    <li key={i}>
                      {item.name_snapshot}{' '}
                      <span className="font-mono text-xs">×{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Payment status notice */}
              <p className="mt-3 text-xs text-slate">
                Payment status:{' '}
                <span className="italic">{order.payment_status.replace('_', ' ')}</span>.
                {' '}Payment instructions will be sent separately by our team.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
