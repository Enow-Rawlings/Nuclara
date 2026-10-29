import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { sendEmail } from '../../lib/resend.js'
import { isProd } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  orderConfirmationEmail,
  orderStatusUpdateEmail,
  passwordResetEmail,
  adminOrderNotificationEmail,
} from '../../lib/emails/index.js'

export const emailTestRouter = Router()

/**
 * POST /api/v1/email-test
 * Admin/owner only. Development + staging only (blocked in production).
 * Sends a test email of the requested template to verify Resend is configured.
 */
emailTestRouter.post(
  '/',
  requireAuth,
  requireAdminAuth,
  requireRole('owner'),
  validateBody(
    z.object({
      to: z.string().email(),
      template: z.enum([
        'order_confirmation',
        'order_status_update',
        'password_reset',
        'admin_notification',
      ]),
    })
  ),
  async (req, res, next) => {
    try {
      if (isProd) {
        throw new ApiError(403, 'Email test endpoint is disabled in production')
      }

      const { to, template } = req.body as { to: string; template: string }
      const testRef = 'NUC-TEST-000001'

      let subject: string
      let html: string

      switch (template) {
        case 'order_confirmation':
          subject = `[TEST] Order request received — ${testRef}`
          html = orderConfirmationEmail({
            customerName: 'Test Customer',
            reference: testRef,
            items: [
              { name: 'BPC-157 (5mg)', sku: 'NUC-BPC157-5', quantity: 2, unitPrice: 42.00, lineTotal: 84.00, currency: 'EUR' },
              { name: 'TB-500 (5mg)', sku: 'NUC-TB500-5', quantity: 1, unitPrice: 48.00, lineTotal: 48.00, currency: 'EUR' },
            ],
            subtotal: 132.00,
            currency: 'EUR',
            shippingAddress: { line1: '123 Test Street', city: 'Berlin', postalCode: '10115', country: 'DE' },
          })
          break

        case 'order_status_update':
          subject = `[TEST] Order status update — ${testRef}`
          html = orderStatusUpdateEmail({
            customerName: 'Test Customer',
            reference: testRef,
            newStatus: 'awaiting_payment',
            note: 'This is a test note from the admin.',
          })
          break

        case 'password_reset':
          subject = '[TEST] Reset your password'
          html = passwordResetEmail({ resetUrl: 'https://nuclara.com/account/reset-password?token=test-token-123' })
          break

        case 'admin_notification':
          subject = `[TEST] New order request — ${testRef}`
          html = adminOrderNotificationEmail({
            reference: testRef,
            customerName: 'Test Customer',
            customerEmail: to,
            subtotal: 132.00,
            currency: 'EUR',
            itemCount: 2,
            marketCode: 'EU',
          })
          break

        default:
          throw new ApiError(400, 'Unknown template')
      }

      await sendEmail({ to, subject, html })

      ok(res, { sent: true, to, template, subject })
    } catch (err) {
      next(err)
    }
  }
)
