import { parse } from 'cookie';
import * as jose from 'jose';

interface Env {
  JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.token;

  if (!token) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    await jose.jwtVerify(token, secret);
    return new Response(JSON.stringify({ authenticated: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }
};
