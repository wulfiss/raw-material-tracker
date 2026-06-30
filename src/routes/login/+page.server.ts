import { fail, redirect } from '@sveltejs/kit';
import { getT } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    redirect(302, '/receptions');
  }
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const t = getT();
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    if (!email || !password) {
      return fail(400, { message: t.login.emailAndPasswordRequired, email });
    }

    const { error: authError } = await locals.supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      return fail(401, { message: t.login.invalidEmailOrPassword, email });
    }

    redirect(302, '/receptions');
  }
};
