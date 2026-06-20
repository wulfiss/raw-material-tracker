import { getMaterial, updateMaterial, isUnit, isStorageCondition } from '$lib/server/mock-db';
import type { Unit } from '$lib/server/mock-db';
import { error, fail, redirect } from '@sveltejs/kit';
import { getT } from '$lib/i18n';
import type { PageServerLoad, Actions } from './$types';

const t = getT();

export const load: PageServerLoad = async ({ params }) => {
  const material = await getMaterial(params.id);
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
    const value = (key: string) => String(form.get(key) ?? '').trim();

    const updates = {
      name: value('name'),
      category: value('category'),
      unit: value('unit'),
      storageCondition: value('storageCondition'),
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

    const result = await updateMaterial(id, { ...updates, unit: updates.unit as Unit });

    if ('error' in result) {
      return fail(400, { message: result.error, fields: updates });
    }

    redirect(303, '/materials');
  }
};
