import { materials } from '$lib/server/repository';
import { isUnit, isStorageCondition } from '$lib/server/repository';
import type { Unit } from '$lib/server/repository';
import { error, fail, redirect } from '@sveltejs/kit';
import { getT } from '$lib/i18n';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const material = await materials.get(params.id);
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
    const t = getT();
    const form = await request.formData();
    const id = params.id;
    const getVal = (key: string) => String(form.get(key) ?? '').trim();

    const updates = {
      name: getVal('name'),
      category: getVal('category'),
      unit: getVal('unit'),
      storageCondition: getVal('storageCondition'),
      minStock: form.has('minStock') ? Number(form.get('minStock')) : undefined,
      expirationRequired: form.has('expirationRequired'),
      active: form.has('active')
    };

    if (!updates.name || !updates.category || !updates.unit || !updates.storageCondition) {
      return fail(400, { message: t.newMaterial.messages.completeFields, fields: updates });
    }

    if (updates.minStock !== undefined && updates.minStock < 0) {
      return fail(400, { message: t.newMaterial.messages.minStockNegative, fields: updates });
    }

    if (!isUnit(updates.unit)) {
      return fail(400, { message: t.newMaterial.messages.invalidUnit, fields: updates });
    }

    if (!isStorageCondition(updates.storageCondition)) {
      return fail(400, { message: 'Invalid storage condition.', fields: updates });
    }

    const result = await materials.update(id, { ...updates, unit: updates.unit as Unit });

    if ('error' in result) {
      return fail(400, { message: result.error, fields: updates });
    }

    redirect(303, '/materials');
  }
};
