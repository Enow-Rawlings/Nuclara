import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import { validateQuery } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'

export const auditRouter = Router()

/**
 * GET /api/v1/audit/admin
 * Owner only — paginated audit event log.
 * Response shape: { data: events[], pagination: { page, pageSize, total, totalPages } }
 * wrapped inside ok() → { success: true, data: { data: [...], pagination: {...} } }
 */
auditRouter.get(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner'),
  validateQuery(
    z.object({
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(25),
    })
  ),
  async (req, res, next) => {
    try {
      const { page, pageSize } = req.query as unknown as { page: number; pageSize: number }
      const offset = (page - 1) * pageSize

      // Count first (head-only query is faster)
      const { count, error: countError } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })

      if (countError) throw new ApiError(500, 'Failed to count audit log')

      const total = count ?? 0
      const totalPages = Math.ceil(total / pageSize)

      const { data, error } = await supabase
        .from('audit_logs')
        .select(
          'id, actor_id, actor_type, actor_email, action, entity_type, entity_id, metadata, created_at'
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (error) throw new ApiError(500, 'Failed to fetch audit log')

      // Nested inside ok() so the client does data.data to get the events array
      ok(res, {
        data: data ?? [],
        pagination: { page, pageSize, total, totalPages },
      })
    } catch (err) {
      next(err)
    }
  }
)
