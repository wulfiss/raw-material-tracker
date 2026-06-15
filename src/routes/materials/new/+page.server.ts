import { fail, redirect } from '@sveltejs/kit';
import { createMaterial, isUnit } from '$lib/server/mock-db';
import { getMockUser } from '$lib/server/mock-auth';
import type { Actions } from './$types';

const value = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const fields = {
      name: value(form, 'name'),
      category: value(form, 'category'),
      default_unit: value(form, 'default_unit')
    };

    if (!fields.name || !fields.category || !fields.default_unit) {
      return fail(400, { message: 'Complete all required fields.', fields });
    }

    if (!isUnit(fields.default_unit)) {
      return fail(400, { message: 'Select a valid unit.', fields });
    }

    const result = await createMaterial(
      {
        name: fields.name,
        category: fields.category,
        default_unit: fields.default_unit
      },
      getMockUser()
    );

    if ('error' in result) {
      return fail(400, { message: result.error, fields });
    }

    redirect(303, '/materials');
  }
};
