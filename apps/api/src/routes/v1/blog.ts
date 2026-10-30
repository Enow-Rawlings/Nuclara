import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { validateBody, validateQuery } from '../../middleware/validate.js'
import { ok, paginated } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'

export const blogRouter = Router()

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/blog
 * Public — paginated list of published posts.
 */
blogRouter.get(
  '/',
  validateQuery(z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(9),
    tag: z.string().optional(),
  })),
  async (req, res, next) => {
    try {
      const { page, pageSize, tag } = req.query as unknown as { page: number; pageSize: number; tag?: string }
      const offset = (page - 1) * pageSize

      let query = supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, cover_image_url, tags, author_name, published_at', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (tag) {
        query = query.contains('tags', [tag])
      }

      const { data, count, error } = await query
      if (error) throw new ApiError(500, 'Failed to fetch blog posts')

      paginated(res, data ?? [], { page, pageSize, total: count ?? 0 })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * GET /api/v1/blog/:slug
 * Public — single published post by slug.
 */
blogRouter.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params

    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, content, cover_image_url, tags, seo_title, seo_description, author_name, published_at, created_at')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) throw new ApiError(404, 'Post not found')
    ok(res, data)
  } catch (err) {
    next(err)
  }
})

// ─── Admin routes ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/blog/admin/all
 * Admin — list all posts regardless of status.
 */
blogRouter.get(
  '/admin/all',
  requireAuth,
  requireAdminAuth,
  validateQuery(z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
    status: z.string().optional(),
    q: z.string().optional(),
  })),
  async (req, res, next) => {
    try {
      const { page, pageSize, status, q } = req.query as unknown as { page: number; pageSize: number; status?: string; q?: string }
      const offset = (page - 1) * pageSize

      let query = supabase
        .from('blog_posts')
        .select('id, slug, title, status, tags, author_name, published_at, created_at, updated_at', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (status) query = query.eq('status', status)
      if (q) query = query.ilike('title', `%${q}%`)

      const { data, count, error } = await query
      if (error) throw new ApiError(500, 'Failed to fetch blog posts')

      paginated(res, data ?? [], { page, pageSize, total: count ?? 0 })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * GET /api/v1/blog/admin/:id
 * Admin — full post for editing.
 */
blogRouter.get('/admin/:id', requireAuth, requireAdminAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error || !data) throw new ApiError(404, 'Post not found')
    ok(res, data)
  } catch (err) {
    next(err)
  }
})

const postSchema = z.object({
  title: z.string().min(1).max(300),
  excerpt: z.string().max(1000).optional(),
  content: z.string().max(50000).default(''),
  coverImageUrl: z.union([
    z.string().url(),
    z.string().max(0),  // empty string
    z.null(),
    z.undefined(),
  ]).transform(v => (v === '' || v === undefined) ? null : v).optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  authorName: z.string().max(200).optional(),
})

/**
 * POST /api/v1/blog/admin
 * Admin — create a new post.
 */
blogRouter.post(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'seo_editor', 'catalogue_manager'),
  validateBody(postSchema),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const body = req.body as z.infer<typeof postSchema>

      // Auto-generate slug from title
      const baseSlug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 200)

      let slug = baseSlug
      let attempt = 0
      while (true) {
        const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
        if (!existing) break
        slug = `${baseSlug}-${++attempt}`
      }

      // Resolve admin_users.id for author_id
      const { data: adminUser } = await supabase.from('admin_users').select('id, name').eq('auth_user_id', authReq.userId).single()

      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          slug,
          title: body.title,
          excerpt: body.excerpt ?? null,
          content: body.content,
          cover_image_url: body.coverImageUrl ?? null,
          tags: body.tags,
          status: body.status,
          seo_title: body.seoTitle ?? null,
          seo_description: body.seoDescription ?? null,
          author_id: adminUser?.id ?? null,
          author_name: body.authorName ?? adminUser?.name ?? null,
          published_at: body.status === 'published' ? now : null,
        })
        .select('id, slug, title, status, created_at')
        .single()

      if (error || !data) throw new ApiError(500, 'Failed to create post')

      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId, actor_type: 'admin', actor_email: authReq.userEmail,
        action: 'blog_post.created', entity_type: 'blog_post', entity_id: data.id,
        metadata: { title: data.title, status: data.status },
      })

      ok(res, data, 201)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/blog/admin/:id
 * Admin — update a post.
 */
blogRouter.patch(
  '/admin/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'seo_editor', 'catalogue_manager'),
  validateBody(postSchema.partial()),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const body = req.body as Partial<z.infer<typeof postSchema>>

      const updates: Record<string, unknown> = {}
      if (body.title !== undefined) updates.title = body.title
      if (body.excerpt !== undefined) updates.excerpt = body.excerpt
      if (body.content !== undefined) updates.content = body.content
      if (body.coverImageUrl !== undefined) updates.cover_image_url = body.coverImageUrl
      if (body.tags !== undefined) updates.tags = body.tags
      if (body.seoTitle !== undefined) updates.seo_title = body.seoTitle
      if (body.seoDescription !== undefined) updates.seo_description = body.seoDescription
      if (body.authorName !== undefined) updates.author_name = body.authorName
      if (body.status !== undefined) {
        updates.status = body.status
        if (body.status === 'published') {
          // Only set published_at the first time
          const { data: current } = await supabase.from('blog_posts').select('published_at').eq('id', id).single()
          if (!current?.published_at) updates.published_at = new Date().toISOString()
        }
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select('id, slug, title, status, updated_at')
        .single()

      if (error || !data) throw new ApiError(404, 'Post not found')

      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId, actor_type: 'admin', actor_email: authReq.userEmail,
        action: 'blog_post.updated', entity_type: 'blog_post', entity_id: id,
        metadata: { changes: Object.keys(updates) },
      })

      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * DELETE /api/v1/blog/admin/:id
 * Admin — delete a post (owner only).
 */
blogRouter.delete(
  '/admin/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner'),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw new ApiError(404, 'Post not found')

      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId, actor_type: 'admin', actor_email: authReq.userEmail,
        action: 'blog_post.deleted', entity_type: 'blog_post', entity_id: id, metadata: {},
      })

      ok(res, { deleted: true })
    } catch (err) {
      next(err)
    }
  }
)
