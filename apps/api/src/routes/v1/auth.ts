import { Router } from 'express'
import { z } from 'zod'
import { authLimiter } from '../../middleware/rateLimiter.js'
import { validateBody } from '../../middleware/validate.js'
import { requireAuth } from '../../middleware/auth.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'

export const authRouter = Router()

/**
 * POST /api/v1/auth/register
 * Customer registration. Creates a Supabase auth user and a customer profile.
 * Uses a non-enumeration response pattern — success message is identical
 * whether or not the email already exists.
 */
authRouter.post(
  '/register',
  authLimiter,
  validateBody(
    z.object({
      email: z.string().email().max(320),
      password: z.string().min(8).max(128),
      name: z.string().min(1).max(200),
    })
  ),
  async (req, res, next) => {
    try {
      const { email, password, name } = req.body as {
        email: string
        password: string
        name: string
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true,
      })

      if (error) {
        // Do not reveal if email is already registered
        ok(res, {
          message: 'If this email is available, a confirmation has been sent.',
        })
        return
      }

      if (data.user) {
        // Create customer profile
        await supabase.from('customers').insert({
          auth_user_id: data.user.id,
          email,
          name,
        })
      }

      ok(res, {
        message: 'If this email is available, a confirmation has been sent.',
      })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * GET /api/v1/auth/me
 * Returns the authenticated customer's profile.
 */
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest

    const { data, error } = await supabase
      .from('customers')
      .select('id, email, name, account_status, created_at')
      .eq('auth_user_id', authReq.userId)
      .single()

    if (error || !data) throw new ApiError(404, 'Customer profile not found')
    ok(res, data)
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/auth/password-reset-request
 * Non-enumeration: always returns the same message.
 */
authRouter.post(
  '/password-reset-request',
  authLimiter,
  validateBody(z.object({ email: z.string().email() })),
  async (req, res, next) => {
    try {
      const { email } = req.body as { email: string }
      // Supabase handles the reset email internally
      await supabase.auth.resetPasswordForEmail(email)
      ok(res, {
        message: 'If an account with that email exists, a reset link has been sent.',
      })
    } catch (err) {
      next(err)
    }
  }
)
