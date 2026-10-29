import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Clock,
  AlertTriangle,
  PackageX,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { fetchDashboardStats } from '@/services/dashboard'
import { Badge, orderStatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  variant = 'default',
  href,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  variant?: 'default' | 'warning' | 'error' | 'info'
  href?: string
}) {
  const bgMap = {
    default: 'bg-pale-ice text-scientific-teal',
    warning: 'bg-[#fef3e2] text-warning-amber',
    error: 'bg-[#fde8e8] text-error-red',
    info: 'bg-[#e6f4f5] text-scientific-teal',
  }

  const card = (
    <div className="flex items-start gap-4 rounded-lg border border-border-grey bg-cloud-white p-5 transition-shadow hover:shadow-card">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${bgMap[variant]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate">{label}</p>
        <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-midnight-navy">
          {value}
        </p>
      </div>
    </div>
  )

  if (href) {
    return <Link to={href} className="block no-underline">{card}</Link>
  }
  return card
}

function StatCardSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border-grey bg-cloud-white p-5">
      <Skeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-7 w-12" />
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000, // refresh every minute
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-slate">
          Overview of orders, inventory, and compliance status.
        </p>
      </div>

      {/* ── Key metrics ───────────────────────────────────────────────────── */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : isError ? (
            <p role="alert" className="col-span-4 text-sm text-error-red">
              Failed to load dashboard stats.
            </p>
          ) : (
            <>
              <StatCard
                label="Total orders"
                value={stats!.totalOrders}
                icon={<ShoppingBag size={18} aria-hidden="true" />}
                href="/orders"
              />
              <StatCard
                label="Pending review"
                value={stats!.pendingReview}
                icon={<Clock size={18} aria-hidden="true" />}
                variant={stats!.pendingReview > 0 ? 'warning' : 'default'}
                href="/orders"
              />
              <StatCard
                label="Low / out of stock"
                value={`${stats!.lowStockProducts.length} / ${stats!.outOfStockCount}`}
                icon={<PackageX size={18} aria-hidden="true" />}
                variant={stats!.outOfStockCount > 0 ? 'error' : stats!.lowStockProducts.length > 0 ? 'warning' : 'default'}
                href="/inventory"
              />
              <StatCard
                label="Pending compliance"
                value={stats!.pendingComplianceCount}
                icon={<ShieldAlert size={18} aria-hidden="true" />}
                variant={stats!.pendingComplianceCount > 0 ? 'warning' : 'default'}
                href="/products"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Order status breakdown ─────────────────────────────────────────── */}
      {!isLoading && !isError && stats && Object.keys(stats.ordersByStatus).length > 0 && (
        <section className="mt-8" aria-labelledby="order-breakdown-heading">
          <h2 id="order-breakdown-heading" className="mb-3 font-heading text-base font-semibold text-midnight-navy">
            Orders by status
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.ordersByStatus)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center gap-2 rounded-lg border border-border-grey bg-cloud-white px-3 py-2"
                >
                  <Badge variant={orderStatusBadge(status)}>
                    {status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="font-heading text-sm font-bold tabular-nums text-midnight-navy">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* ── Recent orders ─────────────────────────────────────────────── */}
        <section aria-labelledby="recent-orders-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-orders-heading" className="font-heading text-base font-semibold text-midnight-navy">
              Recent orders
            </h2>
            <Link
              to="/orders"
              className="flex items-center gap-1 text-xs font-medium text-scientific-teal no-underline hover:underline"
            >
              View all <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-lg border border-border-grey bg-cloud-white">
            {isLoading ? (
              <div className="space-y-0 divide-y divide-border-grey">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : !stats || stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <TrendingUp size={24} className="text-border-grey" aria-hidden="true" />
                <p className="text-sm text-slate">No orders yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-grey" role="list">
                {stats.recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 no-underline transition-colors hover:bg-pale-ice"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-medium text-midnight-navy truncate">
                          {order.public_reference}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate">{order.contact_name}</p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Badge variant={orderStatusBadge(order.status)}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                        <span className="tabular-nums text-xs font-medium text-midnight-navy">
                          {new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: order.currency,
                          }).format(order.subtotal)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Low stock alerts ──────────────────────────────────────────── */}
        <section aria-labelledby="low-stock-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="low-stock-heading" className="font-heading text-base font-semibold text-midnight-navy">
              Low stock alerts
            </h2>
            <Link
              to="/inventory"
              className="flex items-center gap-1 text-xs font-medium text-scientific-teal no-underline hover:underline"
            >
              Manage inventory <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-lg border border-border-grey bg-cloud-white">
            {isLoading ? (
              <div className="space-y-0 divide-y divide-border-grey">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : !stats || stats.lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <AlertTriangle size={24} className="text-border-grey" aria-hidden="true" />
                <p className="text-sm text-slate">All published products have adequate stock.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-grey" role="list">
                {stats.lowStockProducts.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/products/${product.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 no-underline transition-colors hover:bg-pale-ice"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-midnight-navy">
                          {product.name}
                        </p>
                        <p className="font-mono text-xs text-slate">{product.sku}</p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        {product.stock_quantity === 0 ? (
                          <Badge variant="error">Out of stock</Badge>
                        ) : (
                          <Badge variant="warning">
                            {product.stock_quantity} left
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ── Payment deferred notice ───────────────────────────────────────── */}
      <div className="mt-8 rounded-lg border border-border-grey bg-pale-ice p-4 text-sm text-slate">
        <strong className="font-medium text-graphite">Payment not configured.</strong>{' '}
        Revenue metrics are hidden until a verified payment workflow is implemented.
        Order subtotals shown are request values only — no payment has been taken.
      </div>
    </div>
  )
}
