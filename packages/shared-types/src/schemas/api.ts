import { z } from 'zod'

/**
 * Standard API response wrappers — match the shape returned
 * by utils/response.ts in the API app.
 */

export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  })

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    issues: z
      .array(
        z.object({
          path: z.string(),
          message: z.string(),
        })
      )
      .optional(),
  }),
})

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: z.object({
      page: z.number().int(),
      pageSize: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
  })

// Inferred types
export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = z.infer<typeof apiErrorSchema>
export type PaginatedResponse<T> = {
  success: true
  data: T[]
  meta: { page: number; pageSize: number; total: number; totalPages: number }
}
