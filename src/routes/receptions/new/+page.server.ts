import { error, redirect } from '@sveltejs/kit';
import { listActiveMaterials, todayInTimeZone } from '$lib/server/mock-db';
import { validateAndCreateReception } from '$lib/server/reception-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    materials: await listActiveMaterials(),
    today: todayInTimeZone(),
    loadError: null
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    const form = await request.formData();
    const result = await validateAndCreateReception(form, locals.user);

    if ('reception' in result) {
      redirect(303, '/receptions');
    }

    return result;
  }
};
