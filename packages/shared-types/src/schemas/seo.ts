import { z } from 'zod'

export const seoRecordSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['product', 'category', 'page']),
  entityId: z.string().uuid(),
  seoTitle: z.string().max(70).nullable(),
  metaDescription: z.string().max(160).nullable(),
  canonicalUrl: z.string().url().nullable(),
  robotsDirective: z
    .enum(['index,follow', 'noindex,follow', 'noindex,nofollow'])
    .default('index,follow'),
  socialImageUrl: z.string().url().nullable(),
  updatedAt: z.string().datetime(),
})

export type SeoRecord = z.infer<typeof seoRecordSchema>

export const updateSeoSchema = seoRecordSchema.pick({
  seoTitle: true,
  metaDescription: true,
  canonicalUrl: true,
  robotsDirective: true,
  socialImageUrl: true,
})

export type UpdateSeoInput = z.infer<typeof updateSeoSchema>
