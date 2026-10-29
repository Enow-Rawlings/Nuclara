import { Router } from 'express'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'

export const customersRouter = Router()

// Helper: map DB row → admin UI shape
function mapCustomer(c: {
  id: string
  auth_user_id: string
  email: string
  name: string | null
  account_status: string
  phone: string | null
  created_at: string
}) {
  return {
    id: c.id,
    auth_user_id: c.auth_user_id,
    email: c.email,
    full_name: c.name,
    phone: c.phone,
    is_verified: c.account_status === 'active',
    created_at: c.created_at,
  }
}

/**
 * GET /api/v1/customers/admin
 * Admin — list all registered customer accounts.
 */
customersRouter.get(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'order_manager'),
  async (_req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, auth_user_id, email, name, account_status, phone, created_at')
        .order('created_at', { ascending: false })

      if (error) throw new ApiError(500, 'Failed to fetch customers')
      ok(res, (data ?? []).map(mapCustomer))
    } catch (err) {
      next(err)
    }
  }
)

/**
 * GET /api/v1/customers/admin/:id
 * Admin — single customer with their order history.
 */
customersRouter.get(
  '/admin/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'order_manager'),
  async (req, res, next) => {
    try {
      const { id } = req.params

      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, auth_user_id, email, name, account_status, phone, created_at,
          orders (
            id, public_reference, status, currency, subtotal, created_at
          )
        `)
        .eq('id', id)
        .single()

      if (error || !data) throw new ApiError(404, 'Customer not found')

      const customer = data as typeof data & {
        orders: Array<{
          id: string
          public_reference: string
          status: string
          currency: string
          subtotal: number
          created_at: string
        }>
      }

      ok(res, {
        ...mapCustomer(customer),
        orders: (customer.orders ?? []).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      })
    } catch (err) {
      next(err)
    }
  }
)
