import { supabaseAdmin } from './supabase';
import type { User } from './auth';

// ── Constants ──────────────────────────────────────────────────

export const units = ['kg', 'g', 'liter', 'unit', 'box'] as const;
export const storageConditions = ['refrigerated', 'frozen', 'dry', 'ambient'] as const;
export const receptionStatuses = ['accepted', 'conditional', 'rejected'] as const;

export type Unit = (typeof units)[number];
export type StorageCondition = (typeof storageConditions)[number];
export type ReceptionStatus = (typeof receptionStatuses)[number];

// ── App-level Types (camelCase, matching original mock-db) ─────

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

export type ReceptionView = {
  id: string;
  name: string;
  default: boolean;
  filters: ReceptionFilters;
};

// ── Expiration Helpers ─────────────────────────────────────────

function todayInTimeZone(offsetDays = 0, timeZone = 'America/Argentina/Buenos_Aires') {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const part = (type: string) => parts.find((e) => e.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export { todayInTimeZone };

export function computeExpirationStatus(
  expiryDate: string | null,
  referenceDate?: string
): ExpirationStatus {
  if (!expiryDate) return 'missing';
  const today = referenceDate ?? todayInTimeZone();
  if (expiryDate < today) return 'expired';
  const nearThreshold = todayInTimeZone(7);
  if (expiryDate <= nearThreshold) return 'near_expiry';
  return 'ok';
}

// ── Validation Helpers ─────────────────────────────────────────

export function isUnit(value: string): value is Unit {
  return units.includes(value as Unit);
}

export function isMaterialUnit(value: string): value is Unit {
  return isUnit(value);
}

export function isReceptionStatus(value: string): value is ReceptionStatus {
  return receptionStatuses.includes(value as ReceptionStatus);
}

export function isStorageCondition(value: string): value is StorageCondition {
  return storageConditions.includes(value as StorageCondition);
}

export function isDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isExpirationStatus(value: string): value is ExpirationStatus {
  return ['expired', 'near_expiry', 'ok', 'missing'].includes(value);
}

export { isExpirationStatus };

// ── Row Mapping ────────────────────────────────────────────────

function materialRow(row: Record<string, unknown>): Material {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    unit: row.unit as Unit,
    storageCondition: row.storage_condition as string,
    minStock: Number(row.min_stock),
    expirationRequired: row.expiration_required as boolean,
    active: row.active as boolean,
    created_at: row.created_at as string,
    created_by: row.created_by as string,
    created_by_name: row.created_by_name as string
  };
}

function receptionRow(row: Record<string, unknown>): Reception {
  return {
    id: row.id as string,
    received_on: row.received_on as string,
    material_id: row.material_id as string,
    supplier: row.supplier as string,
    lot_code: row.lot_code as string,
    manufacture_date: row.manufacture_date as string | null,
    expiry_date: row.expiry_date as string | null,
    quantity: Number(row.quantity),
    unit: row.unit as Unit,
    temperature_c: row.temperature_c as number | null,
    status: row.status as ReceptionStatus,
    observations: row.observations as string | null,
    created_at: row.created_at as string,
    created_by: row.created_by as string,
    created_by_name: row.created_by_name as string
  };
}

// ── Materials ──────────────────────────────────────────────────

export async function listMaterials() {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(materialRow);
}

export async function listActiveMaterials() {
  const all = await listMaterials();
  return all.filter((m) => m.active);
}

export async function getMaterial(id: string) {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return materialRow(data);
}

export { getMaterial as getMaterialById };

export async function createMaterial(
  input: {
    name: string;
    category: string;
    unit: string;
    storageCondition?: string;
    minStock?: number;
    expirationRequired?: boolean;
    active?: boolean;
  },
  user: User
) {
  const duplicate = await checkDuplicateName(input.name);
  if (duplicate) {
    return { error: 'A material with this name already exists.' } as const;
  }

  const { data, error } = await supabaseAdmin
    .from('materials')
    .insert({
      name: input.name,
      category: input.category,
      unit: input.unit,
      storage_condition: input.storageCondition ?? 'ambient',
      min_stock: input.minStock ?? 0,
      expiration_required: input.expirationRequired ?? false,
      active: input.active ?? true,
      created_by: user.id,
      created_by_name: user.name
    })
    .select()
    .single();

  if (error) return { error: error.message } as const;
  return { material: materialRow(data) } as const;
}

async function checkDuplicateName(name: string, excludeId?: string) {
  let query = supabaseAdmin
    .from('materials')
    .select('id')
    .ilike('name', name);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data } = await query;
  return data && data.length > 0;
}

export async function updateMaterial(
  id: string,
  input: {
    name: string;
    category: string;
    unit: string;
    storageCondition: string;
    minStock?: number;
    expirationRequired: boolean;
    active: boolean;
  }
) {
  const duplicate = await checkDuplicateName(input.name, id);
  if (duplicate) {
    return { error: 'A material with this name already exists.' } as const;
  }

  const { data, error } = await supabaseAdmin
    .from('materials')
    .update({
      name: input.name,
      category: input.category,
      unit: input.unit,
      storage_condition: input.storageCondition,
      min_stock: input.minStock ?? 0,
      expiration_required: input.expirationRequired,
      active: input.active
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message } as const;
  return { material: materialRow(data) } as const;
}

export async function toggleMaterialStatus(id: string) {
  const material = await getMaterial(id);
  if (!material) return { error: 'Material not found' } as const;

  const { data, error } = await supabaseAdmin
    .from('materials')
    .update({ active: !material.active })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message } as const;
  return { material: materialRow(data) } as const;
}

export async function deleteMaterial(id: string) {
  const { data: usedReceptions } = await supabaseAdmin
    .from('receptions')
    .select('id')
    .eq('material_id', id)
    .limit(1);

  const isUsed = usedReceptions && usedReceptions.length > 0;

  if (isUsed) {
    await supabaseAdmin
      .from('materials')
      .update({ active: false })
      .eq('id', id);

    return { success: true, deactivated: true } as const;
  }

  const { error } = await supabaseAdmin
    .from('materials')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message } as const;
  return { success: true } as const;
}

// ── Receptions ─────────────────────────────────────────────────

export async function listReceptions(filters: ReceptionFilters = {}) {
  let query = supabaseAdmin
    .from('receptions')
    .select(`*, materials(id, name, unit)`)
    .order('received_on', { ascending: false })
    .limit(100);

  if (filters.dateFrom) {
    query = query.gte('received_on', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('received_on', filters.dateTo);
  }
  if (filters.materialId) {
    query = query.eq('material_id', filters.materialId);
  }

  const { data: rows, error } = await query;
  if (error) throw error;

  const normalizedSearch = (filters.search ?? '').trim().toLowerCase();

  let items: ReceptionListItem[] = (rows ?? []).map((r) => {
    const mat = r.materials as { id: string; name: string; unit: string } | null;
    return {
      ...receptionRow(r),
      material: mat ? { id: mat.id, name: mat.name, unit: mat.unit as Unit } : null,
      expirationStatus: computeExpirationStatus(r.expiry_date)
    };
  });

  if (normalizedSearch) {
    items = items.filter((item) =>
      [item.supplier, item.lot_code, item.material?.name ?? '', item.observations ?? '']
        .some((v) => v.toLowerCase().includes(normalizedSearch))
    );
  }

  if (filters.category) {
    const { data: catMaterials } = await supabaseAdmin
      .from('materials')
      .select('id')
      .eq('category', filters.category);

    const ids = new Set((catMaterials ?? []).map((m) => m.id));
    items = items.filter((item) => ids.has(item.material_id));
  }

  if (filters.supplier) {
    const sq = filters.supplier.trim().toLowerCase();
    items = items.filter((item) => item.supplier.toLowerCase().includes(sq));
  }

  if (filters.storageCondition) {
    const { data: condMaterials } = await supabaseAdmin
      .from('materials')
      .select('id')
      .eq('storage_condition', filters.storageCondition);

    const ids = new Set((condMaterials ?? []).map((m) => m.id));
    items = items.filter((item) => ids.has(item.material_id));
  }

  if (filters.expirationStatus) {
    items = items.filter(
      (item) => item.expirationStatus === filters.expirationStatus
    );
  }

  if (filters.withObservationsOnly) {
    items = items.filter(
      (item) => item.observations && item.observations.trim().length > 0
    );
  }

  return items;
}

export async function createReception(
  input: Omit<Reception, 'id' | 'created_at' | 'created_by' | 'created_by_name'>,
  user: User
) {
  const material = await getMaterial(input.material_id);
  if (!material || !material.active) {
    return { error: 'Select an active material.' } as const;
  }

  const { data, error } = await supabaseAdmin
    .from('receptions')
    .insert({
      received_on: input.received_on,
      material_id: input.material_id,
      supplier: input.supplier,
      lot_code: input.lot_code,
      manufacture_date: input.manufacture_date,
      expiry_date: input.expiry_date,
      quantity: input.quantity,
      unit: input.unit,
      temperature_c: input.temperature_c,
      status: input.status,
      observations: input.observations,
      created_by: user.id,
      created_by_name: user.name
    })
    .select()
    .single();

  if (error) return { error: error.message } as const;
  return { reception: receptionRow(data) } as const;
}

export async function getReception(id: string) {
  const { data, error } = await supabaseAdmin
    .from('receptions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return receptionRow(data);
}

export async function updateReception(
  id: string,
  input: Omit<Reception, 'id' | 'created_at' | 'created_by' | 'created_by_name'>,
  user: User
) {
  const material = await getMaterial(input.material_id);
  if (!material || !material.active) {
    return { error: 'Select an active material.' } as const;
  }

  const { data: existing } = await supabaseAdmin
    .from('receptions')
    .select('created_at, created_by, created_by_name')
    .eq('id', id)
    .single();

  if (!existing) return { error: 'Reception not found.' } as const;

  const { data, error } = await supabaseAdmin
    .from('receptions')
    .update({
      received_on: input.received_on,
      material_id: input.material_id,
      supplier: input.supplier,
      lot_code: input.lot_code,
      manufacture_date: input.manufacture_date,
      expiry_date: input.expiry_date,
      quantity: input.quantity,
      unit: input.unit,
      temperature_c: input.temperature_c,
      status: input.status,
      observations: input.observations,
      created_by: existing.created_by,
      created_by_name: existing.created_by_name
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message } as const;
  return { reception: receptionRow(data) } as const;
}

export async function deleteReception(id: string) {
  const { error } = await supabaseAdmin
    .from('receptions')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message } as const;
  return { success: true } as const;
}

// ── Reception Views ────────────────────────────────────────────

export async function listReceptionViews() {
  const { data, error } = await supabaseAdmin
    .from('reception_views')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  const defaultViews: ReceptionView[] = [
    { id: 'all', name: 'All receptions', default: true, filters: {} },
    { id: 'expired-view', name: 'Expired', default: true, filters: { expirationStatus: 'expired' } },
    { id: 'near-expiry-view', name: 'Near expiry', default: true, filters: { expirationStatus: 'near_expiry' } },
    { id: 'missing-view', name: 'Missing expiration', default: true, filters: { expirationStatus: 'missing' } },
  ];

  const customViews: ReceptionView[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    default: row.is_default,
    filters: row.filters as ReceptionFilters
  }));

  return [...defaultViews, ...customViews];
}

export async function saveReceptionView(name: string, filters: ReceptionFilters) {
  const { data, error } = await supabaseAdmin
    .from('reception_views')
    .insert({
      name,
      filters: JSON.stringify(filters),
      is_default: false
    })
    .select()
    .single();

  if (error) return { error: error.message } as const;

  return {
    view: { id: data.id, name: data.name, default: data.is_default, filters: data.filters as ReceptionFilters }
  } as const;
}

export async function deleteReceptionView(id: string) {
  const { error } = await supabaseAdmin
    .from('reception_views')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message } as const;
  return { success: true } as const;
}
