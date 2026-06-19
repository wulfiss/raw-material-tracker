import { fail, redirect } from '@sveltejs/kit';
import { createMaterial, isMaterialUnit, isStorageCondition } from '$lib/server/mock-db';
import { translations } from '$lib/i18n/translations';
import type { Actions } from './$types';

const t = translations['es-AR'];
const value = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const fields = {
      name: value(form, 'name'),
      category: value(form, 'category'),
      unit: value(form, 'unit'),
      storageCondition: value(form, 'storageCondition'),
      minStock: form.has('minStock') ? Number(form.get('minStock')) : undefined,
      expirationRequired: form.has('expirationRequired'),
      active: form.has('active')
    };

    if (!fields.name || !fields.category || !fields.unit || !fields.storageCondition) {
      return fail(400, { message: t.newMaterial.messages.completeFields, fields });
    }

    if (!isMaterialUnit(fields.unit as any)) {
      return fail(400, { message: t.newMaterial.messages.invalidUnit, fields });
    }

    if (!isStorageCondition(fields.storageCondition as any)) {
      return fail(400, { message: 'Invalid storage condition.', fields });
    }

    if (fields.minStock !== undefined && fields.minStock < 0) {
      return fail(400, { message: t.newMaterial.messages.minStockNegative, fields });
    }

    const result = await createMaterial(
      {
        name: fields.name,
        category: fields.category,
        unit: fields.unit as any,
        storageCondition: fields.storageCondition as any,
        minStock: fields.minStock,
        expirationRequired: fields.expirationRequired,
        active: fields.active
      },
      locals.user!
    );

    if ('error' in result) {
      return fail(400, { message: result.error, fields });
    }

    redirect(303, '/materials');
  }
};
