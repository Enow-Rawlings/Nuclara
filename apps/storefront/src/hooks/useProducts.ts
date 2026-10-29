import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  fetchProducts,
  fetchProduct,
  fetchCategories,
  fetchCategory,
  type ProductListParams,
} from '@/services/products'

// Query key factories — centralised so invalidation is consistent
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string, market: string) => [...productKeys.details(), slug, market] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (slug: string) => [...categoryKeys.all, 'detail', slug] as const,
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData, // keeps previous page visible while fetching next
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useProduct(slug: string, market = 'EU') {
  return useQuery({
    queryKey: productKeys.detail(slug, market),
    queryFn: () => fetchProduct(slug, market),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // categories change infrequently
  })
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => fetchCategory(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  })
}
