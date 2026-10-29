import type { Response } from 'express'

/** Consistent success response shape */
export function ok<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ success: true, data })
}

/** Paginated list response */
export function paginated<T>(
  res: Response,
  data: T[],
  meta: { page: number; pageSize: number; total: number }
): void {
  res.status(200).json({
    success: true,
    data,
    meta: {
      page: meta.page,
      pageSize: meta.pageSize,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.pageSize),
    },
  })
}
