import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'

export interface AdminOrder {
  id: string
  public_reference: string
  contact_name: string
  contact_email: string
  status: string
  payment_status: string
  currency: string
  subtotal: number
  market_code: string
  created_at: string
  updated_at?: string
  shipping_address?: Record<string, string>
  customer_notes?: string | null
  internal_notes?: string | null
  order_items?: Array<{
    id: string
    name_snapshot: string
    sku_snapshot: string
    price_snapshot: number
    currency_snapshot: string
    quantity: number
    line_total: number
  }>
}

export interface OrderStatusEvent {
  id: string
  old_status: string | null
  new_status: string
  actor_type: string
  note: string | null
  created_at: string
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const { data } = await api.get<ApiSuccess<AdminOrder[]>>('/orders/admin')
  return data.data
}

export async function fetchAdminOrder(id: string): Promise<AdminOrder> {
  const { data } = await api.get<ApiSuccess<AdminOrder>>(`/orders/admin/${id}`)
  return data.data
}

export async function updateOrderStatus(
  id: string,
  status: string,
  note?: string
): Promise<{ id: string; status: string; updatedAt: string }> {
  const { data } = await api.patch<ApiSuccess<{ id: string; status: string; updatedAt: string }>>(
    `/orders/admin/${id}/status`,
    { status, ...(note ? { note } : {}) }
  )
  return data.data
}
