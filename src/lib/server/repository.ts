import crypto from 'node:crypto';
import type { MockUser } from './mock-auth';
import { db } from './db';

export const units = ['kg', 'g', 'liter', 'unit', 'box'] as const;
export const storageConditions = ['refrigerated', 'frozen', 'dry', 'ambient'] as const;
export const receptionStatuses = ['accepted', 'conditional', 'rejected'] as const;

export type Unit = (typeof units)[number];
export type StorageCondition = (typeof storageConditions)[number];
export type ReceptionStatus = (typeof receptionStatuses)[number];

export type Material = {
  id: string;
  name: string;
  category: string;
  unit: Unit;
  storageCondition: string;
  minStock: number;
  expirationRequired: boolean;
  active: boolean;
  created_at: string;
  created_by: string;
  created_by_name: string;
};

export type Reception = {
  id: string;
  received_on: string;
  material_id: string;
  supplier: string;
  lot_code: string;
  manufacture_date: string | null;
  expiry_date: string | null;
  quantity: number;
  unit: Unit;
  temperature_c: number | null;
  status: ReceptionStatus;
  observations: string | null;
  created_at: string;
  created_by: string;
  created_by_name: string;
};

export type ExpirationStatus = 'expired' | 'near_expiry' | 'ok' | 'missing';

function offsetDateString(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function computeExpirationStatus(
  expiryDate: string | null,
  referenceDate?: string
): ExpirationStatus {
  if (!expiryDate) return 'missing';
  const today = referenceDate ?? todayInTimeZone();
  if (expiryDate < today) return 'expired';
  const nearThreshold = referenceDate ? offsetDateString(referenceDate, 7) : todayInTimeZone(7);
  if (expiryDate <= nearThreshold) return 'near_expiry';
  return 'ok';
}

export type ReceptionFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  materialId?: string;
  category?: string;
  supplier?: string;
  storageCondition?: string;
  expirationStatus?: ExpirationStatus;
  withObservationsOnly?: boolean;
};

export type ReceptionListItem = Reception & {
  material: Pick<Material, 'id' | 'name' | 'unit'> | null;
  expirationStatus: ExpirationStatus;
};

export function isUnit(value: string): value is Unit {
  return units.includes(value as Unit);
}

export function isReceptionStatus(value: string): value is ReceptionStatus {
  return receptionStatuses.includes(value as ReceptionStatus);
}

export function isDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function todayInTimeZone(offsetDays = 0, timeZone = 'America/Argentina/Buenos_Aires') {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function isMaterialUnit(unit: string): unit is Unit {
  return units.includes(unit as Unit);
}

export function isStorageCondition(value: string): value is StorageCondition {
  return storageConditions.includes(value as StorageCondition);
}

const expirationStatuses: ExpirationStatus[] = ['expired', 'near_expiry', 'ok', 'missing'];

export function isExpirationStatus(value: string): value is ExpirationStatus {
  return expirationStatuses.includes(value as ExpirationStatus);
}

// --- Saved Reception Views ---

export type ReceptionView = {
  id: string;
  name: string;
  default: boolean;
  filters: ReceptionFilters;
};

const defaultReceptionViews: ReceptionView[] = [
  { id: 'all', name: 'All receptions', default: true, filters: {} },
  { id: 'expired-view', name: 'Expired', default: true, filters: { expirationStatus: 'expired' } },
  { id: 'near-expiry-view', name: 'Near expiry', default: true, filters: { expirationStatus: 'near_expiry' } },
  { id: 'missing-view', name: 'Missing expiration', default: true, filters: { expirationStatus: 'missing' } },
];

export async function listReceptionViews(): Promise<ReceptionView[]> {
  const { data, error } = await db.from('reception_views').select().order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  const customViews: ReceptionView[] = (data ?? []).map(row => ({
    id: row.id as string,
    name: row.name as string,
    default: false,
    filters: row.filters as ReceptionFilters,
  }));
  return [...defaultReceptionViews, ...customViews];
}

export async function saveReceptionView(name: string, filters: ReceptionFilters): Promise<{ view: ReceptionView } | { error: string }> {
  const { data, error } = await db.from('reception_views').select('name').ilike('name', name).limit(1);
  if (error) throw new Error(error.message);
  if ((data ?? []).length > 0) return { error: 'A view with this name already exists.' };
  const id = 'custom-' + crypto.randomUUID();
  const { data: insertData, error: insertError } = await db.from('reception_views').insert({
    id,
    name,
    filters: filters as any,
  }).select().single();
  if (insertError) throw new Error(insertError.message);
  return { view: { id, name, default: false, filters } };
}

export async function deleteReceptionView(id: string): Promise<{ success: true } | { error: string }> {
  const { data, error } = await db.from('reception_views').delete().eq('id', id).select();
  if (error) throw new Error(error.message);
  if ((data ?? []).length === 0) return { error: 'View not found' };
  return { success: true };
}

// --- Supabase-backed Material functions ---

function toMaterial(row: Record<string, unknown>): Material {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    unit: row.unit as Unit,
    storageCondition: row.storage_condition as string,
    minStock: Number(row.min_stock),
    expirationRequired: Boolean(row.expiration_required),
    active: Boolean(row.active),
    created_at: row.created_at as string,
    created_by: row.created_by as string,
    created_by_name: row.created_by_name as string,
  };
}

export async function listMaterials(): Promise<Material[]> {
  const { data, error } = await db.from('materials').select().order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toMaterial);
}

export async function listActiveMaterials(): Promise<Material[]> {
  const { data, error } = await db.from('materials').select().eq('active', true).order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toMaterial);
}

export async function getMaterial(id: string): Promise<Material | null> {
  const { data, error } = await db.from('materials').select().eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toMaterial(data) : null;
}

export async function toggleMaterialStatus(id: string): Promise<{ material: Material } | { error: string }> {
  const material = await getMaterial(id);
  if (!material) return { error: 'Material not found' };
  const { data, error } = await db.from('materials').update({ active: !material.active }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { material: toMaterial(data) };
}

export async function deleteMaterial(id: string): Promise<{ success: true } | { success: true; deactivated: true } | { error: string }> {
  const material = await getMaterial(id);
  if (!material) return { error: 'Material not found' };
  const { data, error } = await db.from('receptions').select('id').eq('material_id', id).limit(1);
  if (error) throw new Error(error.message);
  if ((data ?? []).length > 0) {
    const { error: deactivateError } = await db.from('materials').update({ active: false }).eq('id', id);
    if (deactivateError) throw new Error(deactivateError.message);
    return { success: true, deactivated: true };
  }
  const { error: deleteError } = await db.from('materials').delete().eq('id', id);
  if (deleteError) throw new Error(deleteError.message);
  return { success: true };
}

export async function createMaterial(
  input: { name: string; category: string; unit: Unit; storageCondition?: string; minStock?: number; expirationRequired?: boolean; active?: boolean },
  user: MockUser
): Promise<{ material: Material } | { error: string }> {
  const { data, error } = await db.from('materials').select().ilike('name', input.name).limit(1);
  if (error) throw new Error(error.message);
  if ((data ?? []).length > 0) return { error: 'A material with this name already exists.' };
  const { data: insertData, error: insertError } = await db.from('materials').insert({
    name: input.name,
    category: input.category,
    unit: input.unit,
    storage_condition: input.storageCondition ?? 'ambient',
    min_stock: input.minStock ?? 0,
    expiration_required: input.expirationRequired ?? false,
    active: input.active ?? true,
    created_by: user.id,
    created_by_name: user.name,
  }).select().single();
  if (insertError) throw new Error(insertError.message);
  return { material: toMaterial(insertData) };
}

export async function updateMaterial(
  id: string,
  input: { name: string; category: string; unit: Unit; storageCondition: string; minStock?: number; expirationRequired?: boolean; active?: boolean }
): Promise<{ material: Material } | { error: string }> {
  const { data, error } = await db.from('materials').select().ilike('name', input.name).neq('id', id).limit(1);
  if (error) throw new Error(error.message);
  if ((data ?? []).length > 0) return { error: 'A material with this name already exists.' };
  const { data: updateData, error: updateError } = await db.from('materials').update({
    name: input.name,
    category: input.category,
    unit: input.unit,
    storage_condition: input.storageCondition,
    min_stock: input.minStock,
    expiration_required: input.expirationRequired,
    active: input.active,
  }).eq('id', id).select().single();
  if (updateError) throw new Error(updateError.message);
  return { material: toMaterial(updateData) };
}

// --- Supabase-backed Reception functions ---

function toReception(row: Record<string, unknown>): Reception {
  return {
    id: row.id as string,
    received_on: row.received_on as string,
    material_id: row.material_id as string,
    supplier: row.supplier as string,
    lot_code: row.lot_code as string,
    manufacture_date: (row.manufacture_date as string) ?? null,
    expiry_date: (row.expiry_date as string) ?? null,
    quantity: Number(row.quantity),
    unit: row.unit as Unit,
    temperature_c: row.temperature_c != null ? Number(row.temperature_c) : null,
    status: row.status as ReceptionStatus,
    observations: (row.observations as string) ?? null,
    created_at: row.created_at as string,
    created_by: row.created_by as string,
    created_by_name: row.created_by_name as string,
  };
}

export async function listReceptions(filters: ReceptionFilters = {}): Promise<{ rows: ReceptionListItem[], truncated: boolean }> {
  let query = db.from('receptions')
    .select('*, material:materials(id, name, unit, category, storage_condition)')
    .order('received_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);

  if (filters.dateFrom)    query = query.gte('received_on', filters.dateFrom);
  if (filters.dateTo)      query = query.lte('received_on', filters.dateTo);
  if (filters.materialId)  query = query.eq('material_id', filters.materialId);
  if (filters.supplier)    query = query.ilike('supplier', `%${filters.supplier.trim()}%`);
  // PostgREST supports embedded-resource filters via "alias.column" dot notation.
  // Supabase JS types don't expose this, so `as any` bypasses the type check — runtime behavior is correct.
  if (filters.category)         query = (query as any).eq('material.category', filters.category);
  if (filters.storageCondition) query = (query as any).eq('material.storage_condition', filters.storageCondition);
  if (filters.withObservationsOnly) {
    query = query.not('observations', 'is', null).neq('observations', '');
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const normalized = (filters.search ?? '').trim().toLowerCase();
  let rows = (data ?? []).filter(r => {
    const matName = (r.material as any)?.name ?? '';
    if (normalized) {
      const matches = [r.supplier, r.lot_code, matName, r.observations ?? '']
        .some(v => v.toLowerCase().includes(normalized));
      if (!matches) return false;
    }
 
    if (filters.expirationStatus) {
      if (computeExpirationStatus(r.expiry_date) !== filters.expirationStatus) return false;
    }
    return true;
  });

  // Truncated only when the DB hit its cap — meaning more rows exist that we didn't fetch.
  // The display is capped at 100 rows regardless, but that's a render limit, not missing data.
  const dbTruncated = (data ?? []).length === 200;
  const truncated = dbTruncated;
  const mapped: ReceptionListItem[] = rows.slice(0, 100).map(r => {
    const mat = r.material as any;
    return {
      ...toReception(r),
      material: mat ? { id: mat.id, name: mat.name, unit: mat.unit } : null,
      expirationStatus: computeExpirationStatus(r.expiry_date),
    };
  });
  return { rows: mapped, truncated };
}

export async function getReception(id: string): Promise<Reception | null> {
  const { data, error } = await db.from('receptions').select().eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toReception(data) : null;
}

export async function createReception(
  input: Omit<Reception, 'id' | 'created_at' | 'created_by' | 'created_by_name'>,
  user: MockUser
): Promise<{ reception: Reception } | { error: string }> {
  const material = await getMaterial(input.material_id);
  if (!material || !material.active) return { error: 'Select an active material.' };

  const { data, error } = await db.from('receptions').insert({
    ...input,
    created_by: user.id,
    created_by_name: user.name,
  }).select().single();
  if (error) throw new Error(error.message);
  return { reception: toReception(data) };
}

export async function updateReception(
  id: string,
  input: Omit<Reception, 'id' | 'created_at' | 'created_by' | 'created_by_name'>,
  user: MockUser
): Promise<{ reception: Reception } | { error: string }> {
  const existing = await getReception(id);
  if (!existing) return { error: 'Reception not found.' };

  const material = await getMaterial(input.material_id);
  if (!material || !material.active) return { error: 'Select an active material.' };

  const { data, error } = await db.from('receptions').update({
    ...input,
    created_by: existing.created_by,
    created_by_name: existing.created_by_name,
  }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return { reception: toReception(data) };
}

export async function deleteReception(id: string): Promise<{ success: true } | { error: string }> {
  const existing = await getReception(id);
  if (!existing) return { error: 'Reception not found.' };
  const { error } = await db.from('receptions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getExpirationSummary(): Promise<{ expired: number; near_expiry: number; missing: number }> {
  const today = todayInTimeZone();
  const nearLimit = todayInTimeZone(7);

  const [expiredRes, nearRes, missingRes] = await Promise.all([
    db.from('receptions')
      .select('*', { count: 'exact', head: true })
      .lt('expiry_date', today),
    db.from('receptions')
      .select('*', { count: 'exact', head: true })
      .gte('expiry_date', today)
      .lte('expiry_date', nearLimit),
    db.from('receptions')
      .select('*, material:materials!inner(expiration_required)', { count: 'exact', head: true })
      .is('expiry_date', null)
      .eq('material.expiration_required', true),
  ]);

  if (expiredRes.error) throw new Error(expiredRes.error.message);
  if (nearRes.error) throw new Error(nearRes.error.message);
  if (missingRes.error) throw new Error(missingRes.error.message);

  return {
    expired: expiredRes.count ?? 0,
    near_expiry: nearRes.count ?? 0,
    missing: missingRes.count ?? 0,
  };
}
