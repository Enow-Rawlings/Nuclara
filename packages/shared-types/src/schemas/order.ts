import { z } from 'zod'

// ─── Shipping address ─────────────────────────────────────────────────────────

export const shippingAddressSchema = z.object({
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  region: z.string().max(100).optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2), // ISO 3166-1 alpha-2
})

export type ShippingAddress = z.infer<typeof shippingAddressSchema>

// ─── Order item ───────────────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().uuid().nullable(), // nullable — product may be archived later
  skuSnapshot: z.string(),
  nameSnapshot: z.string(),
  priceSnapshot: z.number(),
  currencySnapshot: z.string().length(3),
  quantity: z.number().int().min(1),
  lineTotal: z.number(),
})

export type OrderItem = z.infer<typeof orderItemSchema>

// ─── Order status event ───────────────────────────────────────────────────────

export const orderStatusEventSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  oldStatus: z.string().nullable(),
  newStatus: z.string(),
  actorId: z.string().nullable(),
  actorType: z.enum(['customer', 'admin', 'system']),
  note: z.string().max(500).nullable(),
  createdAt: z.string().datetime(),
})

export type OrderStatusEvent = z.infer<typeof orderStatusEventSchema>

// ─── Order ────────────────────────────────────────────────────────────────────

export const orderSchema = z.object({
  id: z.string().uuid(),
  publicReference: z.string(),
  customerId: z.string().uuid().nullable(),
  contactName: z.string(),
  contactEmail: z.string().email(),
  shippingAddress: shippingAddressSchema,
  marketCode: z.string(),
  status: z.enum([
    'pending_review',
    'under_review',
    'awaiting_payment',
    'processing',
    'fulfilled',
    'completed',
    'cancelled',
    'rejected',
  ]),
  /**
   * Payment status: 'not_configured' is the only valid value in Phase 1.
   * Never set to 'confirmed' without a verified payment provider integration.
   */
  paymentStatus: z.enum(['not_configured', 'pending', 'confirmed', 'failed', 'refunded']),
  currency: z.string().length(3),
  subtotal: z.number(),
  customerNotes: z.string().max(1000).nullable(),
  items: z.array(orderItemSchema).optional(),
  statusHistory: z.array(orderStatusEventSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Order = z.infer<typeof orderSchema>

// ─── Create order request (storefront → API) ──────────────────────────────────

export const createOrderRequestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(999),
      })
    )
    .min(1)
    .max(50),
  contactName: z.string().min(1).max(200),
  contactEmail: z.string().email().max(320),
  shippingAddress: shippingAddressSchema,
  marketCode: z.string().min(2).max(10).default('EU'),
  notes: z.string().max(1000).optional(),
})

export type CreateOrderRequestInput = z.infer<typeof createOrderRequestSchema>

// ─── Update order status (admin → API) ───────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending_review',
    'under_review',
    'awaiting_payment',
    'processing',
    'fulfilled',
    'completed',
    'cancelled',
    'rejected',
  ]),
  note: z.string().max(500).optional(),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
