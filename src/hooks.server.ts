import type { Handle } from '@sveltejs/kit';

const publicPaths = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');

  if (session) {
    try {
      event.locals.user = JSON.parse(session);
    } catch {
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

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
