import { parse } from 'cookie';
import { verifyAccessToken } from '../../utils/refreshToken';

interface Env {
  JWT_SECRET: string;
}

/**
 * GET /api/auth/check
 *
 * Verifies the current access token.
 * Returns { authenticated: true } if valid, 401 if not.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.JWT_SECRET) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.token;

  if (!token) {
    return new Response(JSON.stringify({ authenticated: false, reason: 'no_token' }), { status: 401 });
  }

  const username = await verifyAccessToken(token, env.JWT_SECRET);

  if (!username) {
    return new Response(JSON.stringify({ authenticated: false, reason: 'invalid_token' }), { status: 401 });
  }

  return new Response(JSON.stringify({ authenticated: true, username }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
