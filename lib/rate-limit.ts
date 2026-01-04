/**
 * Simple in-memory rate limiter for API endpoints
 * For production, consider using Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Clean up every minute

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID, or combination)
 * @param options - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const windowMs = options.windowSeconds * 1000;

  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or window has expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, options.limit - entry.count);
  const success = entry.count <= options.limit;

  return {
    success,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Auth endpoints: 5 attempts per minute
  auth: (identifier: string) => rateLimit(identifier, { limit: 5, windowSeconds: 60 }),

  // Password reset: 3 attempts per 15 minutes
  passwordReset: (identifier: string) => rateLimit(`pwd-reset:${identifier}`, { limit: 3, windowSeconds: 900 }),

  // Email sending: 10 emails per minute
  email: (identifier: string) => rateLimit(`email:${identifier}`, { limit: 10, windowSeconds: 60 }),

  // AI endpoints: 20 requests per minute (expensive operations)
  ai: (identifier: string) => rateLimit(`ai:${identifier}`, { limit: 20, windowSeconds: 60 }),

  // General API: 100 requests per minute
  api: (identifier: string) => rateLimit(`api:${identifier}`, { limit: 100, windowSeconds: 60 }),

  // File uploads: 10 per minute
  upload: (identifier: string) => rateLimit(`upload:${identifier}`, { limit: 10, windowSeconds: 60 }),
};

/**
 * Helper to get client identifier from request
 */
export function getClientIdentifier(req: Request, userId?: string): string {
  // Prefer user ID if available (more accurate for authenticated users)
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
}
