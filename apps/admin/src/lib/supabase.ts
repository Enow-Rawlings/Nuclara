import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_ADMIN_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_ADMIN_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Nuclara Admin] Missing Supabase environment variables. ' +
      'Ensure VITE_ADMIN_SUPABASE_URL and VITE_ADMIN_SUPABASE_ANON_KEY are set.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Admin does not use magic link redirects
  },
})
