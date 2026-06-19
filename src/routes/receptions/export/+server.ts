import { listReceipts, listMaterials, isExpirationStatus } from '$lib/server/mock-db';
import type { ReceiptFilters } from '$lib/server/mock-db';
import { translations } from '$lib/i18n/translations';

const t = translations['es-AR'];

export const GET = async ({ url }) => {
  const q = (key: string) => url.searchParams.get(key)?.trim() ?? '';

  const filters: ReceiptFilters = {};
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

  const [receipts, allMaterials] = await Promise.all([listReceipts(filters), listMaterials()]);
  const matMap = new Map(allMaterials.map((m) => [m.id, m]));

  const esc = (v: string | null | undefined): string => {
    if (v == null || v === '') return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const statusLabels: Record<string, string> = {
    accepted: t.newReception.statusOptions.accepted,
    conditional: t.newReception.statusOptions.conditional,
    rejected: t.newReception.statusOptions.rejected,
  };

  const expiryLabels: Record<string, string> = {
    expired: t.receipts.expired,
    near_expiry: t.receipts.nearExpiry,
    ok: t.receipts.ok,
    missing: t.receipts.missingExpiration,
  };

  const header = [
    t.receipts.table.date, t.receipts.table.material, t.materials.table.category, t.receipts.storageCondition, t.receipts.table.supplier, t.receipts.table.lot,
    t.newReception.fields.manufactureDate, t.newReception.fields.expiryDate, t.receipts.table.expiry, t.receipts.table.quantity, t.newReception.fields.unit,
    t.newReception.fields.temperatureC, t.receipts.table.status, t.receipts.table.observations, t.receipts.table.createdBy,
  ].join(',');

  const rows = receipts
    .map((r) => {
      const mat = matMap.get(r.material_id);
      return [
        r.received_on,
        mat?.name ?? '',
        mat?.category ?? '',
        mat?.storageCondition ?? '',
        r.supplier,
        r.lot_code,
        r.manufacture_date,
        r.expiry_date,
        expiryLabels[r.expirationStatus] || r.expirationStatus,
        String(r.quantity),
        r.unit,
        r.temperature_c == null ? '' : String(r.temperature_c),
        statusLabels[r.status] || r.status,
        r.observations,
        r.created_by_name,
      ]
        .map(esc)
        .join(',');
    })
    .join('\n');

  return new Response(`${header}\n${rows}\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="receipts-export.csv"',
    },
  });
};
