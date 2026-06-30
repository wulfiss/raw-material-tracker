import { error, fail } from '@sveltejs/kit';
import { receptions, materials, views } from '$lib/server/repository';
import { isExpirationStatus, storageConditions } from '$lib/server/repository';
import type { ReceptionFilters } from '$lib/server/repository';
import type { PageServerLoad, Actions } from './$types';
import { getT } from '$lib/i18n';
import { requireRole } from '$lib/server/authorize';

export const load: PageServerLoad = async ({ url }) => {
  const q = (key: string) => url.searchParams.get(key)?.trim() ?? '';
  const search = q('search').slice(0, 80);

  const allMaterials = await materials.list();

  const filters: ReceptionFilters = {
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

  const { rows, truncated } = await receptions.list(filters);

  return {
    receptions: rows,
    truncated,
    materials: allMaterials,
    categories,
    storageConditions: [...storageConditions],
    filters,
    views: await views.list(),
    loadError: null
  };
};

export const actions: Actions = {
  deleteReception: async ({ request, locals }) => {
    if (!locals.user) throw error(401, 'Unauthorized');
    requireRole(locals.user, ['admin', 'quality']);
    const t = getT();
    const form = await request.formData();
    const id = form.get('id') as string;

    if (!id) {
      return fail(400, { error: t.common.invalidId });
    }

    const result = await receptions.remove(id);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    return { success: true };
  },
  saveView: async ({ request }) => {
    const t = getT();
    const form = await request.formData();
    const name = (form.get('name') as string)?.trim();
    if (!name) {
      return fail(400, { error: t.receptions.viewNameRequired });
    }

    const filters: ReceptionFilters = {
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

    const result = await views.save(name, filters);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    return { view: result.ok.view };
  },
  deleteView: async ({ request }) => {
    const t = getT();
    const form = await request.formData();
    const id = form.get('id') as string;
    if (!id) {
      return fail(400, { error: t.common.invalidId });
    }

    const result = await views.remove(id);
    if ('error' in result) {
      return fail(400, { error: result.error });
    }

    return { success: true };
  }
};
