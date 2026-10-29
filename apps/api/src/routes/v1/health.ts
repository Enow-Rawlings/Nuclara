import { Router } from 'express'
import { supabase } from '../../lib/supabase.js'
import { ok } from '../../utils/response.js'

export const healthRouter = Router()

/**
 * GET /api/v1/health
 * Public health check — used by Render and uptime monitors.
 * Returns database connectivity status.
 */
healthRouter.get('/', async (_req, res, next) => {
  try {
    // Lightweight DB probe — check if the products table exists
    const { error } = await supabase.from('products').select('id').limit(1)

    ok(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: error ? 'unreachable' : 'connected',
      version: '1.0.0',
    })
  } catch (err) {
    next(err)
  }
})
