import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { translations } from '$lib/i18n/translations';

const t = translations['es-AR'];

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    redirect(302, '/');
  }
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    if (!email || !password) {
      return fail(400, { error: t.login.emailAndPasswordRequired, email });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return fail(401, { error: t.login.invalidEmailOrPassword, email });
    }

    redirect(302, '/');
  }
};
