import { fail } from '@sveltejs/kit';
import {
  listReceipts, listMaterials, deleteReceipt, isExpirationStatus, storageConditions,
  listReceiptViews, saveReceiptView, deleteReceiptView
} from '$lib/server/mock-db';
import type { ExpirationStatus, ReceiptFilters } from '$lib/server/mock-db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const q = (key: string) => url.searchParams.get(key)?.trim() ?? '';
  const search = q('search').slice(0, 80);

  const allMaterials = await listMaterials();

  const filters: ReceiptFilters = {
    search,
    dateFrom: q('dateFrom'),
    dateTo: q('dateTo'),
    materialId: q('materialId'),
    category: q('category'),
    supplier: q('supplier'),
    storageCondition: q('storageCondition'),
    withObservationsOnly: url.searchParams.has('withObservationsOnly'),
  };

  const rawExpiration = q('expiration') || q('expirationStatus');
  if (rawExpiration && isExpirationStatus(rawExpiration)) {
    filters.expirationStatus = rawExpiration;
  }

  const categories = [...new Set(allMaterials.map((m) => m.category))].sort();

  return {
    receipts: await listReceipts(filters),
    materials: allMaterials,
    categories,
    storageConditions: [...storageConditions],
    filters,
    views: await listReceiptViews(),
    loadError: null
  };
};

export const actions: Actions = {
  deleteReceipt: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id') as string;

    if (!id) {
      return fail(400, { error: 'ID inválido' });
    }

    const result = await deleteReceipt(id);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    return { success: true };
  },
  saveView: async ({ request }) => {
    const form = await request.formData();
    const name = (form.get('name') as string)?.trim();
    if (!name) {
      return fail(400, { error: 'View name is required.' });
    }

    const filters: ReceiptFilters = {
      search: (form.get('search') as string) || undefined,
      dateFrom: (form.get('dateFrom') as string) || undefined,
      dateTo: (form.get('dateTo') as string) || undefined,
      materialId: (form.get('materialId') as string) || undefined,
      category: (form.get('category') as string) || undefined,
      supplier: (form.get('supplier') as string) || undefined,
      storageCondition: (form.get('storageCondition') as string) || undefined,
      withObservationsOnly: form.has('withObservationsOnly'),
    };
    const rawExp = (form.get('expirationStatus') as string) || undefined;
    if (rawExp && isExpirationStatus(rawExp)) {
      filters.expirationStatus = rawExp;
    }

    const result = await saveReceiptView(name, filters);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    return { view: result.view };
  },
  deleteView: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id') as string;
    if (!id) {
      return fail(400, { error: 'View ID is required.' });
    }

    const result = await deleteReceiptView(id);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    return { success: true };
  }
};
