import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'

/**
 * Request validation middleware factory.
 * Validates req.body, req.query, or req.params against a Zod schema.
 * On failure, throws a ZodError that the central error handler catches.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body)
    next()
  }
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.query = schema.parse(req.query) as typeof req.query
    next()
  }
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.params = schema.parse(req.params) as typeof req.params
    next()
  }
}
