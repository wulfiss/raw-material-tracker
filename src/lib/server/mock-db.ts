import type { MockUser } from './mock-auth';

export const units = ['kg', 'g', 'l', 'mL', 'unit', 'box', 'bag', 'pallet'] as const;
export const receiptStatuses = ['accepted', 'conditional', 'rejected'] as const;

export type Unit = (typeof units)[number];
export type ReceiptStatus = (typeof receiptStatuses)[number];

export type Material = {
  id: string;
  name: string;
  category: string;
  default_unit: Unit;
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

export type Reception = {
  id: string;
  received_on: string;
  material_id: string;
  supplier_name: string;
  supplier_id: string;
  lot_code: string;
  manufacture_date: string | null;
  expiry_date: string | null;
  quantity: number;
  unit: Unit;
  temperature_c: number | null;
  storage_condition: string | null;
  observations: string | null;
  created_at: string;
  created_by: string;
  created_by_name: string;
};

export type ReceiptListItem = Receipt & {
  material: Pick<Material, 'id' | 'name' | 'default_unit'> | null;
};

export type ReceptionListItem = Reception & {
  material: Pick<Material, 'id' | 'name' | 'default_unit'> | null;
} & {
  expirationDate?: string | null;
};

export type ReceptionFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  materialId?: string;
  category?: string;
  supplierId?: string;
  storageCondition?: string;
  expirationStatus?: 'expired' | 'near_expiry' | 'ok' | 'missing';
  withObservationsOnly?: boolean;
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
    default_unit: 'kg',
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
    default_unit: 'l',
    unit: 'l',
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

let receptions: Reception[] = [];

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
  
  materials.splice(index, 1);
  return { success: true } as const;
}

export async function getMaterialById(id: string) {
  return materials.find((material) => material.id === id) ?? null;
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
    default_unit: input.unit as Unit,
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

export async function createMaterial(input: {
  name: string;
  category: string;
  unit: string;
  default_unit?: Unit;
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
    default_unit: input.default_unit ?? unit,
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

export async function listReceptions(filters: ReceptionFilters = {}) {
  let rows = receptions.map((reception): ReceptionListItem => ({
    ...reception,
    // Map to match what frontend expects (property name)
    expirationDate: reception.expiry_date,
    material: materials.find((material) => material.id === reception.material_id) ?? null
  }));

  // Apply filters
  if (filters.search) {
    const normalizedSearch = filters.search.trim().toLowerCase();
    rows = rows.filter((reception) =>
      [reception.supplier_name, reception.lot_code, reception.material?.name ?? '', reception.observations ?? ''].some(
        (value) => value.toLowerCase().includes(normalizedSearch)
      )
    );
  }

  if (filters.dateFrom) {
    rows = rows.filter((reception) => reception.received_on >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    rows = rows.filter((reception) => reception.received_on <= filters.dateTo!);
  }

  if (filters.materialId) {
    rows = rows.filter((reception) => reception.material_id === filters.materialId);
  }

  if (filters.category) {
    rows = rows.filter((reception) => {
      const material = materials.find((m) => m.id === reception.material_id);
      return material?.category === filters.category;
    });
  }

  if (filters.supplierId) {
    rows = rows.filter((reception) => reception.supplier_id === filters.supplierId);
  }

  if (filters.storageCondition) {
    rows = rows.filter((reception) => reception.storage_condition === filters.storageCondition);
  }

  if (filters.expirationStatus) {
    // This would require more complex logic for expiration status calculation
    switch (filters.expirationStatus) {
      case 'expired':
        rows = rows.filter((reception) => {
          const material = materials.find((m) => m.id === reception.material_id);
          return !material || (reception.expiry_date && new Date(reception.expiry_date) < new Date());
        });
        break;
      case 'near_expiry':
        // Near expiry logic would be implemented here
        rows = rows.filter((reception) => {
          if (!reception.expiry_date) return false; 
          const today = new Date();
          const expiry = new Date(reception.expiry_date);
          
          // Within next 7 days is considered near expiry
          const sevenDaysFromNow = new Date(today);
          sevenDaysFromNow.setDate(today.getDate() + 7);
          
          return expiry >= today && expiry <= sevenDaysFromNow;
        });
        break;
      case 'missing':
        rows = rows.filter((reception) => !reception.expiry_date);
        break;
    }
  }

  if (filters.withObservationsOnly) {
    rows = rows.filter((reception) => reception.observations !== null && reception.observations.trim() !== '');
  }

  return rows.sort((a, b) =>
    b.received_on.localeCompare(a.received_on) || b.created_at.localeCompare(a.created_at)
  );
}

export async function createReception(
  input: Omit<Reception, 'id' | 'created_at' | 'created_by' | 'created_by_name'>,
  user: MockUser
) {
  const material = await getMaterial(input.material_id);
  if (!material || !material.active) {
    return { error: 'Select an active material.' } as const;
  }

  const reception: Reception = {
    ...input,
    id: id(),
    created_at: now(),
    created_by: user.id,
    created_by_name: user.name
  };

  receptions = [...receptions, reception];
  return { reception } as const;
}

export async function saveView({ name, filters }: { name: string; filters: ReceptionFilters }) {
  // Mock implementation - in-memory storage for views
  return { success: true } as const;
}