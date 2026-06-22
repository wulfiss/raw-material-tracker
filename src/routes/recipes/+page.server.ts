import { recipes } from '$lib/server/repository';
import { fail, redirect } from '@sveltejs/kit';
import { getT } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const allRecipes = await recipes.list();
    return { recipes: allRecipes, loadError: null };
  } catch (e) {
    return { recipes: [], loadError: e instanceof Error ? e.message : 'Unknown error' };
  }
};

export const actions: Actions = {
  toggle: async ({ request }) => {
    const t = getT();
    const data = await request.formData();
    const id = String(data.get('id') ?? '').trim();

    if (!id) {
      return fail(400, { message: t.common.invalidId });
    }

    const result = await recipes.toggleActive(id);
    if ('error' in result) {
      return fail(400, { message: result.error });
    }

    return { success: true };
  },
};
