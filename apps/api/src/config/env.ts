/**
 * Environment configuration — validated at startup.
 * If a required variable is missing the process exits immediately
 * with a clear message rather than failing silently later.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: resolve(__dirname, '../../../../.env.local') })
config({ path: resolve(__dirname, '../../../../.env') })

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`[nuclara-api] Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return value
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback
}

export const env = {
  // Server
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '4000'), 10),

  // Supabase
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_JWT_SECRET: required('SUPABASE_JWT_SECRET'),

  // CORS
  ALLOWED_ORIGINS: optional('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((o) => o.trim()),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET', ''),

  // Resend
  RESEND_API_KEY: optional('RESEND_API_KEY', ''),
  EMAIL_FROM: optional('EMAIL_FROM', 'noreply@nuclara.com'),
  EMAIL_SUPPORT: optional('EMAIL_SUPPORT', 'support@nuclara.com'),

  // Groq (AI content generation — server only)
  GROQ_API_KEY: optional('GROQ_API_KEY', ''),
} as const

export const isProd = env.NODE_ENV === 'production'
export const isDev = env.NODE_ENV === 'development'
