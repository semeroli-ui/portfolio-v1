import { parse } from 'cookie';
import { serialize } from 'cookie';
import { revokeRefreshToken } from '../utils/refreshToken';

interface Env {
  DB: KVNamespace;
}

function clearCookie(name: string, isSecure: boolean): string {
  return serialize(name, '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * POST /api/logout
 *
 * Clears both the access token and refresh token cookies.
 * Server-side revocation of refresh token prevents token replay.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parse(cookieHeader);
  const refreshToken = cookies.refresh_token;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken, env.DB);
  }

  const isSecure = request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://');

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${clearCookie('token', isSecure)}\n${clearCookie('refresh_token', isSecure)}`,
    },
  });
};
