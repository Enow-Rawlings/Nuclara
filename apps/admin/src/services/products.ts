import { api } from '@/lib/api'
import type { ApiSuccess, PaginatedResponse } from 'shared-types'

export interface AdminProduct {
  id: string
  name: string
  slug: string
  sku: string
  short_description: string | null
  long_description: string | null
  price: number
  currency: string
  status: string
  compliance_status: string
  stock_quantity: number
  low_stock_threshold: number
  is_visible: boolean
  internal_notes: string | null
  created_at: string
  updated_at: string
  product_media?: Array<{ cloudinary_url: string; display_order: number }>
}

export interface AdminProductListParams {
  page?: number
  pageSize?: number
  status?: string | undefined
  q?: string | undefined
}

export async function fetchAdminProducts(
  params: AdminProductListParams = {}
): Promise<PaginatedResponse<AdminProduct>> {
  const { data } = await api.get<PaginatedResponse<AdminProduct>>('/products/admin/all', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 24,
      ...(params.status ? { status: params.status } : {}),
      ...(params.q ? { q: params.q } : {}),
    },
  })
  return data
}

export async function fetchAdminProduct(id: string): Promise<AdminProduct> {
  const { data } = await api.get<ApiSuccess<AdminProduct>>(`/products/admin/${id}`)
  return data.data
}

export interface CreateProductPayload {
  name: string
  sku: string
  shortDescription?: string | undefined
  longDescription?: string | undefined
  price: number
  currency: string
  stockQuantity: number
  lowStockThreshold: number
  isVisible: boolean
  internalNotes?: string | undefined
}

export async function createProduct(payload: CreateProductPayload): Promise<AdminProduct> {
  const { data } = await api.post<ApiSuccess<AdminProduct>>('/products/admin', payload)
  return data.data
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  status?: string | undefined
  complianceStatus?: string | undefined
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<AdminProduct> {
  const { data } = await api.patch<ApiSuccess<AdminProduct>>(`/products/admin/${id}`, payload)
  return data.data
}
