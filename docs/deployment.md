# Nuclara — Deployment Guide

## Overview

| Service | Platform | URL |
|---------|----------|-----|
| Storefront | Vercel | `https://nuclara.com` |
| Admin | Vercel (separate project) | `https://admin.nuclara.com` |
| API | Render | `https://api.nuclara.com` |
| Database | Supabase (PostgreSQL) | Managed |
| Media | Cloudinary | Managed |
| Email | Resend | Managed |

---

## Prerequisites

Before deploying, ensure you have:
- [ ] Supabase project created and all 13 migrations applied
- [ ] Cloudinary account with `nuclara_products` upload preset configured
- [ ] Resend account with sending domain verified
- [ ] Domain purchased and DNS accessible
- [ ] GitHub repository connected (Vercel and Render deploy from Git)

---

## Step 1 — Deploy the API to Render

### Create the service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `nuclara-api`
   - **Root directory:** leave blank (Render reads `render.yaml`)
   - **Build command:** `pnpm install --allow-build=esbuild && pnpm --filter api build`
   - **Start command:** `node apps/api/dist/index.js`
   - **Health check path:** `/api/v1/health`
   - **Region:** Frankfurt (EU) — change if your market is elsewhere

### Set environment variables in Render dashboard

Go to **Environment** tab and add each variable. Never put real values in `render.yaml`.

| Variable | Where to find it |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (Transaction mode) |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key (**never expose to browser**) |
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard (**server only**) |
| `RESEND_API_KEY` | Resend → API Keys |
| `EMAIL_FROM` | e.g. `noreply@nuclara.com` |
| `EMAIL_SUPPORT` | e.g. `support@nuclara.com` |
| `ALLOWED_ORIGINS` | `https://nuclara.com,https://admin.nuclara.com` |
| `FRONTEND_ORIGIN` | `https://nuclara.com` |
| `ADMIN_ORIGIN` | `https://admin.nuclara.com` |

### Verify

After first deploy, visit: `https://api.nuclara.com/api/v1/health`

Expected response:
```json
{ "success": true, "data": { "status": "ok", "database": "connected" } }
```

---

## Step 2 — Deploy the Storefront to Vercel

### Create the project

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
2. Configure:
   - **Framework:** Vite
   - **Root directory:** `apps/storefront`
   - **Build command:** `pnpm --filter storefront build`
   - **Output directory:** `dist`
   - **Install command:** `pnpm install --allow-build=esbuild`

### Environment variables (Vercel → Settings → Environment Variables)

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://api.nuclara.com/api/v1` |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (safe for browser) |

### Custom domain

1. Vercel → Domains → Add `nuclara.com` and `www.nuclara.com`
2. Add the DNS records Vercel gives you at your registrar
3. Enable HTTPS (automatic via Vercel)

---

## Step 3 — Deploy the Admin to Vercel

### Create a **separate** Vercel project

The admin must be a completely separate Vercel project — different URL, different env vars, different deployment.

1. **New Project** → same repo, different configuration:
   - **Root directory:** `apps/admin`
   - **Build command:** `pnpm --filter admin build`
   - **Output directory:** `dist`
   - **Install command:** `pnpm install --allow-build=esbuild`

### Environment variables

| Variable | Value |
|----------|-------|
| `VITE_ADMIN_API_BASE_URL` | `https://api.nuclara.com/api/v1` |
| `VITE_ADMIN_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_ADMIN_SUPABASE_ANON_KEY` | Supabase anon key |

### Custom domain

Add `admin.nuclara.com` as a custom domain in this separate Vercel project.

### Access restriction (important)

The admin is protected by Supabase Auth + server-side role checks. For an extra layer of protection, consider enabling **Vercel Password Protection** on the admin project (Vercel Pro feature) or using **Vercel Access** to restrict by email domain.

---

## Step 4 — DNS Configuration

Point these records at your registrar:

| Record | Type | Value |
|--------|------|-------|
| `@` / `nuclara.com` | A / CNAME | Vercel (storefront) |
| `www` | CNAME | Vercel (storefront) |
| `admin` | CNAME | Vercel (admin) |
| `api` | CNAME | Render |
| `_dkim.*` | TXT | Resend DKIM record |
| `@` SPF | TXT | Resend SPF record |
| `_dmarc` | TXT | Resend DMARC record |

---

## Step 5 — Supabase Production Settings

1. **Auth → URL Configuration:**
   - Site URL: `https://nuclara.com`
   - Redirect URLs: add `https://nuclara.com/**` and `https://admin.nuclara.com/**`

2. **Auth → Email Templates:** customise the confirmation and reset emails to match your brand

3. **Database → Connection Pooling:** use **Transaction mode** for the `DATABASE_URL` (better for serverless/short-lived connections)

4. **Storage:** not used — media is on Cloudinary

---

## Step 6 — Production Smoke Tests

Run these manually after each deployment. Every item must pass before announcing the site.

### API
- [ ] `GET /api/v1/health` → `{ status: ok, database: connected }`
- [ ] `GET /api/v1/products?market=EU` → returns products (not an empty array)
- [ ] `GET /api/v1/categories` → returns categories
- [ ] `GET /api/v1/sitemap.xml` → valid XML with product URLs
- [ ] `GET /api/v1/robots.txt` → contains `Disallow: /api/`

### Storefront
- [ ] Homepage loads with real products and categories
- [ ] `/shop` shows product grid
- [ ] `/product/bpc-157-5mg` loads with real data
- [ ] Add to cart → cart badge updates
- [ ] Search for "BPC" → returns results
- [ ] `/account/login` → login form renders, sign-in works
- [ ] Submit an order request → confirmation page shown, reference displayed
- [ ] Check email inbox — order confirmation received
- [ ] Chat launcher appears, message submits successfully
- [ ] Responsive on mobile (360px width)
- [ ] No console errors in production build

### Admin
- [ ] `admin.nuclara.com/login` renders, sign-in works
- [ ] Dashboard shows real data (orders, stock)
- [ ] Products list renders with compliance badges
- [ ] Create a test product → appears in list as draft
- [ ] Order queue shows the test order from storefront
- [ ] Update order status → customer receives status email
- [ ] Users settings → current admin user shown
- [ ] Live chat inbox → test message from storefront appears

### Security
- [ ] `admin.nuclara.com` unauthenticated → redirects to login
- [ ] API admin endpoint without token → 401
- [ ] API admin endpoint with customer token → 403
- [ ] No secrets in browser network tab (check for `service_role`, `api_secret`)
- [ ] No secrets in JS bundles (`grep -r "supabase.co" apps/*/dist` should only show URL, not key)
- [ ] HTTPS on all three domains
- [ ] `X-Frame-Options: DENY` header present (check in browser DevTools → Network → Response headers)

### SEO
- [ ] `<title>` tag changes between pages
- [ ] `<meta name="description">` present on product pages
- [ ] `/sitemap.xml` accessible and contains only published products
- [ ] Structured data validates on a product page (Google Rich Results Test)
- [ ] Admin (`admin.nuclara.com`) has `noindex` header

---

## Rollback Procedure

**Vercel:** Go to the project → Deployments → find the last working deployment → **Promote to Production**

**Render:** Go to the service → Deploys → find the last working deploy → **Rollback**

**Database:** Supabase provides daily backups. To restore: Supabase → Database → Backups → restore to a point before the migration.

---

## Post-launch Checklist

- [ ] Remove all demo/seed products from production (`DELETE FROM products WHERE sku LIKE 'NUC-%'` only after adding real products)
- [ ] Reset all EU market rules from `approved` back to `pending_review` and run proper compliance review
- [ ] Configure Supabase auth email templates with your brand
- [ ] Set up uptime monitoring (Better Uptime, UptimeRobot, or Render native alerting)
- [ ] Set up error monitoring (Sentry — add `SENTRY_DSN` env var and `@sentry/node` to API)
- [ ] Verify Resend sending domain is fully verified and not hitting spam
- [ ] Submit sitemap to Google Search Console
- [ ] Complete client sign-off on every published product and destination

---

## Environment Variable Reference

See `.env.example` in the monorepo root for the complete list with descriptions.
