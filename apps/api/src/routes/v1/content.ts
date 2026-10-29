import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'

export const contentRouter = Router()

/**
 * GET /api/v1/content/admin
 * Admin — list all content blocks.
 * Returns [] gracefully if the content_blocks table doesn't exist yet.
 */
contentRouter.get(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'seo_editor'),
  async (_req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('id, key, label, value, type, is_active, updated_at')
        .order('key')

      // If the table doesn't exist the error code will be 42P01 (undefined_table)
      if (error) {
        if ((error as { code?: string }).code === '42P01') {
          ok(res, [])
          return
        }
        throw new ApiError(500, 'Failed to fetch content blocks')
      }

      ok(res, data ?? [])
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/content/admin/:id
 * Admin — update the value of a content block.
 */
contentRouter.patch(
  '/admin/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'seo_editor'),
  validateBody(z.object({ value: z.string().max(5000) })),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const { value } = req.body as { value: string }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', authReq.userId)
        .single()

      const { data, error } = await supabase
        .from('content_blocks')
        .update({
          value,
          updated_at: new Date().toISOString(),
          updated_by: adminUser?.id ?? null,
        })
        .eq('id', id)
        .select('id, key, label, value, type, is_active, updated_at')
        .single()

      if (error || !data) throw new ApiError(404, 'Content block not found')
      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)
