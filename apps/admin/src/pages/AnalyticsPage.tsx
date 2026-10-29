import { useQuery } from '@tanstack/react-query'
import { TrendingUp, ShoppingBag, PackageX, ShieldAlert, Clock, BarChart2 } from 'lucide-react'
import { fetchDashboardStats } from '@/services/dashboard'
import { Badge, orderStatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

function MetricCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-border-grey bg-cloud-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate">{label}</p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-midnight-navy">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate">{sub}</p>}
        </div>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#e6f4f5] text-scientific-teal">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Analytics</h1>
        <p className="mt-1 text-sm text-slate">
          Platform metrics and order performance overview.
        </p>
      </div>

      {/* ── Key metrics ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border-grey bg-cloud-white p-5">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-7 w-14" />
            </div>
          ))}
        </div>
      ) : isError || !stats ? (
        <p className="text-sm text-error-red">Failed to load analytics data.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Total orders"
              value={stats.totalOrders}
              icon={<ShoppingBag size={18} aria-hidden="true" />}
            />
            <MetricCard
              label="Pending review"
              value={stats.pendingReview}
              icon={<Clock size={18} aria-hidden="true" />}
              sub={stats.pendingReview > 0 ? 'Requires attention' : 'All clear'}
            />
            <MetricCard
              label="Out of stock"
              value={stats.outOfStockCount}
              icon={<PackageX size={18} aria-hidden="true" />}
              sub={stats.outOfStockCount > 0 ? 'Check inventory' : 'All stocked'}
            />
            <MetricCard
              label="Pending compliance"
              value={stats.pendingComplianceCount}
              icon={<ShieldAlert size={18} aria-hidden="true" />}
              sub={stats.pendingComplianceCount > 0 ? 'Review required' : 'All reviewed'}
            />
          </div>

          {/* ── Orders by status ── */}
          <section className="mt-8" aria-labelledby="status-breakdown">
            <h2 id="status-breakdown" className="mb-4 font-heading text-base font-semibold text-midnight-navy">
              Orders by status
            </h2>
            {Object.keys(stats.ordersByStatus).length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border-grey bg-cloud-white py-12 text-center">
                <BarChart2 size={24} className="text-border-grey" aria-hidden="true" />
                <p className="text-sm text-slate">No orders yet — data will appear here once orders are placed.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(stats.ordersByStatus)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const total = stats.totalOrders || 1
                    const pct = Math.round((count / total) * 100)
                    return (
                      <div key={status} className="rounded-lg border border-border-grey bg-cloud-white p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <Badge variant={orderStatusBadge(status)}>
                            {status.replace(/_/g, ' ')}
                          </Badge>
                          <span className="font-heading text-lg font-bold tabular-nums text-midnight-navy">
                            {count}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-pale-ice">
                          <div
                            className="h-full rounded-full bg-scientific-teal transition-all"
                            style={{ width: `${pct}%` }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${status}: ${pct}%`}
                          />
                        </div>
                        <p className="mt-1 text-right text-xs text-slate">{pct}% of total</p>
                      </div>
                    )
                  })}
              </div>
            )}
          </section>

          {/* ── Low stock ── */}
          {stats.lowStockProducts.length > 0 && (
            <section className="mt-8" aria-labelledby="low-stock-analytics">
              <h2 id="low-stock-analytics" className="mb-4 font-heading text-base font-semibold text-midnight-navy">
                Low stock products
              </h2>
              <div className="overflow-hidden rounded-lg border border-border-grey">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-grey bg-pale-ice text-left">
                      <th className="px-4 py-3 font-semibold text-midnight-navy">Product</th>
                      <th className="px-4 py-3 font-semibold text-midnight-navy">SKU</th>
                      <th className="px-4 py-3 font-semibold text-midnight-navy">Stock</th>
                      <th className="px-4 py-3 font-semibold text-midnight-navy">Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-grey bg-cloud-white">
                    {stats.lowStockProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-pale-ice/40">
                        <td className="px-4 py-3 font-medium text-midnight-navy">{p.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate">{p.sku}</td>
                        <td className="px-4 py-3">
                          {p.stock_quantity === 0 ? (
                            <Badge variant="error">Out of stock</Badge>
                          ) : (
                            <Badge variant="warning">{p.stock_quantity} left</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate">{p.low_stock_threshold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Revenue deferred notice */}
          <div className="mt-8 rounded-lg border border-border-grey bg-pale-ice p-4 text-sm text-slate">
            <div className="flex items-start gap-2">
              <TrendingUp size={16} className="mt-0.5 flex-shrink-0 text-slate" aria-hidden="true" />
              <p>
                <strong className="font-medium text-graphite">Revenue analytics not available.</strong>{' '}
                Financial metrics (GMV, revenue, AOV) will appear here once a verified payment
                workflow is configured. Current subtotals are order request values — no payment
                has been processed.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
