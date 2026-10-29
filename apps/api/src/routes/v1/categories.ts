import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'

export const categoriesRouter = Router()

// ─── Admin routes (must be before /:slug param routes) ───────────────────────

/**
 * GET /api/v1/categories/admin/all
 * Admin — returns all categories regardless of visibility.
 */
categoriesRouter.get(
  '/admin/all',
  requireAuth,
  requireAdminAuth,
  async (_req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url, parent_id, is_visible, sort_order, created_at, updated_at')
        .order('name')

      if (error) throw new ApiError(500, 'Failed to fetch categories')
      ok(res, data ?? [])
    } catch (err) {
      next(err)
    }
  }
)

/**
 * POST /api/v1/categories/admin
 * Admin — create a new category. Slug is auto-generated from name.
 */
categoriesRouter.post(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'catalogue_manager'),
  validateBody(
    z.object({
      name: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      is_visible: z.boolean().default(true),
      parent_id: z.string().uuid().optional(),
      sort_order: z.number().int().default(0),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const body = req.body as {
        name: string
        description?: string
        is_visible: boolean
        parent_id?: string
        sort_order: number
      }

      // Generate slug from name, ensure uniqueness
      const baseSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 200)

      let slug = baseSlug
      let attempt = 0
      while (true) {
        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()
        if (!existing) break
        attempt++
        slug = `${baseSlug}-${attempt}`
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: body.name,
          slug,
          description: body.description ?? null,
          is_visible: body.is_visible,
          parent_id: body.parent_id ?? null,
          sort_order: body.sort_order,
        })
        .select('id, name, slug, description, image_url, parent_id, is_visible, sort_order, created_at')
        .single()

      if (error || !data) {
        if (error?.code === '23505') throw new ApiError(409, 'A category with that name already exists')
        throw new ApiError(500, 'Failed to create category')
      }

      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'category.created',
        entity_type: 'category',
        entity_id: data.id,
        metadata: { name: data.name, slug: data.slug },
      })

      ok(res, data, 201)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/categories/admin/:id
 * Admin — update a category. Regenerates slug if name changes.
 */
categoriesRouter.patch(
  '/admin/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'catalogue_manager'),
  validateBody(
    z.object({
      name: z.string().min(1).max(200).optional(),
      description: z.string().max(2000).nullable().optional(),
      is_visible: z.boolean().optional(),
      image_url: z.string().url().nullable().optional(),
      sort_order: z.number().int().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const body = req.body as {
        name?: string
        description?: string | null
        is_visible?: boolean
        image_url?: string | null
        sort_order?: number
      }

      const updates: Record<string, unknown> = {}
      if (body.name !== undefined) {
        updates.name = body.name
        // Regenerate slug from new name
        updates.slug = body.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 200)
      }
      if (body.description !== undefined) updates.description = body.description
      if (body.is_visible !== undefined) updates.is_visible = body.is_visible
      if (body.image_url !== undefined) updates.image_url = body.image_url
      if (body.sort_order !== undefined) updates.sort_order = body.sort_order

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select('id, name, slug, description, image_url, parent_id, is_visible, sort_order, updated_at')
        .single()

      if (error || !data) throw new ApiError(404, 'Category not found')

      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'category.updated',
        entity_type: 'category',
        entity_id: id,
        metadata: { changes: Object.keys(updates) },
      })

      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

// ─── Public routes ────────────────────────────────────────────────────────────

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, parent_id')
      .eq('is_visible', true)
      .order('name')

    if (error) throw new ApiError(500, 'Failed to fetch categories')
    ok(res, data ?? [])
  } catch (err) {
    next(err)
  }
})

/** GET /api/v1/categories/:slug */
categoriesRouter.get('/:slug', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, parent_id')
      .eq('slug', req.params.slug)
      .eq('is_visible', true)
      .single()

    if (error || !data) throw new ApiError(404, 'Category not found')
    ok(res, data)
  } catch (err) {
    next(err)
  }
})
