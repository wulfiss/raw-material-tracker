import type { Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { dev } from '$app/environment';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';
import { toAppUser } from '$lib/server/auth';

const publicPaths = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          event.cookies.set(name, value, { ...options, path: options?.path ?? '/', secure: !dev });
        }
      }
    }
  });

  const {
    data: { user }
  } = await event.locals.supabase.auth.getUser();
  event.locals.user = user ? toAppUser(user) : null;

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
