import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

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
    jwt.verify(token, env.JWT_SECRET);
    return new Response(JSON.stringify({ authenticated: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
  }
};
