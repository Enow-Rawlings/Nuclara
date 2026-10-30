import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'
import { sendEmail } from '../../lib/resend.js'
import { baseLayout, infoBox, emailButton } from '../../lib/emails/base.js'
import { env } from '../../config/env.js'

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

// ─── Email helpers ────────────────────────────────────────────────────────────

function kycVerifiedEmail(customerName: string): string {
  const frontendUrl = env.FRONTEND_ORIGIN
  const content = `
    <h1 style="margin:0 0 8px;font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#10243A;">Account verified</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#536273;line-height:1.6;">Hi ${customerName},</p>
    ${infoBox(`<p style="margin:0;font-size:15px;color:#202A35;line-height:1.6;">
      Your Nuclara account has been reviewed and verified. You now have full access to our research peptide catalogue.
    </p>`)}
    ${emailButton('Browse the catalogue', `${frontendUrl}/shop`)}
    <p style="margin:16px 0 0;font-size:13px;color:#536273;line-height:1.5;">
      All products are supplied for research and laboratory use only. If you have any questions,
      contact us at <a href="mailto:${env.EMAIL_SUPPORT}" style="color:#087E8B;">${env.EMAIL_SUPPORT}</a>.
    </p>`
  return baseLayout(content, 'Your Nuclara account has been verified')
}

function kycSuspendedEmail(customerName: string, reason: string | undefined): string {
  const content = `
    <h1 style="margin:0 0 8px;font-family:'Manrope',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#10243A;">Account suspended</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#536273;line-height:1.6;">Hi ${customerName},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#202A35;line-height:1.6;">
      Your Nuclara account has been suspended. Access to the catalogue is currently restricted.
    </p>
    ${reason ? `<div style="border-left:3px solid #087E8B;padding-left:12px;margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#536273;font-style:italic;">${reason}</p>
    </div>` : ''}
    <p style="margin:16px 0 0;font-size:13px;color:#536273;line-height:1.5;">
      If you believe this is an error, contact us at
      <a href="mailto:${env.EMAIL_SUPPORT}" style="color:#087E8B;">${env.EMAIL_SUPPORT}</a>.
    </p>`
  return baseLayout(content, 'Update on your Nuclara account')
}

// ─── KYC status endpoint ──────────────────────────────────────────────────────

/**
 * PATCH /api/v1/customers/admin/:id/status
 * Owner / order_manager — update customer account_status for KYC workflow.
 * Sends a notification email to the customer on status change.
 */
customersRouter.patch(
  '/admin/:id/status',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'order_manager'),
  validateBody(
    z.object({
      status: z.enum(['active', 'suspended', 'pending_verification']),
      reason: z.string().max(500).optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const { status, reason } = req.body as { status: string; reason?: string }

      const { data: customer, error } = await supabase
        .from('customers')
        .update({ account_status: status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, name, email, account_status')
        .single()

      if (error || !customer) throw new ApiError(404, 'Customer not found')

      // Notify customer by email (non-blocking)
      if (status === 'active') {
        await sendEmail({
          to: customer.email,
          subject: 'Your Nuclara account has been verified',
          html: kycVerifiedEmail(customer.name ?? 'there'),
        })
      } else if (status === 'suspended') {
        await sendEmail({
          to: customer.email,
          subject: 'Update on your Nuclara account',
          html: kycSuspendedEmail(customer.name ?? 'there', reason),
        })
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'customer.status_updated',
        entity_type: 'customer',
        entity_id: id,
        metadata: { new_status: status, ...(reason ? { reason } : {}) },
      })

      ok(res, {
        id: customer.id,
        account_status: customer.account_status,
        is_verified: customer.account_status === 'active',
      })
    } catch (err) {
      next(err)
    }
  }
)
