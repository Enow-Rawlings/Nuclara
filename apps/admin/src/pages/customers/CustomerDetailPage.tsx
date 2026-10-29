import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, ShoppingBag } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge, orderStatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

interface CustomerDetail {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_verified: boolean
  created_at: string
  orders: Array<{
    id: string
    public_reference: string
    status: string
    currency: string
    subtotal: number
    created_at: string
  }>
}

async function fetchCustomer(id: string): Promise<CustomerDetail> {
  const { data } = await api.get<ApiSuccess<CustomerDetail>>(`/customers/admin/${id}`)
  return data.data
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => fetchCustomer(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="rounded-lg border border-error-red/30 bg-[#fde8e8] p-6 text-sm text-error-red">
        Customer not found.{' '}
        <Link to="/customers" className="underline">Back to customers</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Link
        to="/customers"
        className="mb-6 flex items-center gap-1 text-sm text-slate no-underline hover:text-midnight-navy"
      >
        <ArrowLeft size={14} aria-hidden="true" /> All customers
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">
          {customer.full_name ?? customer.email}
        </h1>
        <p className="mt-1 text-sm text-slate">Customer account details and order history.</p>
      </div>

      {/* Profile card */}
      <div className="mb-6 rounded-lg border border-border-grey bg-cloud-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-graphite">
              <Mail size={14} className="text-slate" aria-hidden="true" />
              {customer.email}
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-graphite">
                <Phone size={14} className="text-slate" aria-hidden="true" />
                {customer.phone}
              </div>
            )}
            <p className="text-xs text-slate">
              Registered {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={customer.is_verified ? 'success' : 'warning'}>
            {customer.is_verified ? 'Verified' : 'Unverified'}
          </Badge>
        </div>
      </div>

      {/* Orders */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <ShoppingBag size={16} className="text-slate" aria-hidden="true" />
          <h2 className="font-heading text-base font-semibold text-midnight-navy">
            Orders ({customer.orders.length})
          </h2>
        </div>

        {customer.orders.length === 0 ? (
          <div className="rounded-lg border border-border-grey bg-cloud-white px-4 py-10 text-center text-sm text-slate">
            No orders placed yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border-grey">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-grey bg-pale-ice text-left">
                  <th className="px-4 py-3 font-semibold text-midnight-navy">Reference</th>
                  <th className="px-4 py-3 font-semibold text-midnight-navy">Status</th>
                  <th className="px-4 py-3 font-semibold text-midnight-navy">Amount</th>
                  <th className="px-4 py-3 font-semibold text-midnight-navy">Date</th>
                  <th className="px-4 py-3 sr-only">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-grey bg-cloud-white">
                {customer.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-pale-ice/40">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-midnight-navy">
                      {order.public_reference}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={orderStatusBadge(order.status)}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-midnight-navy">
                      {new Intl.NumberFormat('en-GB', { style: 'currency', currency: order.currency }).format(order.subtotal)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-xs font-medium text-scientific-teal no-underline hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
