import { parse } from 'cookie';
import {
  rotateRefreshToken,
  buildCookie,
} from '../../utils/refreshToken';
import { checkRateLimit, getClientIP } from '../../utils/rateLimit';

interface Env {
  DB: KVNamespace;
  JWT_SECRET: string;
}

/**
 * POST /api/auth/refresh
 *
 * Exchanges a valid refresh token for a new access token.
 * Implements refresh token rotation (old token is invalidated after use).
 * If reuse is detected (token already revoked), returns 401 — signals theft.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const ip = getClientIP(request);

  // Rate limit refresh attempts (higher threshold than login, but still limited)
  const rl = await checkRateLimit(ip, env.DB, { maxAttempts: 30, windowSeconds: 900 });
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: '请求过于频繁' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) },
    });
  }

  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parse(cookieHeader);
  const refreshToken = cookies.refresh_token;

  if (!refreshToken) {
    return new Response(JSON.stringify({ error: 'No refresh token' }), { status: 401 });
  }

  const newTokens = await rotateRefreshToken(refreshToken, env.JWT_SECRET, env.DB);

  if (!newTokens) {
    // Token reuse detected — potential token theft
    console.warn(`[refresh] Token reuse detected from IP: ${ip}`);
    return new Response(JSON.stringify({ error: 'Token revoked or expired' }), { status: 401 });
  }

  const accessCookie = buildCookie('token', newTokens.accessToken, { maxAge: 3600 });
  const refreshCookie = buildCookie('refresh_token', newTokens.newRefreshToken, { maxAge: 7 * 24 * 3600 });

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': [accessCookie, refreshCookie].join(', '),
    },
  });
};
