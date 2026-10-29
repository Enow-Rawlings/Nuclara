import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'

export interface DashboardStats {
  ordersByStatus: Record<string, number>
  totalOrders: number
  pendingReview: number
  lowStockProducts: Array<{
    id: string
    name: string
    sku: string
    stock_quantity: number
    low_stock_threshold: number
  }>
  outOfStockCount: number
  pendingComplianceCount: number
  recentOrders: Array<{
    id: string
    public_reference: string
    contact_name: string
    status: string
    currency: string
    subtotal: number
    created_at: string
  }>
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<ApiSuccess<DashboardStats>>('/orders/admin/stats')
  return data.data
}
