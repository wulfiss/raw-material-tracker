import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { listReceptions, saveView, listActiveMaterials, type ReceptionFilters } from '$lib/server/mock-db';
import { translations } from '$lib/i18n/translations';

const t = translations['es-AR'];
const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

interface Filters {
  search: string;
  dateFrom: string;
  dateTo: string;
  materialId: string;
  category: string;
  supplierId: string;
  storageCondition: string;
  expirationStatus: string;
  withObservationsOnly: boolean;
}

const filtersFrom = (form: FormData): Filters => ({
  search: text(form, 'search'),
  dateFrom: text(form, 'dateFrom'),
  dateTo: text(form, 'dateTo'),
  materialId: text(form, 'materialId'),
  category: text(form, 'category'),
  supplierId: text(form, 'supplierId'),
  storageCondition: text(form, 'storageCondition'),
  expirationStatus: text(form, 'expirationStatus'),
  withObservationsOnly: form.get('withObservationsOnly') === 'true'
});

export const load: PageServerLoad = async ({ url }) => {
  const params = url.searchParams;
  
  const filters: ReceptionFilters = {
    search: params.get('search') ?? '',
    dateFrom: params.get('dateFrom') ?? undefined,
    dateTo: params.get('dateTo') ?? undefined,
    materialId: params.get('materialId') ?? undefined,
    category: params.get('category') ?? undefined,
    supplierId: params.get('supplierId') ?? undefined,
    storageCondition: (params.get('storageCondition') as ReceptionFilters['storageCondition']) ?? undefined,
    expirationStatus: (params.get('expirationStatus') as ReceptionFilters['expirationStatus']) ?? undefined,
    withObservationsOnly: params.get('withObservationsOnly') === 'true'
  };

  const [receptions, materials] = await Promise.all([listReceptions(filters), listActiveMaterials()]);

  return {
    filters,
    receptions,
    materials,
    activeFiltersCount: Object.entries(filters).filter(([key, value]) => {
      if (key === 'search' || key === 'withObservationsOnly') return false;
      return value !== undefined && value !== '';
    }).length
  };
};

export const actions: Actions = {
  saveView: async ({ request }) => {
    const form = await request.formData();
    const name = text(form, 'name');
    const filters: ReceptionFilters = {
      search: text(form, 'search'),
      dateFrom: text(form, 'dateFrom') || undefined,
      dateTo: text(form, 'dateTo') || undefined,
      materialId: text(form, 'materialId') || undefined,
      category: text(form, 'category') || undefined,
      supplierId: text(form, 'supplierId') || undefined,
      storageCondition: (text(form, 'storageCondition') as ReceptionFilters['storageCondition']) || undefined,
      expirationStatus: (text(form, 'expirationStatus') as ReceptionFilters['expirationStatus']) || undefined,
      withObservationsOnly: form.get('withObservationsOnly') === 'true'
    };

    if (!name) {
      return fail(400, { error: 'Debe ingresar un nombre para la vista' });
    }

    const savedView = saveView({ name, filters });
    return { success: 'Vista guardada correctamente', view: savedView };
  },
  
  clearFilters: async () => {
    return { cleared: true };
  }
};
