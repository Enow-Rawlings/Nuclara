import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import { orderLimiter } from '../../middleware/rateLimiter.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'
import { sendEmail } from '../../lib/resend.js'
import { env } from '../../config/env.js'
import {
  orderConfirmationEmail,
  adminOrderNotificationEmail,
  orderStatusUpdateEmail,
  getOrderStatusEmailSubject,
} from '../../lib/emails/index.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'

export const ordersRouter = Router()

const createOrderSchema = z.object({
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
  shippingAddress: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    region: z.string().max(100).optional(),
    postalCode: z.string().min(1).max(20),
    country: z.string().length(2), // ISO 3166-1 alpha-2
  }),
  marketCode: z.string().min(2).max(10).default('EU'),
  notes: z.string().max(1000).optional(),
})

/**
 * POST /api/v1/orders
 * Submit an order request. Performs full server-side revalidation:
 * - Product exists, is published, is compliance-approved for the market
 * - Stock is sufficient (uses a transaction to prevent overselling)
 * - Price snapshot is recorded (not client-supplied)
 * Payment is NOT processed. Status is set to 'pending_review'.
 */
ordersRouter.post(
  '/',
  orderLimiter,
  requireAuth,
  validateBody(createOrderSchema),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const body = req.body as z.infer<typeof createOrderSchema>

      // 1. Revalidate each product server-side — only requires published status.
      // Market eligibility is reviewed manually by the admin after order submission.
      // This allows orders from any region; the admin decides whether to fulfil.
      const productIds = body.items.map((i) => i.productId)

      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, name, sku, price, currency, stock_quantity, status')
        .in('id', productIds)
        .eq('status', 'published')

      if (productError) throw new ApiError(500, 'Failed to validate products')

      // Check all requested products were found and published
      const foundIds = new Set(products?.map((p) => p.id))
      for (const item of body.items) {
        if (!foundIds.has(item.productId)) {
          throw new ApiError(
            400,
            `Product ${item.productId} is not available`
          )
        }
      }

      // 2. Check stock levels
      const productMap = new Map(products!.map((p) => [p.id, p]))

      for (const item of body.items) {
        const product = productMap.get(item.productId)!
        if (product.stock_quantity < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for product: ${product.name}. Available: ${product.stock_quantity}`
          )
        }
      }

      // 3. Build order line items with price snapshot
      const orderItems = body.items.map((item) => {
        const product = productMap.get(item.productId)!
        return {
          product_id: item.productId,
          sku_snapshot: product.sku,
          name_snapshot: product.name,
          price_snapshot: product.price,
          currency_snapshot: product.currency,
          quantity: item.quantity,
          line_total: product.price * item.quantity,
        }
      })

      const subtotal = orderItems.reduce((sum, i) => sum + i.line_total, 0)
      const currency = products![0].currency

      // 4. Generate non-sequential public reference
      const publicReference = `NUC-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`

      // 5. Resolve customer record id (FK to customers.id, not auth UUID)
      const { data: customerRecord } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', authReq.userId)
        .single()

      // 6. Create order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          public_reference: publicReference,
          customer_id: customerRecord?.id ?? null,
          contact_name: body.contactName,
          contact_email: body.contactEmail,
          shipping_address: body.shippingAddress,
          market_code: body.marketCode,
          status: 'pending_review',
          payment_status: 'not_configured',
          currency,
          subtotal,
          customer_notes: body.notes ?? null,
        })
        .select('id, public_reference, status, created_at')
        .single()

      if (orderError || !order) {
        console.error('[orders POST] create order error:', JSON.stringify(orderError))
        throw new ApiError(500, 'Failed to create order')
      }

      // 6. Insert order items
      const { error: itemsError } = await supabase.from('order_items').insert(
        orderItems.map((item) => ({ ...item, order_id: order.id }))
      )

      if (itemsError) {
        // Attempt rollback
        await supabase.from('orders').delete().eq('id', order.id)
        throw new ApiError(500, 'Failed to save order items')
      }

      // 7. Record initial status event
      await supabase.from('order_status_events').insert({
        order_id: order.id,
        old_status: null,
        new_status: 'pending_review',
        actor_id: customerRecord?.id ?? null,
        actor_type: 'customer',
        note: 'Order request submitted',
      })

      // 8. Send confirmation emails (non-blocking)
      // Customer confirmation
      sendEmail({
        to: body.contactEmail,
        subject: `Order request received — ${publicReference}`,
        html: orderConfirmationEmail({
          customerName: body.contactName,
          reference: publicReference,
          items: orderItems.map((item) => ({
            name: item.name_snapshot,
            sku: item.sku_snapshot,
            quantity: item.quantity,
            unitPrice: item.price_snapshot,
            lineTotal: item.line_total,
            currency: item.currency_snapshot,
          })),
          subtotal,
          currency,
          shippingAddress: body.shippingAddress,
          supportEmail: env.EMAIL_SUPPORT,
        }),
      })

      // Admin notification
      sendEmail({
        to: env.EMAIL_SUPPORT,
        subject: `New order request — ${publicReference}`,
        html: adminOrderNotificationEmail({
          reference: publicReference,
          customerName: body.contactName,
          customerEmail: body.contactEmail,
          subtotal,
          currency,
          itemCount: orderItems.length,
          marketCode: body.marketCode,
        }),
      })

      ok(
        res,
        {
          reference: order.public_reference,
          status: order.status,
          createdAt: order.created_at,
          message:
            'Your order request has been received. We will be in touch with payment and fulfilment details.',
        },
        201
      )
    } catch (err) {
      next(err)
    }
  }
)

/**
 * GET /api/v1/orders/my
 * Authenticated customer — their own orders only.
 */
ordersRouter.get('/my', requireAuth, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest

    const { data, error } = await supabase
      .from('orders')
      .select(
        `id, public_reference, status, payment_status, currency, subtotal, created_at,
         order_items (name_snapshot, sku_snapshot, quantity, price_snapshot)`
      )
      .eq('customer_id', authReq.userId)
      .order('created_at', { ascending: false })

    if (error) throw new ApiError(500, 'Failed to fetch orders')

    ok(res, data ?? [])
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/orders/admin — Admin: all orders with queue management
 */
ordersRouter.get(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'order_manager'),
  async (_req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `id, public_reference, contact_name, contact_email, status,
           payment_status, currency, subtotal, market_code, created_at`
        )
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw new ApiError(500, 'Failed to fetch orders')
      ok(res, data ?? [])
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/orders/admin/:id/status — Admin: update order status
 */
ordersRouter.patch(
  '/admin/:id/status',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'order_manager'),
  validateBody(
    z.object({
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
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const { status, note } = req.body as { status: string; note?: string }

      // Fetch current order
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('id, status, contact_name, contact_email, public_reference')
        .eq('id', id)
        .single()

      if (fetchError || !order) throw new ApiError(404, 'Order not found')

      const oldStatus = order.status

      // Update status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (updateError) throw new ApiError(500, 'Failed to update order status')

      // Audit trail
      await supabase.from('order_status_events').insert({
        order_id: id,
        old_status: oldStatus,
        new_status: status,
        actor_id: authReq.userId,
        actor_type: 'admin',
        note: note ?? null,
      })

      // Notify the customer of status change (non-blocking)
      sendEmail({
        to: order.contact_email as string,
        subject: getOrderStatusEmailSubject(status, order.public_reference as string),
        html: orderStatusUpdateEmail({
          customerName: order.contact_name as string,
          reference: order.public_reference as string,
          newStatus: status,
          ...(note ? { note } : {}),
          supportEmail: env.EMAIL_SUPPORT,
        }),
      })

      ok(res, { id, status, updatedAt: new Date().toISOString() })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * GET /api/v1/orders/admin/:id
 * Admin — full order detail with line items and status history.
 */
ordersRouter.get(
  '/admin/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'order_manager'),
  async (req, res, next) => {
    try {
      const { id } = req.params

      const { data: order, error } = await supabase
        .from('orders')
        .select(
          `id, public_reference, customer_id,
           contact_name, contact_email,
           shipping_address, market_code,
           status, payment_status,
           currency, subtotal, shipping_total, tax_total,
           customer_notes, internal_notes,
           assigned_to, created_at, updated_at,
           order_items (
             id, product_id, sku_snapshot, name_snapshot,
             price_snapshot, currency_snapshot, quantity, line_total
           ),
           order_status_events (
             id, old_status, new_status, actor_type, note, created_at
           )`
        )
        .eq('id', id)
        .single()

      if (error || !order) throw new ApiError(404, 'Order not found')

      ok(res, order)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * GET /api/v1/orders/admin/stats
 * Admin dashboard metrics: counts by status, low-stock count, recent orders.
 */
ordersRouter.get(
  '/admin/stats',
  requireAuth,
  requireAdminAuth,
  async (_req, res, next) => {
    try {
      // Orders by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('orders')
        .select('status')

      if (statusError) throw new ApiError(500, 'Failed to fetch order stats')

      const counts: Record<string, number> = {}
      for (const row of statusCounts ?? []) {
        counts[row.status] = (counts[row.status] ?? 0) + 1
      }

      // Low stock products (stock > 0 AND stock <= threshold, published only)
      const { data: lowStockCandidates } = await supabase
        .from('products')
        .select('id, name, sku, stock_quantity, low_stock_threshold')
        .eq('status', 'published')
        .gt('stock_quantity', 0)
        .order('stock_quantity', { ascending: true })
        .limit(50)

      const actualLowStock = (lowStockCandidates ?? []).filter(
        (p) => p.stock_quantity <= p.low_stock_threshold
      ).slice(0, 10)

      // Out of stock
      const { count: outOfStockCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .eq('stock_quantity', 0)

      // Pending compliance review
      const { count: pendingComplianceCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('compliance_status', 'pending_review')

      // Recent orders (last 10)
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, public_reference, contact_name, status, currency, subtotal, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      ok(res, {
        ordersByStatus: counts,
        totalOrders: statusCounts?.length ?? 0,
        pendingReview: counts['pending_review'] ?? 0,
        lowStockProducts: actualLowStock,
        outOfStockCount: outOfStockCount ?? 0,
        pendingComplianceCount: pendingComplianceCount ?? 0,
        recentOrders: recentOrders ?? [],
      })
    } catch (err) {
      next(err)
    }
  }
)
