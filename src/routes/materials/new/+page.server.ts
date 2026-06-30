import { error, fail, redirect } from '@sveltejs/kit';
import { materials } from '$lib/server/repository';
import { isMaterialUnit, isStorageCondition } from '$lib/server/repository';
import { getT } from '$lib/i18n';
import { formText } from '$lib/server/form-utils';
import { requireRole } from '$lib/server/authorize';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    requireRole(locals.user, ['admin', 'quality']);
    const t = getT();
    const form = await request.formData();
    const fields = {
      name: formText(form, 'name'),
      category: formText(form, 'category'),
      unit: formText(form, 'unit'),
      storageCondition: formText(form, 'storageCondition'),
      minStock: form.has('minStock') ? Number(form.get('minStock')) : undefined,
      expirationRequired: form.has('expirationRequired'),
      active: form.has('active')
    };

    if (!fields.name || !fields.category || !fields.unit || !fields.storageCondition) {
      return fail(400, { message: t.newMaterial.messages.completeFields, fields });
    }

    if (!isMaterialUnit(fields.unit)) {
      return fail(400, { message: t.newMaterial.messages.invalidUnit, fields });
    }

    if (!isStorageCondition(fields.storageCondition)) {
      return fail(400, { message: t.newMaterial.messages.invalidStorageCondition, fields });
    }

    if (fields.minStock !== undefined && fields.minStock < 0) {
      return fail(400, { message: t.newMaterial.messages.minStockNegative, fields });
    }

    const result = await materials.create(
      {
        name: fields.name,
        category: fields.category,
        unit: fields.unit,
        storageCondition: fields.storageCondition,
        minStock: fields.minStock,
        expirationRequired: fields.expirationRequired,
        active: fields.active
      },
      locals.user
    );

    if ('error' in result) {
      return fail(400, { message: result.error, fields });
    }

    throw redirect(303, '/materials');
  }
};
