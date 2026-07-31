import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';
import {
  checkRateLimit,
  getClientIP,
} from '../utils/rateLimit';
import {
  issueTokenPair,
  buildCookie,
} from '../utils/refreshToken';

interface Env {
  DB: KVNamespace;
  JWT_SECRET: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH: string;
}

const MIN_JWT_SECRET_LEN = 32;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const ip = getClientIP(request);

  // ── 1. Rate limiting ──────────────────────────────────────────────
  const rl = await checkRateLimit(ip, env.DB);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: '登录尝试过于频繁，请稍后再试', retryAfter: rl.retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rl.retryAfter),
        },
      }
    );
  }

  // ── 2. Parse body ───────────────────────────────────────────────────
  const { username, password } = await request.json() as { username?: string; password?: string };
  if (!username || !password) {
    return new Response(JSON.stringify({ error: '用户名和密码不能为空' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── 3. Config validation ────────────────────────────────────────────
  if (!env.ADMIN_PASSWORD_HASH || !env.JWT_SECRET) {
    console.error('[login] Missing required env vars: ADMIN_PASSWORD_HASH or JWT_SECRET');
    return new Response(JSON.stringify({ error: '服务器配置错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (env.JWT_SECRET.length < MIN_JWT_SECRET_LEN) {
    console.error('[login] JWT_SECRET too short, must be >= 32 chars');
    return new Response(JSON.stringify({ error: '服务器配置错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── 4. Credential verification ──────────────────────────────────────
  const adminUsername = env.ADMIN_USERNAME || 'admin';
  let isValid = false;

  try {
    isValid = username === adminUsername && await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
  } catch (err) {
    console.error('[login] bcrypt compare error:', err);
    return new Response(JSON.stringify({ error: '认证服务异常' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!isValid) {
    // Rate limit info leaked only after check passes the threshold
    return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── 5. Issue token pair ────────────────────────────────────────────
  let tokens: { accessToken: string; refreshToken: string };
  try {
    tokens = await issueTokenPair(username, env.JWT_SECRET, env.DB);
  } catch (err) {
    console.error('[login] Token issuance error:', err);
    return new Response(JSON.stringify({ error: '认证服务异常' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Detect if request is HTTPS (for cookie secure flag)
  const isSecure = request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://');
  const accessCookie = buildCookie('token', tokens.accessToken, { maxAge: 3600 }, isSecure);          // 1h
  const refreshCookie = buildCookie('refresh_token', tokens.refreshToken, { maxAge: 7 * 24 * 3600 }, isSecure); // 7d

  return new Response(JSON.stringify({ success: true, remaining: rl.remaining }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': [accessCookie, refreshCookie].join(', '),
    },
  });
};
