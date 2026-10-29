/**
 * Structured API error class.
 * Throw this anywhere in the route/service layer;
 * the central errorHandler will format it correctly.
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(statusCode: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code ?? httpCodeToString(statusCode)
  }
}

function httpCodeToString(code: number): string {
  const map: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
  }
  return map[code] ?? 'API_ERROR'
}
