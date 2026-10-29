import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth, requireRole } from '../../middleware/auth.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'

export const settingsRouter = Router()

// Keys we manage. The store_settings table is a generic key/JSONB-value store.
// We map these keys to the StoreSettings shape expected by the admin UI.
const SETTING_KEYS = [
  'store_name',
  'store_currency',
  'support_email',
  'from_email',
  'default_market',
  'contact_phone',
  'address_line1',
  'address_city',
  'address_country',
] as const

type SettingKey = typeof SETTING_KEYS[number]

/**
 * GET /api/v1/settings/admin/store
 * Owner only — return assembled store settings object.
 */
settingsRouter.get(
  '/admin/store',
  requireAuth,
  requireAdminAuth,
  requireRole('owner'),
  async (_req, res, next) => {
    try {
      const { data: rows, error } = await supabase
        .from('store_settings')
        .select('key, value')
        .in('key', SETTING_KEYS as unknown as string[])

      if (error) throw new ApiError(500, 'Failed to fetch store settings')

      // Build a key→scalar map (values are stored as JSONB, extract the string value)
      const kv: Partial<Record<SettingKey, string | null>> = {}
      for (const row of rows ?? []) {
        const val = row.value
        kv[row.key as SettingKey] =
          typeof val === 'string' ? val : typeof val === 'object' && val !== null ? JSON.stringify(val) : null
      }

      ok(res, {
        store_name: kv['store_name'] ?? 'Nuclara',
        support_email: kv['support_email'] ?? '',
        from_email: kv['from_email'] ?? '',
        default_currency: kv['store_currency'] ?? 'EUR',
        default_market: kv['default_market'] ?? 'EU',
        contact_phone: kv['contact_phone'] ?? null,
        address_line1: kv['address_line1'] ?? null,
        address_city: kv['address_city'] ?? null,
        address_country: kv['address_country'] ?? null,
      })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * PATCH /api/v1/settings/admin/store
 * Owner only — upsert one or more store setting keys.
 */
settingsRouter.patch(
  '/admin/store',
  requireAuth,
  requireAdminAuth,
  requireRole('owner'),
  validateBody(
    z.object({
      store_name: z.string().min(1).max(200).optional(),
      support_email: z.string().email().max(320).optional(),
      from_email: z.string().email().max(320).optional(),
      default_currency: z.string().length(3).optional(),
      default_market: z.string().min(2).max(10).optional(),
      contact_phone: z.string().max(50).nullable().optional(),
      address_line1: z.string().max(200).nullable().optional(),
      address_city: z.string().max(100).nullable().optional(),
      address_country: z.string().max(10).nullable().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const body = req.body as Record<string, string | null | undefined>

      // Resolve admin_users.id for updated_by
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', authReq.userId)
        .single()

      // Map UI field names → DB key names
      const fieldToKey: Record<string, SettingKey> = {
        store_name: 'store_name',
        support_email: 'support_email',
        from_email: 'from_email',
        default_currency: 'store_currency',
        default_market: 'default_market',
        contact_phone: 'contact_phone',
        address_line1: 'address_line1',
        address_city: 'address_city',
        address_country: 'address_country',
      }

      const now = new Date().toISOString()
      const upsertRows = Object.entries(fieldToKey)
        .filter(([field]) => body[field] !== undefined)
        .map(([field, key]) => ({
          key,
          value: body[field] ?? null,
          updated_at: now,
          updated_by: adminUser?.id ?? null,
        }))

      if (upsertRows.length === 0) throw new ApiError(400, 'No fields to update')

      const { error } = await supabase
        .from('store_settings')
        .upsert(upsertRows, { onConflict: 'key' })

      if (error) throw new ApiError(500, `Failed to save settings: ${error.message}`)

      await supabase.from('audit_logs').insert({
        actor_id: authReq.userId,
        actor_type: 'admin',
        actor_email: authReq.userEmail,
        action: 'store_settings.updated',
        entity_type: 'settings',
        entity_id: 'store',
        metadata: { keys: upsertRows.map((r) => r.key) },
      })

      ok(res, { updated: true })
    } catch (err) {
      next(err)
    }
  }
)
