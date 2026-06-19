import type { MockUser } from './mock-auth';

export const units = ['kg', 'g', 'liter', 'unit', 'box'] as const;
export const storageConditions = ['refrigerated', 'frozen', 'dry', 'ambient'] as const;
export const receiptStatuses = ['accepted', 'conditional', 'rejected'] as const;

export type Unit = (typeof units)[number];
export type StorageCondition = (typeof storageConditions)[number];
export type ReceiptStatus = (typeof receiptStatuses)[number];

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

export type Receipt = {
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
  status: ReceiptStatus;
  observations: string | null;
  created_at: string;
  created_by: string;
  created_by_name: string;
};

export type ExpirationStatus = 'expired' | 'near_expiry' | 'ok' | 'missing';

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

export type ReceiptFilters = {
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

export type ReceiptListItem = Receipt & {
  material: Pick<Material, 'id' | 'name' | 'unit'> | null;
  expirationStatus: ExpirationStatus;
};

const now = () => new Date().toISOString();
const id = () => globalThis.crypto.randomUUID();

const systemUser: Pick<MockUser, 'id' | 'name'> = {
  id: 'seed-user',
  name: 'Seed data'
};

let materials: Material[] = [
  {
    id: id(),
    name: 'Chicken breast',
    category: 'Meat',
    unit: 'kg',
    storageCondition: 'refrigerated',
    minStock: 10,
    expirationRequired: true,
    active: true,
    created_at: now(),
    created_by: systemUser.id,
    created_by_name: systemUser.name
  },
  {
    id: id(),
    name: 'Tomato',
    category: 'Vegetables',
    unit: 'kg',
    storageCondition: 'refrigerated',
    minStock: 5,
    expirationRequired: true,
    active: true,
    created_at: now(),
    created_by: systemUser.id,
    created_by_name: systemUser.name
  },
  {
    id: id(),
    name: 'Cooking oil',
    category: 'Dry goods',
    unit: 'liter',
    storageCondition: 'ambient',
    minStock: 3,
    expirationRequired: false,
    active: true,
    created_at: now(),
    created_by: systemUser.id,
    created_by_name: systemUser.name
  }
];

let receipts: Receipt[] = [
  {
    id: id(),
    received_on: todayInTimeZone(),
    material_id: materials[0].id,
    supplier: 'Local poultry supplier',
    lot_code: 'POL-001',
    manufacture_date: todayInTimeZone(-1),
    expiry_date: todayInTimeZone(5),
    quantity: 18.5,
    unit: 'kg',
    temperature_c: 3.2,
    status: 'accepted',
    observations: 'Seed mock record.',
    created_at: now(),
    created_by: systemUser.id,
    created_by_name: systemUser.name
  }
];

export function isUnit(value: string): value is Unit {
  return units.includes(value as Unit);
}

export function isReceiptStatus(value: string): value is ReceiptStatus {
  return receiptStatuses.includes(value as ReceiptStatus);
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

export async function listMaterials() {
  return [...materials].sort((a, b) => a.name.localeCompare(b.name));
}

export async function listActiveMaterials() {
  return (await listMaterials()).filter((material) => material.active);
}

export async function getMaterial(id: string) {
  return materials.find((material) => material.id === id) ?? null;
}

export async function toggleMaterialStatus(id: string) {
  const index = materials.findIndex((material) => material.id === id);
  if (index === -1) return { error: 'Material not found' } as const;
  
  materials[index] = { ...materials[index], active: !materials[index].active };
  return { material: materials[index] } as const;
}

export async function deleteMaterial(id: string) {
  const index = materials.findIndex((material) => material.id === id);
  if (index === -1) return { error: 'Material not found' } as const;

  const isUsed = receipts.some((r) => r.material_id === id);
  if (isUsed) {
    materials[index] = { ...materials[index], active: false };
    return { success: true, deactivated: true } as const;
  }

  materials.splice(index, 1);
  return { success: true } as const;
}

export async function getMaterialById(id: string) {
  return getMaterial(id);
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
  const index = materials.findIndex((material) => material.id === id);
  if (index === -1) return { error: 'Material not found' } as const;
  
  const duplicate = materials.some(
    (material) => 
      material.name.toLowerCase() === input.name.toLowerCase() && 
      material.id !== id
  );
  if (duplicate) {
    return { error: 'A material with this name already exists.' } as const;
  }
  
  materials[index] = {
    ...materials[index],
    name: input.name,
    category: input.category,
    unit: input.unit as Unit,
    storageCondition: input.storageCondition,
    minStock: input.minStock ?? 0,
    expirationRequired: input.expirationRequired,
    active: input.active
  };
  return { material: materials[index] } as const;
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

export async function createMaterial(input: {
  name: string;
  category: string;
  unit: string;
  storageCondition?: string;
  minStock?: number;
  expirationRequired?: boolean;
  active?: boolean;
}, user: MockUser) {
  const duplicate = materials.some((material) => material.name.toLowerCase() === input.name.toLowerCase());
  if (duplicate) {
    return { error: 'A material with this name already exists.' } as const;
  }

  const unit = input.unit as Unit;
  const material: Material = {
    id: id(),
    name: input.name,
    category: input.category,
    unit,
    storageCondition: input.storageCondition ?? 'ambient',
    minStock: input.minStock ?? 0,
    expirationRequired: input.expirationRequired ?? false,
    active: input.active ?? true,
    created_at: now(),
    created_by: user.id,
    created_by_name: user.name
  };

  materials = [...materials, material];
  return { material } as const;
}

export async function listReceipts(filters: ReceiptFilters = {}) {
  const normalizedSearch = (filters.search ?? '').trim().toLowerCase();

  let rows = receipts
    .map((receipt): ReceiptListItem => ({
      ...receipt,
      material: materials.find((material) => material.id === receipt.material_id) ?? null,
      expirationStatus: computeExpirationStatus(receipt.expiry_date)
    }))
    .filter((receipt) => {
      if (normalizedSearch) {
        const matches = [receipt.supplier, receipt.lot_code, receipt.material?.name ?? '', receipt.observations ?? ''].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        );
        if (!matches) return false;
      }

      if (filters.dateFrom && receipt.received_on < filters.dateFrom) return false;
      if (filters.dateTo && receipt.received_on > filters.dateTo) return false;
      if (filters.materialId && receipt.material_id !== filters.materialId) return false;
      if (filters.supplier) {
        const supplierQuery = filters.supplier.trim().toLowerCase();
        if (!receipt.supplier.toLowerCase().includes(supplierQuery)) return false;
      }
      if (filters.category) {
        const material = materials.find((m) => m.id === receipt.material_id);
        if (material?.category !== filters.category) return false;
      }
      if (filters.storageCondition) {
        const material = materials.find((m) => m.id === receipt.material_id);
        if (material?.storageCondition !== filters.storageCondition) return false;
      }
      if (filters.expirationStatus) {
        const status = computeExpirationStatus(receipt.expiry_date);
        if (status !== filters.expirationStatus) return false;
      }
      if (filters.withObservationsOnly && (!receipt.observations || !receipt.observations.trim())) return false;

      return true;
    });

  return rows
    .sort((a, b) => b.received_on.localeCompare(a.received_on) || b.created_at.localeCompare(a.created_at))
    .slice(0, 100);
}

export async function createReceipt(
  input: Omit<Receipt, 'id' | 'created_at' | 'created_by' | 'created_by_name'>,
  user: MockUser
) {
  const material = await getMaterial(input.material_id);
  if (!material || !material.active) {
    return { error: 'Select an active material.' } as const;
  }

  const receipt: Receipt = {
    ...input,
    id: id(),
    created_at: now(),
    created_by: user.id,
    created_by_name: user.name
  };

  receipts = [...receipts, receipt];
  return { receipt } as const;
}

export async function getReceipt(id: string) {
  return receipts.find((receipt) => receipt.id === id) ?? null;
}

export async function updateReceipt(
  id: string,
  input: Omit<Receipt, 'id' | 'created_at' | 'created_by' | 'created_by_name'>,
  user: MockUser
) {
  const index = receipts.findIndex((receipt) => receipt.id === id);
  if (index === -1) return { error: 'Receipt not found.' } as const;

  const material = await getMaterial(input.material_id);
  if (!material || !material.active) {
    return { error: 'Select an active material.' } as const;
  }

  receipts[index] = {
    ...input,
    id,
    created_at: receipts[index].created_at,
    created_by: receipts[index].created_by,
    created_by_name: receipts[index].created_by_name
  };
  return { receipt: receipts[index] } as const;
}

export async function deleteReceipt(id: string) {
  const index = receipts.findIndex((receipt) => receipt.id === id);
  if (index === -1) return { error: 'Receipt not found.' } as const;
  receipts.splice(index, 1);
  return { success: true } as const;
}

// --- Saved Receipt Views ---

export type ReceiptView = {
  id: string;
  name: string;
  default: boolean;
  filters: ReceiptFilters;
};

const defaultReceiptViews: ReceiptView[] = [
  { id: 'all', name: 'All receipts', default: true, filters: {} },
  { id: 'expired-view', name: 'Expired', default: true, filters: { expirationStatus: 'expired' } },
  { id: 'near-expiry-view', name: 'Near expiry', default: true, filters: { expirationStatus: 'near_expiry' } },
  { id: 'missing-view', name: 'Missing expiration', default: true, filters: { expirationStatus: 'missing' } },
];

let customReceiptViews: ReceiptView[] = [];

export async function listReceiptViews() {
  return [...defaultReceiptViews, ...customReceiptViews];
}

export async function saveReceiptView(name: string, filters: ReceiptFilters) {
  const view: ReceiptView = {
    id: `custom-${globalThis.crypto.randomUUID()}`,
    name,
    default: false,
    filters
  };
  customReceiptViews = [...customReceiptViews, view];
  return { view } as const;
}

export async function deleteReceiptView(id: string) {
  const before = customReceiptViews.length;
  customReceiptViews = customReceiptViews.filter((v) => v.id !== id);
  if (customReceiptViews.length === before) {
    return { error: 'View not found' } as const;
  }
  return { success: true } as const;
}