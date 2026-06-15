import type { MockUser } from './mock-auth';

export const units = ['kg', 'g', 'l', 'unit', 'box'] as const;
export const receiptStatuses = ['accepted', 'conditional', 'rejected'] as const;

export type Unit = (typeof units)[number];
export type ReceiptStatus = (typeof receiptStatuses)[number];

export type Material = {
  id: string;
  name: string;
  category: string;
  default_unit: Unit;
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

export type ReceiptListItem = Receipt & {
  material: Pick<Material, 'id' | 'name' | 'default_unit'> | null;
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
    default_unit: 'kg',
    active: true,
    created_at: now(),
    created_by: systemUser.id,
    created_by_name: systemUser.name
  },
  {
    id: id(),
    name: 'Tomato',
    category: 'Vegetables',
    default_unit: 'kg',
    active: true,
    created_at: now(),
    created_by: systemUser.id,
    created_by_name: systemUser.name
  },
  {
    id: id(),
    name: 'Cooking oil',
    category: 'Dry goods',
    default_unit: 'l',
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

export async function createMaterial(input: Pick<Material, 'name' | 'category' | 'default_unit'>, user: MockUser) {
  const duplicate = materials.some((material) => material.name.toLowerCase() === input.name.toLowerCase());
  if (duplicate) {
    return { error: 'A material with this name already exists.' } as const;
  }

  const material: Material = {
    id: id(),
    name: input.name,
    category: input.category,
    default_unit: input.default_unit,
    active: true,
    created_at: now(),
    created_by: user.id,
    created_by_name: user.name
  };

  materials = [...materials, material];
  return { material } as const;
}

export async function listReceipts(search = '') {
  const normalizedSearch = search.trim().toLowerCase();

  const rows = receipts
    .map((receipt): ReceiptListItem => ({
      ...receipt,
      material: materials.find((material) => material.id === receipt.material_id) ?? null
    }))
    .filter((receipt) => {
      if (!normalizedSearch) return true;
      return [receipt.supplier, receipt.lot_code, receipt.material?.name ?? '', receipt.observations ?? ''].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      );
    })
    .sort((a, b) => b.received_on.localeCompare(a.received_on) || b.created_at.localeCompare(a.created_at))
    .slice(0, 100);

  return rows;
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
