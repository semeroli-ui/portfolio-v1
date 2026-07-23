/**
 * Rate limiting utility using Cloudflare KV.
 *
 * Uses KV to track failed attempts per IP with a sliding window.
 * Prevents brute-force attacks on sensitive endpoints like /api/login.
 */

interface RateLimitConfig {
  /** Max attempts before lockout */
  maxAttempts: number;
  /** Window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds until lockout resets
}

/**
 * Check and update rate limit for a given IP.
 * Uses KV to persist state across Workers invocations.
 */
export async function checkRateLimit(
  ip: string,
  namespace: KVNamespace,
  config: RateLimitConfig = { maxAttempts: 5, windowSeconds: 900 }
): Promise<RateLimitResult> {
  const key = `rl:${ip}`;
  const now = Math.floor(Date.now() / 1000);

  const raw = await namespace.get(key, 'json') as {
    count: number;
    windowStart: number;
  } | null;

  // First request or window expired → reset
  if (!raw || now - raw.windowStart >= config.windowSeconds) {
    await namespace.put(key, JSON.stringify({ count: 1, windowStart: now }), {
      expirationTtl: config.windowSeconds + 60,
    });
    return { allowed: true, remaining: config.maxAttempts - 1, retryAfter: 0 };
  }

  if (raw.count >= config.maxAttempts) {
    const retryAfter = config.windowSeconds - (now - raw.windowStart);
    return { allowed: false, remaining: 0, retryAfter };
  }

  raw.count++;
  await namespace.put(key, JSON.stringify(raw), {
    expirationTtl: config.windowSeconds + 60,
  });

  return {
    allowed: true,
    remaining: config.maxAttempts - raw.count,
    retryAfter: 0,
  };
}

/** Get client IP from request headers (Cloudflare-specific) */
export function getClientIP(request: Request): string {
  return (
    (request.headers.get('cf-connecting-ip') as string) ||
    (request.headers.get('x-forwarded-for') as string)?.split(',')[0]?.trim() ||
    (request.headers.get('x-real-ip') as string) ||
    'unknown'
  );
}
