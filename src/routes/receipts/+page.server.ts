import { fail } from '@sveltejs/kit';
import { listReceipts, deleteReceipt } from '$lib/server/mock-db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const search = url.searchParams.get('search')?.trim().slice(0, 80) ?? '';

  return {
    receipts: await listReceipts(search),
    search,
    loadError: null
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id') as string;

    if (!id) {
      return fail(400, { error: 'Invalid ID' });
    }

    const result = await deleteReceipt(id);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    return { success: true };
  }
};
