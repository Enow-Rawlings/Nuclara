import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, ShoppingBag, ShieldCheck, ShieldOff, Clock, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge, orderStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
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

const statusVariant = (isVerified: boolean) => isVerified ? 'success' as const : 'warning' as const

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [suspendReason, setSuspendReason] = useState('')
  const [showSuspendForm, setShowSuspendForm] = useState(false)
  const [kycError, setKycError] = useState<string | null>(null)

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => fetchCustomer(id!),
    enabled: !!id,
  })

  const kycMutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string | undefined }) =>
      api.patch(`/customers/admin/${id}/status`, { status, ...(reason ? { reason } : {}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customer', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
      setShowSuspendForm(false)
      setSuspendReason('')
      setKycError(null)
    },
    onError: (err: unknown) => {
      setKycError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to update customer status.'
      )
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full rounded-lg" />
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
      <Link to="/customers" className="mb-6 flex items-center gap-1 text-sm text-slate no-underline hover:text-midnight-navy">
        <ArrowLeft size={14} aria-hidden="true" /> All customers
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">
          {customer.full_name ?? customer.email}
        </h1>
        <p className="mt-1 text-sm text-slate">Customer account details and order history.</p>
      </div>

      {kycError && (
        <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{kycError}
        </div>
      )}

      {/* Profile card */}
      <div className="mb-4 rounded-lg border border-border-grey bg-cloud-white p-5">
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
          <Badge variant={statusVariant(customer.is_verified)}>
            {customer.is_verified ? 'Verified' : 'Unverified'}
          </Badge>
        </div>
      </div>

      {/* KYC controls */}
      <div className="mb-6 rounded-lg border border-border-grey bg-pale-ice p-5">
        <h2 className="mb-1 font-heading text-sm font-semibold text-midnight-navy">Account verification (KYC)</h2>
        <p className="mb-4 text-xs text-slate">
          Changing status sends an automatic email notification to the customer.
        </p>

        {showSuspendForm ? (
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="suspend-reason" className="mb-1 block text-xs font-medium text-graphite">
                Reason (optional — included in the email to the customer)
              </label>
              <textarea
                id="suspend-reason"
                rows={2}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Unable to verify research credentials"
                className="w-full resize-none rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                loading={kycMutation.isPending}
                onClick={() => kycMutation.mutate({ status: 'suspended', reason: suspendReason || undefined })}
                className="bg-error-red hover:bg-[#c0392b]"
              >
                <ShieldOff size={13} aria-hidden="true" />
                Confirm suspend
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setShowSuspendForm(false); setSuspendReason('') }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {!customer.is_verified && (
              <Button
                variant="primary"
                size="sm"
                loading={kycMutation.isPending}
                onClick={() => kycMutation.mutate({ status: 'active' })}
              >
                <ShieldCheck size={13} aria-hidden="true" />
                Verify account
              </Button>
            )}
            {customer.is_verified && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSuspendForm(true)}
              >
                <ShieldOff size={13} aria-hidden="true" />
                Suspend account
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              loading={kycMutation.isPending}
              onClick={() => kycMutation.mutate({ status: 'pending_verification' })}
            >
              <Clock size={13} aria-hidden="true" />
              Reset to pending
            </Button>
          </div>
        )}
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
                      <Link to={`/orders/${order.id}`} className="text-xs font-medium text-scientific-teal no-underline hover:underline">
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
