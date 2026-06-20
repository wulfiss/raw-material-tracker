import { getMaterialById, updateMaterial, isMaterialUnit, isStorageCondition } from '$lib/server/mock-db';
import { error, fail, redirect } from '@sveltejs/kit';
import { getT } from '$lib/i18n';
import type { PageServerLoad, Actions } from './$types';

const t = getT();

export const load: PageServerLoad = async ({ params }) => {
  const material = await getMaterialById(params.id);
  if (!material) {
    throw error(404, 'Material not found');
  }
  return {
    material,
    loadError: undefined as string | undefined
  };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const form = await request.formData();
    const id = params.id;

    const updates = {
      name: form.get('name') as string,
      category: form.get('category') as string,
      unit: form.get('unit') as string,
      storageCondition: form.get('storageCondition') as string,
      minStock: form.has('minStock') ? Number(form.get('minStock')) : undefined,
      expirationRequired: form.has('expirationRequired'),
      active: form.has('active')
    };

    if (!updates.name || !updates.category || !updates.unit || !updates.storageCondition) {
      return fail(400, { error: t.newMaterial.messages.completeFields, fields: updates });
    }

    if (updates.minStock !== undefined && updates.minStock < 0) {
      return fail(400, { error: t.newMaterial.messages.minStockNegative, fields: updates });
    }

    if (!isMaterialUnit(updates.unit)) {
      return fail(400, { error: t.newMaterial.messages.invalidUnit, fields: updates });
    }

    if (!isStorageCondition(updates.storageCondition)) {
      return fail(400, { error: 'Invalid storage condition.', fields: updates });
    }

    const result = await updateMaterial(id, updates);

    if ('error' in result) {
      return fail(400, { error: result.error, fields: updates });
    }

    redirect(303, '/materials');
  }
};
