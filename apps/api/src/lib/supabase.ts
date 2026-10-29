import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

/**
 * Server-side Supabase client using the SERVICE ROLE key.
 * This client bypasses Row Level Security — it must NEVER
 * be exposed to the browser or included in any frontend bundle.
 * All access control is enforced in route/service middleware.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
