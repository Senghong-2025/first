import { Context, Next } from 'hono'
import type { EnvBindings } from '../types/bindings'

/**
 * Middleware to validate API key from headers or query parameters
 */
export const apiKeyAuth = async (c: Context<{ Bindings: EnvBindings }>, next: Next) => {
  // Get API key from Authorization header or x-api-key header or query parameter
  const apiKey =
    c.req.header('x-api-key') ||
    c.req.header('Authorization')?.replace('Bearer ', '') ||
    c.req.query('api_key')

  // Get the expected API key from environment
  const validApiKey = c.env.API_KEY

  // Check if API key is provided and valid
  if (!apiKey || apiKey !== validApiKey) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Invalid or missing API key. Provide it via x-api-key header, Authorization header, or api_key query parameter.'
      },
      401
    )
  }

  await next()
}
