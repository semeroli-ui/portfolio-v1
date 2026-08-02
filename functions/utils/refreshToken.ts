/**
 * Token utilities — JWT-based access + refresh tokens.
 *
 * Refresh tokens are self-contained signed JWTs (7-day expiry) and do NOT
 * require a KV lookup to validate. This avoids Cloudflare KV's eventual
 * consistency issues that previously caused random logouts when requests
 * hit different edge nodes.
 *
 * Revocation (logout) uses a small KV blacklist keyed by the token's `jti`.
 * The blacklist check is fail-open: if KV is temporarily unavailable the
 * refresh is still allowed, so we never log a user out due to KV lag.
 */

import * as jose from 'jose';
import { serialize } from 'cookie';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Issue a new access token + refresh token pair (no KV write needed) */
export async function issueTokenPair(
  username: string,
  jwtSecret: string
): Promise<TokenPair> {
  const secret = new TextEncoder().encode(jwtSecret);

  // Access token: 1 hour
  const accessToken = await new jose.SignJWT({ username, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  // Refresh token: 7 days, self-contained (carries its own jti for revocation)
  const refreshToken = await new jose.SignJWT({ username, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setJti(generateJti())
    .setExpirationTime('7d')
    .sign(secret);

  return { accessToken, refreshToken };
}

/** Verify refresh token and issue a new pair. Returns null if invalid/revoked. */
export async function rotateRefreshToken(
  refreshToken: string,
  jwtSecret: string,
  namespace?: KVNamespace
): Promise<{ accessToken: string; newRefreshToken: string } | null> {
  const payload = await verifyRefreshToken(refreshToken, jwtSecret);
  if (!payload) return null;

  // Revocation check (fail-open: never log out due to KV lag)
  if (namespace && payload.jti) {
    try {
      const revoked = await namespace.get(`revoked:${payload.jti}`);
      if (revoked) return null;
    } catch {
      // KV error — fail open
    }
  }

  const pair = await issueTokenPair(payload.username as string, jwtSecret);
  return { accessToken: pair.accessToken, newRefreshToken: pair.refreshToken };
}

/** Verify a refresh token JWT, returns payload or null. */
export async function verifyRefreshToken(
  refreshToken: string,
  jwtSecret: string
): Promise<jose.JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(refreshToken, secret);
    if (payload.type !== 'refresh') return null;
    return payload;
  } catch {
    return null;
  }
}

/** Add a refresh token's jti to the revocation blacklist (logout). */
export async function revokeRefreshToken(
  refreshToken: string,
  jwtSecret: string,
  namespace: KVNamespace
): Promise<void> {
  const payload = await verifyRefreshToken(refreshToken, jwtSecret);
  if (!payload || !payload.jti) return;
  // Blacklist for slightly longer than the token's max lifetime
  await namespace.put(`revoked:${payload.jti}`, '1', {
    expirationTtl: 8 * 24 * 60 * 60,
  });
}

/** Build httpOnly cookie string for a token */
export function buildCookie(
  name: string,
  value: string,
  options: {
    maxAge: number;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  },
  isSecure: boolean = false
): string {
  return serialize(name, value, {
    httpOnly: options.httpOnly ?? true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: options.maxAge,
    path: options.path ?? '/',
  });
}

/** Verify access token, returns username or null */
export async function verifyAccessToken(
  token: string,
  jwtSecret: string
): Promise<string | null> {
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    if (payload.type !== 'access') return null; // Reject refresh tokens used as access
    return payload.username as string;
  } catch {
    return null;
  }
}

/** Cryptographically secure random jti */
function generateJti(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}
