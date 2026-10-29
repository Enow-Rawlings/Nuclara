import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'

export interface OrderRequestPayload {
  items: Array<{ productId: string; quantity: number }>
  contactName: string
  contactEmail: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    region?: string
    postalCode: string
    country: string
  }
  marketCode: string
  notes?: string
}

export interface OrderRequestResult {
  reference: string
  status: string
  createdAt: string
  message: string
}

export async function submitOrderRequest(
  payload: OrderRequestPayload
): Promise<OrderRequestResult> {
  const { data } = await api.post<ApiSuccess<OrderRequestResult>>('/orders', payload)
  return data.data
}

export interface MyOrder {
  id: string
  public_reference: string
  status: string
  payment_status: string
  currency: string
  subtotal: number
  created_at: string
  order_items: Array<{
    name_snapshot: string
    sku_snapshot: string
    quantity: number
    price_snapshot: number
  }>
}

export async function fetchMyOrders(): Promise<MyOrder[]> {
  const { data } = await api.get<ApiSuccess<MyOrder[]>>('/orders/my')
  return data.data
}
