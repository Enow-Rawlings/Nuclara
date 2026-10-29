# Production Environment Variables Reference

Copy these into each platform's environment settings.
Never commit real values. Never put secrets in vercel.json or render.yaml.

---

## Vercel — Storefront project

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://api.nuclara.com/api/v1` |
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon key from Supabase → Settings → API) |

---

## Vercel — Admin project

| Key | Value |
|-----|-------|
| `VITE_ADMIN_API_BASE_URL` | `https://api.nuclara.com/api/v1` |
| `VITE_ADMIN_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_ADMIN_SUPABASE_ANON_KEY` | `eyJ...` (same anon key) |

---

## Render — API service

| Key | Notes |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (Transaction pooler) |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (**server only — never in browser**) |
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard → Account |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard → API Keys (**server only**) |
| `RESEND_API_KEY` | Resend → API Keys |
| `EMAIL_FROM` | `noreply@nuclara.com` |
| `EMAIL_SUPPORT` | `support@nuclara.com` |
| `ALLOWED_ORIGINS` | `https://nuclara.com,https://admin.nuclara.com` |
| `FRONTEND_ORIGIN` | `https://nuclara.com` |
| `ADMIN_ORIGIN` | `https://admin.nuclara.com` |
