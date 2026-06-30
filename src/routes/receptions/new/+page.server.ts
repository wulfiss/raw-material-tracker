import { error, redirect } from '@sveltejs/kit';
import { materials } from '$lib/server/repository';
import { todayInTimeZone } from '$lib/server/repository';
import { validateAndCreateReception } from '$lib/server/reception-actions';
import { requireRole } from '$lib/server/authorize';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    materials: await materials.listActive(),
    today: todayInTimeZone(),
    loadError: null
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    requireRole(locals.user, ['admin', 'quality']);
    const form = await request.formData();
    const result = await validateAndCreateReception(form, locals.user);

    if ('reception' in result) {
      throw redirect(303, '/receptions');
    }

    return result;
  }
};
