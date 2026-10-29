import { z } from 'zod'

// ─── Product media ────────────────────────────────────────────────────────────

export const productMediaSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  cloudinaryPublicId: z.string(),
  cloudinaryUrl: z.string().url(),
  altText: z.string().max(200),
  displayOrder: z.number().int().min(0),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
})

export type ProductMedia = z.infer<typeof productMediaSchema>

// ─── Market rule ─────────────────────────────────────────────────────────────

export const productMarketRuleSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  marketCode: z.string().min(2).max(10),
  eligibilityStatus: z.enum(['approved', 'blocked', 'pending_review', 'not_applicable']),
  reviewedBy: z.string().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  evidenceReference: z.string().max(500).nullable(),
  expiresAt: z.string().datetime().nullable(),
})

export type ProductMarketRule = z.infer<typeof productMarketRuleSchema>

// ─── Product ──────────────────────────────────────────────────────────────────

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(300),
  sku: z.string().min(1).max(100),
  shortDescription: z.string().max(500).nullable(),
  longDescription: z.string().max(10000).nullable(),
  price: z.number().positive(),
  currency: z.string().length(3), // ISO 4217
  status: z.enum(['draft', 'pending_review', 'approved', 'published', 'archived', 'blocked']),
  complianceStatus: z.enum([
    'not_submitted',
    'pending_review',
    'approved',
    'rejected',
    'expired',
    'requires_resubmission',
  ]),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0),
  isVisible: z.boolean(),
  media: z.array(productMediaSchema).optional(),
  marketRules: z.array(productMarketRuleSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Product = z.infer<typeof productSchema>

// ─── Public product (safe subset returned to storefront) ─────────────────────

export const publicProductSchema = productSchema.pick({
  id: true,
  name: true,
  slug: true,
  sku: true,
  shortDescription: true,
  longDescription: true,
  price: true,
  currency: true,
  stockQuantity: true,
  media: true,
  createdAt: true,
})

export type PublicProduct = z.infer<typeof publicProductSchema>

// ─── Create / update product (admin) ─────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1).max(300),
  sku: z.string().min(1).max(100),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().max(10000).optional(),
  price: z.number().positive(),
  currency: z.string().length(3).default('EUR'),
  categoryIds: z.array(z.string().uuid()).optional(),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  isVisible: z.boolean().default(false),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema.partial().extend({
  status: z
    .enum(['draft', 'pending_review', 'approved', 'published', 'archived', 'blocked'])
    .optional(),
  complianceStatus: z
    .enum([
      'not_submitted',
      'pending_review',
      'approved',
      'rejected',
      'expired',
      'requires_resubmission',
    ])
    .optional(),
})

export type UpdateProductInput = z.infer<typeof updateProductSchema>
