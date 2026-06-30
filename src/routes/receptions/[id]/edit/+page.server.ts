import { error, redirect } from '@sveltejs/kit';
import { receptions, materials } from '$lib/server/repository';
import { todayInTimeZone } from '$lib/server/repository';
import { validateAndUpdateReception } from '$lib/server/reception-actions';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const reception = await receptions.get(params.id);
  if (!reception) throw error(404, 'Reception not found');

  return {
    reception,
    materials: await materials.listActive(),
    today: todayInTimeZone(),
    loadError: null
  };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    const form = await request.formData();
    const result = await validateAndUpdateReception(params.id, form, locals.user);

    if ('reception' in result) {
      throw redirect(303, '/receptions');
    }

    return result;
  }
};
