import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// In development: load .env.local from monorepo root.
// In production (Render): env vars are injected by the platform — dotenv is a no-op.
const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: resolve(__dirname, '../../../.env.local') })
config({ path: resolve(__dirname, '../../../.env') })
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'

import { env } from './config/env.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

import { healthRouter } from './routes/v1/health.js'
import { productsRouter } from './routes/v1/products.js'
import { categoriesRouter } from './routes/v1/categories.js'
import { ordersRouter } from './routes/v1/orders.js'
import { authRouter } from './routes/v1/auth.js'
import { mediaRouter } from './routes/v1/media.js'
import { chatRouter } from './routes/v1/chat.js'
import { sitemapRouter } from './routes/v1/sitemap.js'
import { adminUsersRouter } from './routes/v1/adminUsers.js'
import { emailTestRouter } from './routes/v1/emailTest.js'
import { customersRouter } from './routes/v1/customers.js'
import { auditRouter } from './routes/v1/audit.js'
import { seoRouter } from './routes/v1/seo.js'
import { settingsRouter } from './routes/v1/settings.js'
import { contentRouter } from './routes/v1/content.js'
import { aiRouter } from './routes/v1/ai.js'
import { blogRouter } from './routes/v1/blog.js'
import { visitorPingRouter } from './routes/v1/visitorPing.js'

const app = express()

// ─── Security headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow Cloudinary resources
  })
)

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server (no origin) in development
      if (!origin && env.NODE_ENV === 'development') {
        return callback(null, true)
      }
      if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─── Parsing & compression ───────────────────────────────────────────────────
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use(generalLimiter)

// ─── Routes ──────────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1'

app.use(`${API_PREFIX}/health`, healthRouter)
app.use(`${API_PREFIX}/auth`, authRouter)
app.use(`${API_PREFIX}/products`, productsRouter)
app.use(`${API_PREFIX}/categories`, categoriesRouter)
app.use(`${API_PREFIX}/orders`, ordersRouter)
app.use(`${API_PREFIX}/media`, mediaRouter)
app.use(`${API_PREFIX}/chat`, chatRouter)
app.use(`${API_PREFIX}/customers`, customersRouter)
app.use(`${API_PREFIX}/audit`, auditRouter)
app.use(`${API_PREFIX}/seo`, seoRouter)
app.use(`${API_PREFIX}/settings`, settingsRouter)
app.use(`${API_PREFIX}/content`, contentRouter)
app.use(`${API_PREFIX}/ai`, aiRouter)
app.use(`${API_PREFIX}/blog`, blogRouter)
app.use(`${API_PREFIX}/visitor-ping`, visitorPingRouter)
// Sitemap + robots served at root paths (proxied through API or served directly)
app.use(`${API_PREFIX}`, sitemapRouter)
app.use(`${API_PREFIX}/admin/users`, adminUsersRouter)
app.use(`${API_PREFIX}/email-test`, emailTestRouter)

// ─── Error handling (must be last) ───────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`[nuclara-api] Server running on http://localhost:${env.PORT}`)
  console.log(`[nuclara-api] Environment: ${env.NODE_ENV}`)
  console.log(`[nuclara-api] Health check: http://localhost:${env.PORT}${API_PREFIX}/health`)
})

export default app
