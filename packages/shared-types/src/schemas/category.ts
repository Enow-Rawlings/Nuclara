import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  imageUrl: z.string().url().nullable(),
  parentId: z.string().uuid().nullable(),
  isVisible: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Category = z.infer<typeof categorySchema>

export const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  isVisible: z.boolean().default(true),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
