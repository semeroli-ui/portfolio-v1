import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

interface Env {
  DB: KVNamespace;
  JWT_SECRET: string;
}

async function getProjects(db: KVNamespace) {
  const data = await db.get('projects');
  return data ? JSON.parse(data) : [];
}

function verifyAuth(request: Request, secret: string) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = parse(cookieHeader);
  const token = cookies.token;
  if (!token) return false;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  if (!verifyAuth(request, env.JWT_SECRET)) return new Response('Unauthorized', { status: 401 });

  const id = parseInt(params.id as string);
  const projects = await getProjects(env.DB);
  const index = projects.findIndex((p: any) => p.id === id);
  
  if (index === -1) return new Response('Not Found', { status: 404 });

  const updates = await request.json() as any;
  projects[index] = { ...projects[index], ...updates };
  await env.DB.put('projects', JSON.stringify(projects));

  return new Response(JSON.stringify(projects[index]), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  if (!verifyAuth(request, env.JWT_SECRET)) return new Response('Unauthorized', { status: 401 });

  const id = parseInt(params.id as string);
  let projects = await getProjects(env.DB);
  projects = projects.filter((p: any) => p.id !== id);
  await env.DB.put('projects', JSON.stringify(projects));

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
