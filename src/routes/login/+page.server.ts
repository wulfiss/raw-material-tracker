import { fail, redirect } from '@sveltejs/kit';
import { authenticate } from '$lib/server/mock-auth';
import type { Actions, PageServerLoad } from './$types';
import { translations } from '$lib/i18n/translations';

const t = translations['es-AR'];

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    redirect(302, '/');
  }
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    if (!email || !password) {
      return fail(400, { error: t.login.emailAndPasswordRequired, email });
    }

    const user = authenticate(email, password);

    if (!user) {
      return fail(401, { error: t.login.invalidEmailOrPassword, email });
    }

    cookies.set('session', JSON.stringify(user), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    redirect(302, '/');
  }
};
