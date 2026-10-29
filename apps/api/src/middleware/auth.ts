import type { Request, Response, NextFunction } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { env } from '../config/env.js'
import { supabase } from '../lib/supabase.js'
import { ApiError } from '../utils/ApiError.js'

const JWKS_URL = `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`
const jwks = createRemoteJWKSet(new URL(JWKS_URL))

export interface AuthenticatedRequest extends Request {
  userId: string
  userEmail: string
  adminRole?: string | null
}

/**
 * requireAuth — verifies the Supabase JWT from the Authorization header.
 * Attaches userId and userEmail to the request.
 * Used on all protected endpoints (storefront customer routes + admin routes).
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    next(new ApiError(401, 'Authentication required'))
    return
  }

  const token = authHeader.slice(7)

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    })

    const userId = payload.sub
    const userEmail = payload.email as string | undefined

    if (!userId || !userEmail) {
      next(new ApiError(401, 'Invalid token claims'))
      return
    }

    const authReq = req as AuthenticatedRequest
    authReq.userId = userId
    authReq.userEmail = userEmail

    next()
  } catch {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}

/**
 * requireAdminAuth — extends requireAuth by also checking
 * the admin_users table for an active record and returning the role.
 * Must be used after requireAuth in the middleware chain.
 */
export async function requireAdminAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthenticatedRequest

  if (!authReq.userId) {
    next(new ApiError(401, 'Authentication required'))
    return
  }

  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('auth_user_id', authReq.userId)
    .single()

  if (error || !adminUser || !adminUser.is_active) {
    next(new ApiError(403, 'Admin access required'))
    return
  }

  authReq.adminRole = adminUser.role
  next()
}

/**
 * requireRole — factory for role-based permission checks.
 * Must be used after requireAdminAuth in the middleware chain.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.adminRole || !allowedRoles.includes(authReq.adminRole)) {
      next(new ApiError(403, 'Insufficient permissions'))
      return
    }
    next()
  }
}
