import rateLimit from 'express-rate-limit'

const rateLimitResponse = (message: string) => ({
  success: false,
  error: { code: 'RATE_LIMITED', message },
})

/** General API rate limit — all routes */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many requests, please try again later'),
})

/** Strict limit for auth endpoints (login, register, password reset) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many authentication attempts, please try again later'),
})

/** Order submission — prevent duplicate/spam submissions */
export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Too many order requests, please slow down'),
})

/** Chat messages */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Message rate limit exceeded'),
})

/** Search — prevent scraping */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Search rate limit exceeded'),
})
