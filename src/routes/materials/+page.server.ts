import { materials } from '$lib/server/repository';
import { error, fail, redirect } from '@sveltejs/kit';
import { getT } from '$lib/i18n';
import { requireRole } from '$lib/server/authorize';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const allMaterials = await materials.list();
  return {
    materials: allMaterials,
    loadError: null
  };
};

export const actions: Actions = {
  toggle: async ({ request, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    requireRole(locals.user, ['admin', 'quality']);
    const t = getT();
    const data = await request.formData();
    const id = data.get('id') as string;

    if (!id) {
      return fail(400, { error: t.common.invalidId });
    }

    const result = await materials.toggleStatus(id);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    return { success: true };
  },
  delete: async ({ request, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    requireRole(locals.user, ['admin', 'quality']);
    const t = getT();
    const data = await request.formData();
    const id = data.get('id') as string;

    if (!id) {
      return fail(400, { error: t.common.invalidId });
    }

    const result = await materials.remove(id);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    if ('deactivated' in result.ok) {
      return { success: true, deactivated: true };
    }

    return { success: true };
  }
};
