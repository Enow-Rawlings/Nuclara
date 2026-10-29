import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, PackageX, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { fetchAdminProducts, updateProduct } from '@/services/products'

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products-inventory'],
    queryFn: () => fetchAdminProducts({ pageSize: 100 }),
  })

  const products = data?.data ?? []

  const updateStock = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      updateProduct(id, { stockQuantity: qty }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-inventory'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setEditingId(null)
    },
  })

  const startEdit = (id: string, current: number) => {
    setEditingId(id)
    setEditValue(String(current))
  }

  const commitEdit = (id: string) => {
    const qty = parseInt(editValue, 10)
    if (isNaN(qty) || qty < 0) return
    updateStock.mutate({ id, qty })
  }

  const stockBadge = (qty: number, threshold: number) => {
    if (qty === 0) return <Badge variant="error">Out of stock</Badge>
    if (qty <= threshold) return <Badge variant="warning">Low — {qty} left</Badge>
    return <Badge variant="success">{qty} in stock</Badge>
  }

  const outOfStock = products.filter((p) => p.stock_quantity === 0).length
  const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">Inventory</h1>
        <p className="mt-1 text-sm text-slate">
          Monitor stock levels and update quantities. Click a quantity to edit it inline.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-grey bg-cloud-white p-4">
          <p className="text-xs text-slate">Total products</p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-midnight-navy">{products.length}</p>
        </div>
        <div className={`rounded-lg border p-4 ${outOfStock > 0 ? 'border-error-red/30 bg-[#fde8e8]' : 'border-border-grey bg-cloud-white'}`}>
          <div className="flex items-center gap-1.5 text-xs text-slate">
            <PackageX size={12} aria-hidden="true" /> Out of stock
          </div>
          <p className={`mt-1 font-heading text-2xl font-bold tabular-nums ${outOfStock > 0 ? 'text-error-red' : 'text-midnight-navy'}`}>{outOfStock}</p>
        </div>
        <div className={`rounded-lg border p-4 ${lowStock > 0 ? 'border-warning-amber/30 bg-[#fef3e2]' : 'border-border-grey bg-cloud-white'}`}>
          <div className="flex items-center gap-1.5 text-xs text-slate">
            <AlertTriangle size={12} aria-hidden="true" /> Low stock
          </div>
          <p className={`mt-1 font-heading text-2xl font-bold tabular-nums ${lowStock > 0 ? 'text-warning-amber' : 'text-midnight-navy'}`}>{lowStock}</p>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-grey">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-grey bg-pale-ice text-left">
                <th className="px-4 py-3 font-semibold text-midnight-navy">Product</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">SKU</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Status</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Stock</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grey bg-cloud-white">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate">No products found.</td>
                </tr>
              ) : products.map((p) => (
                <tr key={p.id} className={`hover:bg-pale-ice/40 ${p.stock_quantity === 0 ? 'bg-[#fde8e8]/20' : p.stock_quantity <= p.low_stock_threshold ? 'bg-[#fef3e2]/20' : ''}`}>
                  <td className="px-4 py-3 font-medium text-midnight-navy">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate">{p.sku}</td>
                  <td className="px-4 py-3">{stockBadge(p.stock_quantity, p.low_stock_threshold)}</td>
                  <td className="px-4 py-3">
                    {editingId === p.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(p.id); if (e.key === 'Escape') setEditingId(null) }}
                          className="w-20 rounded border border-scientific-teal bg-cloud-white px-2 py-1 text-sm focus:outline-none"
                          autoFocus
                          aria-label="Edit stock quantity"
                        />
                        <button type="button" onClick={() => commitEdit(p.id)} className="rounded p-1 text-success-green hover:bg-[#e8f5f0]" aria-label="Confirm">
                          <Check size={14} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="rounded p-1 text-slate hover:bg-pale-ice" aria-label="Cancel">
                          <X size={14} aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(p.id, p.stock_quantity)}
                        className="rounded px-2 py-0.5 font-mono text-sm tabular-nums text-midnight-navy hover:bg-pale-ice hover:underline"
                        aria-label={`Edit stock for ${p.name}: ${p.stock_quantity}`}
                      >
                        {p.stock_quantity}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate">{p.low_stock_threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
