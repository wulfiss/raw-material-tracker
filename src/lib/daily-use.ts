export type DailyUseFields = {
  used_on: string;
  material_id: string;
  supplier: string;
  lot_code: string;
  expiry_date: string;
  product_ids: string[];
  request_token: string;
};
export type DailyUseRecord = Omit<DailyUseFields, 'product_ids'> & {
  id: string;
  material_name: string;
  created_by_name: string;
  products: { recipe_id: string; product_name: string }[];
};
export type DailyUseOption = { id: string; name: string; active: boolean };
export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function readDailyUseFields(form: FormData): DailyUseFields {
  const text = (name: string) => typeof form.get(name) === 'string' ? String(form.get(name)).trim() : '';
  return {
    used_on: text('used_on'), material_id: text('material_id'), supplier: text('supplier'), lot_code: text('lot_code'),
    expiry_date: text('expiry_date'), request_token: text('request_token'),
    product_ids: [...new Set(form.getAll('product_ids').filter((v): v is string => typeof v === 'string'))]
  };
}
export function validateDailyUse(fields: DailyUseFields): 'date' | 'material' | 'supplier' | 'lot' | 'expiry' | 'products' | 'unexpected' | null {
  if (!isCalendarDate(fields.used_on)) return 'date';
  if (!isUuid(fields.material_id)) return 'material';
  if (!fields.supplier || fields.supplier.length > 160) return 'supplier';
  if (fields.lot_code.length > 120) return 'lot';
  if (!isCalendarDate(fields.expiry_date)) return 'expiry';
  if (!fields.product_ids.length || fields.product_ids.length > 100 || fields.product_ids.some(id => !isUuid(id))) return 'products';
  if (!isUuid(fields.request_token)) return 'unexpected';
  return null;
}
