import { serialize } from 'cookie';

export const onRequestPost: PagesFunction = async () => {
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie
    }
  });
};
