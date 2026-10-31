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
 * Auto-creates missing records for published products so they always appear.
 */
seoRouter.get(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'seo_editor', 'catalogue_manager'),
  async (_req, res, next) => {
    try {
      // Auto-create missing SEO records for published products
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .eq('status', 'published')

      if (products && products.length > 0) {
        const { data: existing } = await supabase
          .from('seo_records')
          .select('entity_id')
          .eq('entity_type', 'product')
          .in('entity_id', products.map((p) => p.id))

        const existingIds = new Set((existing ?? []).map((r) => r.entity_id))
        const missing = products.filter((p) => !existingIds.has(p.id))

        if (missing.length > 0) {
          await supabase.from('seo_records').insert(
            missing.map((p) => ({
              entity_type: 'product',
              entity_id: p.id,
              robots_directive: 'index,follow',
            }))
          )
        }
      }

      // Also auto-create for visible categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_visible', true)

      if (categories && categories.length > 0) {
        const { data: existingCats } = await supabase
          .from('seo_records')
          .select('entity_id')
          .eq('entity_type', 'category')
          .in('entity_id', categories.map((c) => c.id))

        const existingCatIds = new Set((existingCats ?? []).map((r) => r.entity_id))
        const missingCats = categories.filter((c) => !existingCatIds.has(c.id))

        if (missingCats.length > 0) {
          await supabase.from('seo_records').insert(
            missingCats.map((c) => ({
              entity_type: 'category',
              entity_id: c.id,
              robots_directive: 'index,follow',
            }))
          )
        }
      }

      // Fetch all records
      const { data: records, error } = await supabase
        .from('seo_records')
        .select('id, entity_type, entity_id, seo_title, meta_description, canonical_url, robots_directive, updated_at')
        .order('entity_type')

      if (error) throw new ApiError(500, 'Failed to fetch SEO records')
      if (!records || records.length === 0) {
        ok(res, [])
        return
      }

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
 * POST /api/v1/seo/admin
 * Admin — upsert a SEO record for an entity.
 */
seoRouter.post(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'seo_editor', 'catalogue_manager'),
  validateBody(
    z.object({
      entity_type: z.enum(['product', 'category', 'page']),
      entity_id: z.string().uuid(),
      seo_title: z.string().max(70).nullable().optional(),
      meta_description: z.string().max(160).nullable().optional(),
      robots_directive: z.enum(['index,follow', 'noindex,follow', 'noindex,nofollow']).default('index,follow'),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const body = req.body as {
        entity_type: string
        entity_id: string
        seo_title?: string | null
        meta_description?: string | null
        robots_directive: string
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', authReq.userId)
        .single()

      const { data, error } = await supabase
        .from('seo_records')
        .upsert({
          entity_type: body.entity_type,
          entity_id: body.entity_id,
          seo_title: body.seo_title ?? null,
          meta_description: body.meta_description ?? null,
          robots_directive: body.robots_directive,
          updated_at: new Date().toISOString(),
          updated_by: adminUser?.id ?? null,
        }, { onConflict: 'entity_type,entity_id' })
        .select('id, entity_type, entity_id, seo_title, meta_description, robots_directive, updated_at')
        .single()

      if (error || !data) throw new ApiError(500, `Failed to upsert SEO record: ${error?.message}`)
      ok(res, data, 201)
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
  requireRole('owner', 'seo_editor', 'catalogue_manager'),
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
