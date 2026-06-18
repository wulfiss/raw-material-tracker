import { getMaterialById, updateMaterial } from '$lib/server/mock-db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { translations } from '$lib/i18n/translations';

const t = translations['es-AR'];

export const load: PageServerLoad = async ({ params }) => {
  const material = await getMaterialById(params.id);
  if (!material) {
    throw error(404, 'Material not found');
  }
  return {
    material,
    loadError: undefined as any
  };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const form = await request.formData();
    const id = params.id;

    const updates = {
      name: form.get('name') as string,
      category: form.get('category') as string,
      unit: form.get('unit') as any,
      storageCondition: form.get('storageCondition') as any,
      minStock: form.has('minStock') ? Number(form.get('minStock')) : undefined,
      expirationRequired: form.has('expirationRequired'),
      active: form.has('active')
    };

    // Basic validation
    if (!updates.name || !updates.category || !updates.unit || !updates.storageCondition) {
      return fail(400, { message: t.newMaterial.messages.completeFields });
    }

    if (updates.minStock !== undefined && updates.minStock < 0) {
      return fail(400, { message: 'Minimum stock cannot be negative.' });
    }

    const result = await updateMaterial(id, updates);

    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    redirect(303, '/materials');
  }
};
