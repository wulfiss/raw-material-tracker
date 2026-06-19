import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { getProfile } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

const publicPaths = ['/login'];

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    env.PUBLIC_SUPABASE_URL!,
    env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: Record<string, unknown> }) =>
            event.cookies.set(name, value, { ...options, path: '/' } as any)
          );
        }
      }
    }
  );

  const { data: { session } } = await event.locals.supabase.auth.getSession();

  event.locals.user = null;
  if (session?.user) {
    event.locals.user = await getProfile(session.user.id);
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
