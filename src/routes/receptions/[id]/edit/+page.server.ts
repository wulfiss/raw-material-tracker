import { error, redirect } from '@sveltejs/kit';
import { getReception, listActiveMaterials, todayInTimeZone } from '$lib/server/mock-db';
import { validateAndUpdateReception } from '$lib/server/reception-actions';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const reception = await getReception(params.id);
  if (!reception) throw error(404, 'Reception not found');

  return {
    reception,
    materials: await listActiveMaterials(),
    today: todayInTimeZone(),
    loadError: null
  };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const form = await request.formData();
    const result = await validateAndUpdateReception(params.id, form, locals.user!);

    if ('reception' in result) {
      redirect(303, '/receptions');
    }

    return result;
  }
};
