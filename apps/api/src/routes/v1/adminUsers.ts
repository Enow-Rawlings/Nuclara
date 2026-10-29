import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'

export const adminUsersRouter = Router()

/**
 * GET /api/v1/admin/users
 * Owner only — list all admin users.
 */
adminUsersRouter.get(
  '/',
  requireAuth,
  requireAdminAuth,
  requireRole('owner'),
  async (_req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, auth_user_id, email, name, role, is_active, created_at, invited_by')
        .order('created_at', { ascending: true })

      if (error) throw new ApiError(500, 'Failed to fetch admin users')
      ok(res, data ?? [])
    } catch (err) {
      next(err)
    }
  }
)

/**
 * POST /api/v1/admin/users/invite
 * Owner only — create a Supabase Auth user and an admin_users record.
 * Sends a password-reset email so the invitee sets their own password.
 */
adminUsersRouter.post(
  '/invite',
  requireAuth,
  requireAdminAuth,
  requireRole('owner'),
  validateBody(
    z.object({
      email: z.string().email().max(320),
      name: z.string().min(1).max(200),
      role: z.enum(['catalogue_manager', 'order_manager', 'support_agent', 'seo_editor']),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { email, name, role } = req.body as { email: string; name: string; role: string }

      // Check not already an admin
      const { data: existing } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existing) throw new ApiError(409, 'An admin user with that email already exists')

      // Create Supabase Auth user — they will receive a password set email
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name },
      })

      if (authError || !authData.user) {
        throw new ApiError(500, `Failed to create auth user: ${authError?.message ?? 'unknown'}`)
      }

      // Insert admin_users record
      const { data: adminUser, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          auth_user_id: authData.user.id,
          email,
          name,
          role,
          is_active: true,
          invited_by: (await supabase
            .from('admin_users')
            .select('id')
            .eq('auth_user_id', authReq.userId)
            .single()).data?.id ?? null,
        })
        .select('id, auth_user_id, email, name, role, is_active, created_at, invited_by')
        .single()

      if (insertError || !adminUser) {
        // Rollback auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw new ApiError(500, 'Failed to create admin user record')
      }

      // Send password reset so they set their own password
      await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
      })

      // Audit
      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'admin_user.invited',
        entity_type: 'admin_user',
        entity_id: adminUser.id,
        metadata: { email, role, name },
      })

      ok(res, adminUser, 201)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * GET /api/v1/admin/users/me
 * Any authenticated admin — returns their own profile.
 */
adminUsersRouter.get(
  '/me',
  requireAuth,
  requireAdminAuth,
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, auth_user_id, email, name, role, is_active, created_at')
        .eq('auth_user_id', authReq.userId)
        .single()

      if (error || !data) throw new ApiError(404, 'Admin user not found')
      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/admin/users/me
 * Any authenticated admin — update their own display name.
 */
adminUsersRouter.patch(
  '/me',
  requireAuth,
  requireAdminAuth,
  validateBody(z.object({ name: z.string().min(1).max(200) })),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { name } = req.body as { name: string }

      const { data, error } = await supabase
        .from('admin_users')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('auth_user_id', authReq.userId)
        .select('id, email, name, role')
        .single()

      if (error || !data) throw new ApiError(404, 'Admin user not found')

      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'admin_user.updated_self',
        entity_type: 'admin_user',
        entity_id: data.id,
        metadata: { field: 'name' },
      })

      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/admin/users/:id
 * Owner only — update role or active status.
 */
adminUsersRouter.patch(
  '/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner'),
  validateBody(
    z.object({
      role: z.enum(['catalogue_manager', 'order_manager', 'support_agent', 'seo_editor']).optional(),
      isActive: z.boolean().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const { role, isActive } = req.body as { role?: string; isActive?: boolean }

      // Prevent owner from demoting themselves
      const { data: self } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', authReq.userId)
        .single()

      if (self?.id === id) {
        throw new ApiError(400, 'You cannot modify your own role or status')
      }

      const updates: Record<string, unknown> = {}
      if (role !== undefined) updates.role = role
      if (isActive !== undefined) updates.is_active = isActive

      if (Object.keys(updates).length === 0) {
        throw new ApiError(400, 'No fields to update')
      }

      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', id)
        .select('id, email, name, role, is_active')
        .single()

      if (error || !data) throw new ApiError(404, 'Admin user not found')

      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'admin_user.updated',
        entity_type: 'admin_user',
        entity_id: id,
        metadata: { changes: Object.keys(updates) },
      })

      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * DELETE /api/v1/admin/users/:id
 * Owner only — deactivate (soft delete) an admin user.
 * Does not delete the Supabase Auth account — just revokes admin access.
 */
adminUsersRouter.delete(
  '/:id',
  requireAuth,
  requireAdminAuth,
  requireRole('owner'),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params

      const { data: self } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', authReq.userId)
        .single()

      if (self?.id === id) {
        throw new ApiError(400, 'You cannot revoke your own access')
      }

      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw new ApiError(404, 'Admin user not found')

      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'admin_user.revoked',
        entity_type: 'admin_user',
        entity_id: id,
        metadata: {},
      })

      ok(res, { revoked: true })
    } catch (err) {
      next(err)
    }
  }
)
