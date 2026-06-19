import { listMaterials, toggleMaterialStatus, deleteMaterial } from '$lib/server/mock-db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const materials = await listMaterials();
  return {
    materials,
    loadError: null
  };
};

export const actions: Actions = {
  toggle: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;

    if (!id) {
      return fail(400, { error: 'ID inválido' });
    }

    const result = await toggleMaterialStatus(id);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    return { success: true };
  },
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id') as string;

    if (!id) {
      return fail(400, { error: 'ID inválido' });
    }

    const result = await deleteMaterial(id);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    if ('deactivated' in result) {
      return { success: true, deactivated: true };
    }

    return { success: true };
  }
};
