import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
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
  order_count?: number
}

async function fetchCustomers(): Promise<Customer[]> {
  const { data } = await api.get<ApiSuccess<Customer[]>>('/customers/admin')
  return data.data
}

export default function CustomersPage() {
  const [q, setQ] = useState('')

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: fetchCustomers,
  })

  const filtered = q
    ? customers.filter(
        (c) =>
          c.email.toLowerCase().includes(q.toLowerCase()) ||
          (c.full_name ?? '').toLowerCase().includes(q.toLowerCase())
      )
    : customers

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Customers</h1>
        <p className="mt-1 text-sm text-slate">All registered customer accounts.</p>
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-2 rounded-lg border border-border-grey bg-cloud-white px-3 py-2 max-w-sm">
        <Search size={16} className="flex-shrink-0 text-slate" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 bg-transparent text-sm text-graphite placeholder:text-slate/50 focus:outline-none"
          aria-label="Search customers"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border-grey bg-cloud-white py-16 text-center">
          <Users size={28} className="text-border-grey" aria-hidden="true" />
          <p className="text-sm text-slate">{q ? 'No customers match your search.' : 'No customers yet.'}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-grey">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-grey bg-pale-ice text-left">
                <th className="px-4 py-3 font-semibold text-midnight-navy">Customer</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Status</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Joined</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy sr-only">View</th>
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
                    <Link
                      to={`/customers/${c.id}`}
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
  )
}
