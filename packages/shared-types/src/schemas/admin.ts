import { z } from 'zod'

export const adminUserSchema = z.object({
  id: z.string().uuid(),
  authUserId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().max(200),
  role: z.enum(['owner', 'catalogue_manager', 'order_manager', 'support_agent', 'seo_editor']),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type AdminUser = z.infer<typeof adminUserSchema>

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid().nullable(),
  actorEmail: z.string().email().nullable(),
  action: z.string().max(100),
  entityType: z.string().max(100),
  entityId: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
})

export type AuditLog = z.infer<typeof auditLogSchema>

export const inviteAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  role: z.enum(['catalogue_manager', 'order_manager', 'support_agent', 'seo_editor']),
})

export type InviteAdminInput = z.infer<typeof inviteAdminSchema>
