import type { Handle } from '@sveltejs/kit';
import { verifySession } from '$lib/server/session';

const publicPaths = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');
  event.locals.user = session ? verifySession(session) : null;

  const path = event.url.pathname;
  const isPublic = publicPaths.some((p) => path === p || path.startsWith(p + '/'));

  if (!event.locals.user && !isPublic) {
    return new Response(null, {
      status: 302,
      headers: { location: '/login' }
    });
  }

  return resolve(event);
};
