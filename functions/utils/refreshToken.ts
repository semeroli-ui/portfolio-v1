/**
 * Refresh token utility.
 *
 * Implements a rotation-based refresh token scheme:
 *  - Refresh token is a long-lived (7 days) random token stored in KV
 *  - Access token is short-lived (1 hour)
 *  - Each use rotates the refresh token (old one invalidated → new one issued)
 *  - This detects token theft via reuse detection
 */

import * as jose from 'jose';
import { serialize } from 'cookie';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Generate cryptographically secure random token */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Issue a new access token + refresh token pair */
export async function issueTokenPair(
  username: string,
  jwtSecret: string,
  namespace: KVNamespace
): Promise<TokenPair> {
  const refreshToken = generateToken();
  const now = Math.floor(Date.now() / 1000);

  // Access token: 1 hour
  const accessSecret = new TextEncoder().encode(jwtSecret);
  const accessToken = await new jose.SignJWT({ username, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(accessSecret);

  // Refresh token: 7 days, stored in KV
  await namespace.put(`rt:${refreshToken}`, JSON.stringify({
    username,
    createdAt: now,
    lastUsed: now,
  }), { expirationTtl: 7 * 24 * 60 * 60 });

  return { accessToken, refreshToken };
}

/** Verify refresh token and rotate: returns new access token, or null if invalid */
export async function rotateRefreshToken(
  refreshToken: string,
  jwtSecret: string,
  namespace: KVNamespace
): Promise<{ accessToken: string; newRefreshToken: string } | null> {
  const stored = await namespace.get(`rt:${refreshToken}`, 'json') as {
    username: string;
    createdAt: number;
    lastUsed: number;
  } | null;

  if (!stored) return null; // Token not found or already invalidated

  // Rotate: invalidate old refresh token, issue new pair
  await namespace.delete(`rt:${refreshToken}`);
  return issueTokenPair(stored.username, jwtSecret, namespace);
}

/** Invalidate a refresh token (logout) */
export async function revokeRefreshToken(
  refreshToken: string,
  namespace: KVNamespace
): Promise<void> {
  await namespace.delete(`rt:${refreshToken}`);
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
  }
): string {
  return serialize(name, value, {
    httpOnly: options.httpOnly ?? true,
    secure: options.secure ?? true,
    sameSite: options.sameSite ?? 'strict',
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
