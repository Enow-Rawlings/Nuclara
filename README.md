# Nuclara — Peptide E-Commerce Platform

A polished, compliance-gated peptide e-commerce platform with a standalone admin dashboard.

## Monorepo Structure

```
nuclara/
  apps/
    storefront/     # React 18 + Vite — public customer-facing storefront (Vercel)
    admin/          # React 18 + Vite — standalone admin dashboard (Vercel, separate deployment)
    api/            # Express + TypeScript REST API (Render)
  packages/
    shared-types/   # Shared DTOs, enums, and Zod schemas
    ui/             # Shared design-system components
  database/
    migrations/     # SQL migrations (run via Supabase CLI or direct psql)
    seed/           # Development-only demo data (never deployed to production)
  docs/             # Architecture, API, deployment, compliance workflow docs
  tests/
    e2e/            # Playwright end-to-end tests
```

## Quick Start

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- Supabase project (create at supabase.com)
- Cloudinary account
- Resend account

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Run database migrations
# (See docs/deployment.md for Supabase migration instructions)

# 4. Seed development data
pnpm --filter api seed

# 5. Start development servers
pnpm dev:api          # API on :4000
pnpm dev:storefront   # Storefront on :5173
pnpm dev:admin        # Admin on :5174
```

## Apps

| App | Port | Deployed to |
|-----|------|-------------|
| Storefront | 5173 | Vercel (production domain) |
| Admin | 5174 | Vercel (separate subdomain, access-restricted) |
| API | 4000 | Render |

## Key Commands

```bash
pnpm build          # Build all apps
pnpm lint           # Lint all packages
pnpm typecheck      # TypeScript check all packages
pnpm test           # Run all tests
```

## Important Notices

- **Payment processing is deferred.** The platform supports order requests only. No card data is collected.
- **Product compliance gates are mandatory.** Products must be explicitly approved per market before publication.
- **Demo data** in `database/seed/` is for development only and must never be published to production.
- **Secrets** must never be committed to this repository. Use `.env.local` locally and platform environment variables in production.

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Compliance Workflow](docs/compliance-workflow.md)
- [Operations Runbook](docs/operations-runbook.md)
