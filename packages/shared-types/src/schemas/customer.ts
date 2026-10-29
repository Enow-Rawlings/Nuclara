import { z } from 'zod'

export const customerSchema = z.object({
  id: z.string().uuid(),
  authUserId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().max(200),
  accountStatus: z.enum(['active', 'suspended', 'pending_verification']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Customer = z.infer<typeof customerSchema>

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  name: z.string().min(1).max(200),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginInput = z.infer<typeof loginSchema>

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
})

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
