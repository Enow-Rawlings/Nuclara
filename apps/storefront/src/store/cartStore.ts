import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductListItem } from '@/services/products'

export interface CartItem {
  productId: string
  name: string
  slug: string
  sku: string
  price: number
  currency: string
  quantity: number
  imageUrl: string | null
  imageAlt: string
  // Snapshot of stock at time of add — server revalidates on submit
  stockQuantity: number
}

interface CartState {
  items: CartItem[]
  // Actions
  addItem: (product: ProductListItem, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  // Derived
  totalItems: () => number
  subtotal: () => number
  currency: () => string
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id)
          if (existing) {
            // Increment — cap at available stock
            const newQty = Math.min(
              existing.quantity + quantity,
              product.stock_quantity
            )
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: newQty } : i
              ),
            }
          }

          const primaryMedia = product.product_media
            ?.sort((a, b) => a.display_order - b.display_order)[0]

          const newItem: CartItem = {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            price: product.price,
            currency: product.currency,
            quantity: Math.min(quantity, product.stock_quantity),
            imageUrl: primaryMedia?.cloudinary_url ?? null,
            imageAlt: primaryMedia?.alt_text ?? product.name,
            stockQuantity: product.stock_quantity,
          }

          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.stockQuantity) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      currency: () => get().items[0]?.currency ?? 'EUR',
    }),
    {
      name: 'nuclara-cart',
      // Only persist the items array — recompute derived state on hydration
      partialize: (state) => ({ items: state.items }),
    }
  )
)
