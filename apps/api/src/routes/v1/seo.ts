import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'

export const seoRouter = Router()

/**
 * GET /api/v1/seo/admin
 * Admin — list all SEO records enriched with entity name.
 */
seoRouter.get(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'seo_editor'),
  async (_req, res, next) => {
    try {
      const { data: records, error } = await supabase
        .from('seo_records')
        .select(
          'id, entity_type, entity_id, seo_title, meta_description, canonical_url, robots_directive, updated_at'
        )
        .order('entity_type')

      if (error) throw new ApiError(500, 'Failed to fetch SEO records')
      if (!records || records.length === 0) {
        ok(res, [])
        return
      }

      // Collect IDs by entity type for parallel lookups
      const productIds = records.filter((r) => r.entity_type === 'product').map((r) => r.entity_id)
      const categoryIds = records.filter((r) => r.entity_type === 'category').map((r) => r.entity_id)

      const [productResult, categoryResult] = await Promise.all([
        productIds.length
          ? supabase.from('products').select('id, name').in('id', productIds)
          : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
        categoryIds.length
          ? supabase.from('categories').select('id, name').in('id', categoryIds)
          : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
      ])

      const nameMap = new Map<string, string>([
        ...(productResult.data ?? []).map((p) => [p.id, p.name] as [string, string]),
        ...(categoryResult.data ?? []).map((c) => [c.id, c.name] as [string, string]),
      ])

      const enriched = records.map((r) => ({
        ...r,
        entity_name: nameMap.get(r.entity_id) ?? r.entity_id,
      }))

      ok(res, enriched)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/seo/admin/:id
 * Admin — update a SEO record's title, description, or robots directive.
 */
seoRouter.patch(
  '/admin/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'seo_editor'),
  validateBody(
    z.object({
      seo_title: z.string().max(70).nullable().optional(),
      meta_description: z.string().max(160).nullable().optional(),
      robots_directive: z
        .enum(['index,follow', 'noindex,follow', 'noindex,nofollow', 'index,nofollow'])
        .optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const body = req.body as {
        seo_title?: string | null
        meta_description?: string | null
        robots_directive?: string
      }

      // Resolve admin_users.id from auth_user_id for updated_by
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', authReq.userId)
        .single()

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: adminUser?.id ?? null,
      }
      if (body.seo_title !== undefined) updates.seo_title = body.seo_title
      if (body.meta_description !== undefined) updates.meta_description = body.meta_description
      if (body.robots_directive !== undefined) updates.robots_directive = body.robots_directive

      const { data, error } = await supabase
        .from('seo_records')
        .update(updates)
        .eq('id', id)
        .select('id, entity_type, entity_id, seo_title, meta_description, canonical_url, robots_directive, updated_at')
        .single()

      if (error || !data) throw new ApiError(404, 'SEO record not found')
      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)
