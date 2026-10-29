import { Router } from 'express'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import { searchLimiter } from '../../middleware/rateLimiter.js'
import { ok, paginated } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'
import { z } from 'zod'
import { validateQuery, validateBody } from '../../middleware/validate.js'

export const productsRouter = Router()

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
  category: z.string().optional(),
  market: z.string().default('EU'),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
  q: z.string().max(200).optional(),
})

/**
 * GET /api/v1/products
 * Public catalogue — only returns published, compliance-approved products
 * eligible for the requested market. This gate is enforced server-side
 * and cannot be bypassed by the client.
 */
productsRouter.get('/', searchLimiter, validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const { page, pageSize, category, market, sort, q } = req.query as unknown as z.infer<
      typeof listQuerySchema
    >

    const offset = (page - 1) * pageSize

    let query = supabase
      .from('products')
      .select(
        `
        id, name, slug, sku, short_description, price, currency,
        status, stock_quantity,
        product_media (cloudinary_url, alt_text, display_order),
        product_market_rules!inner (eligibility_status, market_code),
        categories:product_categories (
          category:categories (id, name, slug)
        )
      `,
        { count: 'exact' }
      )
      // Compliance gate — only published + approved products
      .eq('status', 'published')
      .eq('product_market_rules.eligibility_status', 'approved')
      .eq('product_market_rules.market_code', market)
      .range(offset, offset + pageSize - 1)

    if (category) {
      query = query.eq('categories.category.slug', category)
    }

    if (q) {
      query = query.ilike('name', `%${q}%`)
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, count, error } = await query

    if (error) throw new ApiError(500, 'Failed to fetch products')

    paginated(res, data ?? [], { page, pageSize, total: count ?? 0 })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/products/:slug
 * Public product detail. Same compliance gate applies.
 */
productsRouter.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params
    const market = (req.query.market as string) ?? 'EU'

    // Fetch the product without the !inner join (Supabase !inner + .single() can
    // silently return null even when the row exists). We validate the market rule
    // in a separate query instead.
    const { data, error } = await supabase
      .from('products')
      .select(
        `
        id, name, slug, sku, short_description, long_description,
        price, currency, status, stock_quantity, low_stock_threshold,
        product_media (cloudinary_url, alt_text, display_order, width, height),
        product_market_rules (eligibility_status, market_code),
        categories:product_categories (
          category:categories (id, name, slug)
        )
      `
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    console.log(`[products/:slug] slug=${slug} market=${market} data=${JSON.stringify(data?.id)} error=${JSON.stringify(error)}`)

    if (error || !data) {
      throw new ApiError(404, 'Product not found or not available in your region')
    }

    // Compliance gate — check the market rule from the joined data
    const marketRule = (data.product_market_rules as Array<{ eligibility_status: string; market_code: string }> | null)
      ?.find((r) => r.market_code === market)

    if (!marketRule || marketRule.eligibility_status !== 'approved') {
      throw new ApiError(404, 'Product not found or not available in your region')
    }

    // Fetch SEO record separately (no FK in schema — must be a separate query)
    const { data: seoData } = await supabase
      .from('seo_records')
      .select('seo_title, meta_description, canonical_url, robots_directive')
      .eq('entity_type', 'product')
      .eq('entity_id', data.id)
      .maybeSingle()

    ok(res, { ...data, seo_records: seoData ? [seoData] : [] })
  } catch (err) {
    next(err)
  }
})

// ─── Admin product routes (require auth + admin role) ────────────────────────

/**
 * GET /api/v1/products/admin/all
 * Admin view — returns all products regardless of status.
 */
productsRouter.get(
  '/admin/all',
  requireAuth,
  requireAdminAuth,
  validateQuery(
    z.object({
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(24),
      status: z.string().optional(),
      q: z.string().max(200).optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const { page, pageSize, status, q } = req.query as unknown as {
        page: number
        pageSize: number
        status?: string
        q?: string
      }

      const offset = (page - 1) * pageSize

      let query = supabase
        .from('products')
        .select(
          `id, name, slug, sku, price, currency, status, compliance_status,
           stock_quantity, created_at, updated_at,
           product_media (cloudinary_url, display_order)`,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (status) query = query.eq('status', status)
      if (q) query = query.ilike('name', `%${q}%`)

      const { data, count, error } = await query
      if (error) throw new ApiError(500, 'Failed to fetch products')

      paginated(res, data ?? [], { page, pageSize, total: count ?? 0 })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * GET /api/v1/products/admin/:id
 * Admin — fetch a single product by id (all statuses).
 */
productsRouter.get(
  '/admin/:id',
  requireAuth,
  requireAdminAuth,
  async (req, res, next) => {
    try {
      const { id } = req.params

      const { data, error } = await supabase
        .from('products')
        .select(
          `id, name, slug, sku, short_description, long_description,
           price, currency, status, compliance_status,
           stock_quantity, low_stock_threshold, is_visible,
           internal_notes,
           compliance_reviewed_by, compliance_reviewed_at, compliance_evidence_ref,
           published_by, published_at,
           created_at, updated_at,
           product_media (id, cloudinary_url, cloudinary_public_id, alt_text, display_order, width, height),
           product_market_rules (id, market_code, eligibility_status, reviewed_at, evidence_reference, expires_at),
           categories:product_categories (
             category:categories (id, name, slug)
           )`
        )
        .eq('id', id)
        .single()

      if (error || !data) throw new ApiError(404, 'Product not found')

      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

const createProductSchema = z.object({
  name: z.string().min(1).max(300),
  sku: z.string().min(1).max(100),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().max(10000).optional(),
  price: z.number().positive(),
  currency: z.string().length(3).default('EUR'),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  isVisible: z.boolean().default(false),
  internalNotes: z.string().max(2000).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
})

/**
 * POST /api/v1/products/admin
 * Admin — create a new product. Status defaults to 'draft'.
 */
productsRouter.post(
  '/admin',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'catalogue_manager'),
  validateBody(createProductSchema),
  async (req, res, next) => {
    try {
      const authReq = req as import('../../middleware/auth.js').AuthenticatedRequest
      const body = req.body as z.infer<typeof createProductSchema>

      // Generate slug from name
      const baseSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 200)

      // Ensure slug uniqueness
      let slug = baseSlug
      let attempt = 0
      while (true) {
        const { data: existing } = await supabase
          .from('products')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()
        if (!existing) break
        attempt++
        slug = `${baseSlug}-${attempt}`
      }

      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: body.name,
          slug,
          sku: body.sku,
          short_description: body.shortDescription ?? null,
          long_description: body.longDescription ?? null,
          price: body.price,
          currency: body.currency,
          stock_quantity: body.stockQuantity,
          low_stock_threshold: body.lowStockThreshold,
          is_visible: body.isVisible,
          internal_notes: body.internalNotes ?? null,
          status: 'draft',
          compliance_status: 'not_submitted',
        })
        .select('id, name, slug, sku, price, currency, status, compliance_status, stock_quantity, created_at, updated_at')
        .single()

      if (error || !product) {
        if (error?.code === '23505') {
          throw new ApiError(409, `A product with SKU "${body.sku}" already exists`, 'CONFLICT')
        }
        throw new ApiError(500, 'Failed to create product')
      }

      // Attach categories if provided
      if (body.categoryIds?.length) {
        await supabase.from('product_categories').insert(
          body.categoryIds.map((catId) => ({ product_id: product.id, category_id: catId }))
        )
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'product.created',
        entity_type: 'product',
        entity_id: product.id,
        metadata: { name: product.name, sku: product.sku },
      })

      ok(res, product, 201)
    } catch (err) {
      next(err)
    }
  }
)

const updateProductSchema = z.object({
  name: z.string().min(1).max(300).optional(),
  sku: z.string().min(1).max(100).optional(),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().max(10000).optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
  internalNotes: z.string().max(2000).optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'published', 'archived', 'blocked']).optional(),
  complianceStatus: z.enum([
    'not_submitted', 'pending_review', 'approved', 'rejected', 'expired', 'requires_resubmission',
  ]).optional(),
})

/**
 * PATCH /api/v1/products/admin/:id
 * Admin — update product fields. Publishing requires compliance_status = 'approved'.
 */
productsRouter.patch(
  '/admin/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner', 'catalogue_manager'),
  validateBody(updateProductSchema),
  async (req, res, next) => {
    try {
      const authReq = req as import('../../middleware/auth.js').AuthenticatedRequest
      const { id } = req.params
      const body = req.body as z.infer<typeof updateProductSchema>

      // Compliance gate: cannot publish without approved compliance status
      if (body.status === 'published') {
        const { data: current } = await supabase
          .from('products')
          .select('compliance_status')
          .eq('id', id)
          .single()

        const effectiveCompliance = body.complianceStatus ?? current?.compliance_status
        if (effectiveCompliance !== 'approved') {
          throw new ApiError(
            422,
            'Cannot publish: compliance status must be "approved" before publication.',
            'COMPLIANCE_GATE'
          )
        }
      }

      // Build update payload (camelCase → snake_case)
      const updates: Record<string, unknown> = {}
      if (body.name !== undefined) updates.name = body.name
      if (body.sku !== undefined) updates.sku = body.sku
      if (body.shortDescription !== undefined) updates.short_description = body.shortDescription
      if (body.longDescription !== undefined) updates.long_description = body.longDescription
      if (body.price !== undefined) updates.price = body.price
      if (body.currency !== undefined) updates.currency = body.currency
      if (body.stockQuantity !== undefined) updates.stock_quantity = body.stockQuantity
      if (body.lowStockThreshold !== undefined) updates.low_stock_threshold = body.lowStockThreshold
      if (body.isVisible !== undefined) updates.is_visible = body.isVisible
      if (body.internalNotes !== undefined) updates.internal_notes = body.internalNotes
      if (body.status !== undefined) {
        updates.status = body.status
        if (body.status === 'published') {
          updates.published_by = authReq.userId
          updates.published_at = new Date().toISOString()
        }
      }
      if (body.complianceStatus !== undefined) {
        updates.compliance_status = body.complianceStatus
        if (body.complianceStatus === 'approved') {
          updates.compliance_reviewed_by = authReq.userId
          updates.compliance_reviewed_at = new Date().toISOString()
        }
      }

      const { data: product, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select('id, name, slug, sku, price, currency, status, compliance_status, stock_quantity, is_visible, updated_at')
        .single()

      if (error || !product) {
        if (error?.code === '23505') throw new ApiError(409, 'SKU already exists', 'CONFLICT')
        throw new ApiError(404, 'Product not found')
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'product.updated',
        entity_type: 'product',
        entity_id: id,
        metadata: { changes: Object.keys(updates) },
      })

      ok(res, product)
    } catch (err) {
      next(err)
    }
  }
)
