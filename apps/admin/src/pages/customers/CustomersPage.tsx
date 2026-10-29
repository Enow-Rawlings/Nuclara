import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Users, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'

interface Customer {
  id: string
  auth_user_id: string
  email: string
  full_name: string | null
  phone: string | null
  is_verified: boolean
  created_at: string
}

async function fetchCustomers(): Promise<Customer[]> {
  const { data } = await api.get<ApiSuccess<Customer[]>>('/customers/admin')
  return data.data
}

type Filter = 'all' | 'unverified' | 'verified'

export default function CustomersPage() {
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: fetchCustomers,
  })

  const verifyMutation = useMutation({
    mutationFn: (customerId: string) =>
      api.patch(`/customers/admin/${customerId}/status`, { status: 'active' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-customers'] }),
  })

  const filtered = customers
    .filter((c) => {
      if (filter === 'unverified') return !c.is_verified
      if (filter === 'verified') return c.is_verified
      return true
    })
    .filter((c) =>
      q
        ? c.email.toLowerCase().includes(q.toLowerCase()) ||
          (c.full_name ?? '').toLowerCase().includes(q.toLowerCase())
        : true
    )

  const pendingCount = customers.filter((c) => !c.is_verified).length

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-midnight-navy">Customers</h1>
          <p className="mt-1 text-sm text-slate">All registered customer accounts.</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-warning-amber/30 bg-[#fef3e2] px-3 py-1.5 text-xs font-medium text-warning-amber">
            <ShieldCheck size={13} aria-hidden="true" />
            {pendingCount} awaiting verification
          </div>
        )}
      </div>

      {/* Filters + search */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-border-grey bg-cloud-white p-1">
          {(['all', 'unverified', 'verified'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                'rounded px-3 py-1 text-xs font-medium capitalize transition-colors',
                filter === f ? 'bg-midnight-navy text-white' : 'text-slate hover:bg-pale-ice',
              ].join(' ')}
            >
              {f}
              {f === 'unverified' && pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-warning-amber px-1.5 py-0.5 text-[10px] text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border-grey bg-cloud-white px-3 py-2">
          <Search size={16} className="flex-shrink-0 text-slate" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-48 bg-transparent text-sm text-graphite placeholder:text-slate/50 focus:outline-none"
            aria-label="Search customers"
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border-grey bg-cloud-white py-16 text-center">
          <Users size={28} className="text-border-grey" aria-hidden="true" />
          <p className="text-sm text-slate">
            {q ? 'No customers match your search.' : `No ${filter !== 'all' ? filter : ''} customers.`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-grey">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-grey bg-pale-ice text-left">
                <th className="px-4 py-3 font-semibold text-midnight-navy">Customer</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Status</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Joined</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grey bg-cloud-white">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-pale-ice/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-midnight-navy">{c.full_name ?? '—'}</p>
                    <p className="text-xs text-slate">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.is_verified ? 'success' : 'warning'}>
                      {c.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!c.is_verified && (
                        <button
                          type="button"
                          onClick={() => verifyMutation.mutate(c.id)}
                          disabled={verifyMutation.isPending}
                          className="rounded border border-success-green/40 bg-[#e8f5f0] px-2 py-0.5 text-xs font-medium text-success-green transition-colors hover:bg-success-green hover:text-white disabled:opacity-50"
                          aria-label={`Verify ${c.email}`}
                        >
                          Verify
                        </button>
                      )}
                      <Link
                        to={`/customers/${c.id}`}
                        className="text-xs font-medium text-scientific-teal no-underline hover:underline"
                      >
                        View →
                      </Link>
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
