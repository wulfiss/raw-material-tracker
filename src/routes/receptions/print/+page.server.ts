import { receptions, materials } from '$lib/server/repository';
import { isExpirationStatus } from '$lib/server/repository';
import type { ReceptionFilters } from '$lib/server/repository';

export const load = async ({ url }) => {
  const q = (key: string) => url.searchParams.get(key)?.trim() ?? '';

  const filters: ReceptionFilters = {};
  const search = q('search').slice(0, 80);
  if (search) filters.search = search;
  if (q('dateFrom')) filters.dateFrom = q('dateFrom');
  if (q('dateTo')) filters.dateTo = q('dateTo');
  if (q('materialId')) filters.materialId = q('materialId');
  if (q('category')) filters.category = q('category');
  if (q('supplier')) filters.supplier = q('supplier');
  if (q('storageCondition')) filters.storageCondition = q('storageCondition');
  if (url.searchParams.has('withObservationsOnly')) filters.withObservationsOnly = true;

  const rawExp = q('expiration') || q('expirationStatus');
  if (rawExp && isExpirationStatus(rawExp)) {
    filters.expirationStatus = rawExp;
  }

  const [{ rows: receptionsList }, allMaterials] = await Promise.all([receptions.list(filters), materials.list()]);
  const matMap = new Map(allMaterials.map((m) => [m.id, m]));

  const items = receptionsList.map((r) => {
    const mat = matMap.get(r.material_id);
    return {
      id: r.id,
      received_on: r.received_on,
      supplier: r.supplier,
      lot_code: r.lot_code,
      manufacture_date: r.manufacture_date,
      expiry_date: r.expiry_date,
      quantity: r.quantity,
      unit: r.unit,
      temperature_c: r.temperature_c,
      status: r.status,
      expirationStatus: r.expirationStatus,
      observations: r.observations,
      created_by_name: r.created_by_name,
      materialName: mat?.name ?? '',
      materialCategory: mat?.category ?? '',
      materialStorage: mat?.storageCondition ?? '',
    };
  });

  return { items };
};
