import { fail, redirect } from '@sveltejs/kit';
import { authenticate } from '$lib/server/mock-auth';
import { getT } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

const t = getT();

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
      return fail(400, { message: t.login.emailAndPasswordRequired, email });
    }

    const user = authenticate(email, password);

    if (!user) {
      return fail(401, { message: t.login.invalidEmailOrPassword, email });
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
