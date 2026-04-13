import { parse, serialize } from 'cookie';
import * as jose from 'jose';
import bcrypt from 'bcryptjs';

interface Env {
  DB: KVNamespace;
  JWT_SECRET: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { username, password } = await request.json() as any;

  const adminUsername = env.ADMIN_USERNAME || 'admin';
  const adminHash = env.ADMIN_PASSWORD_HASH;
  const jwtSecret = env.JWT_SECRET;

  if (!adminHash || !jwtSecret) {
    return new Response(JSON.stringify({ error: 'Server configuration missing' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const isValid = username === adminUsername && await bcrypt.compare(password, adminHash);

  if (isValid) {
    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new jose.SignJWT({ username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie
      }
    });
  }

  return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
};
