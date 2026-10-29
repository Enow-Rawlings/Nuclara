import { api } from '@/lib/api'
import type { PaginatedResponse, ApiSuccess } from 'shared-types'

// ─── Types matching the API response shapes ───────────────────────────────────

export interface ProductMediaItem {
  cloudinary_url: string
  alt_text: string
  display_order: number
  width: number | null
  height: number | null
}

export interface ProductListItem {
  id: string
  name: string
  slug: string
  sku: string
  short_description: string | null
  price: number
  currency: string
  stock_quantity: number
  product_media: ProductMediaItem[]
  categories: Array<{ category: { id: string; name: string; slug: string } }>
}

export interface ProductDetail extends ProductListItem {
  long_description: string | null
  seo_records: Array<{
    seo_title: string | null
    meta_description: string | null
    canonical_url: string | null
    robots_directive: string
  }>
}

export interface CategoryItem {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

export interface ProductListParams {
  page?: number | undefined
  pageSize?: number | undefined
  category?: string | undefined
  market?: string | undefined
  sort?: SortOption | undefined
  q?: string | undefined
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchProducts(
  params: ProductListParams = {}
): Promise<PaginatedResponse<ProductListItem>> {
  const { data } = await api.get<PaginatedResponse<ProductListItem>>('/products', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 24,
      market: params.market ?? 'EU',
      sort: params.sort ?? 'newest',
      ...(params.category ? { category: params.category } : {}),
      ...(params.q ? { q: params.q } : {}),
    },
  })
  return data
}

export async function fetchProduct(
  slug: string,
  market = 'EU'
): Promise<ProductDetail> {
  const { data } = await api.get<ApiSuccess<ProductDetail>>(`/products/${slug}`, {
    params: { market },
  })
  return data.data
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const { data } = await api.get<ApiSuccess<CategoryItem[]>>('/categories')
  return data.data
}

export async function fetchCategory(slug: string): Promise<CategoryItem> {
  const { data } = await api.get<ApiSuccess<CategoryItem>>(`/categories/${slug}`)
  return data.data
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPrimaryImage(media: ProductMediaItem[]): ProductMediaItem | null {
  if (!media?.length) return null
  return [...media].sort((a, b) => a.display_order - b.display_order)[0]
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price)
}

export function isInStock(qty: number): boolean {
  return qty > 0
}

export function isLowStock(qty: number, threshold: number): boolean {
  return qty > 0 && qty <= threshold
}
