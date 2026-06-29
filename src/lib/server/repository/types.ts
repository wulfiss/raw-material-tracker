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

export type Recipe = {
  id: string;
  name: string;
  category: string | null;
  yieldQuantity: number;
  yieldUnit: Unit;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  material_id: string;
  quantity: number;
  unit: Unit;
  lossPercent: number | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type RecipeListItem = Recipe & {
  ingredientCount: number;
};

const productionBatchStatuses = ['planned', 'in_progress', 'completed'] as const;

export function isProductionBatchStatus(value: string): value is ProductionBatchStatus {
  return productionBatchStatuses.includes(value as ProductionBatchStatus);
}

export type ProductionBatchStatus = (typeof productionBatchStatuses)[number];

export type ProductionBatch = {
  id: string;
  batch_number: string;
  recipe_id: string;
  status: ProductionBatchStatus;
  planned_yield: number;
  actual_yield: number | null;
  yield_unit: Unit;
  started_at: string | null;
  completed_at: string | null;
  observations: string | null;
  created_at: string;
  created_by: string;
};

export type ProductionBatchIngredient = {
  id: string;
  batch_id: string;
  recipe_ingredient_id: string;
  material_id: string;
  planned_quantity: number;
  unit: Unit;
};

export type ProductionBatchLotUsage = {
  id: string;
  batch_id: string;
  batch_ingredient_id: string;
  reception_id: string;
  quantity_used: number;
  unit: Unit;
};

export type ProductionBatchDetail = ProductionBatch & {
  recipe: Recipe | null;
  ingredients: (ProductionBatchIngredient & {
    material: Pick<Material, 'id' | 'name' | 'unit'> | null;
    recipe_ingredient: RecipeIngredient | null;
    lot_usages: (ProductionBatchLotUsage & {
      reception: Pick<Reception, 'id' | 'lot_code' | 'expiry_date' | 'quantity'> | null;
    })[];
  })[];
};

export type CreateBatchIngredientInput = {
  recipe_ingredient_id: string;
  material_id: string;
  planned_quantity: number;
  unit: Unit;
  lot_usages: Array<{
    reception_id: string;
    quantity_used: number;
  }>;
};

export type Result<T> = { ok: T } | { error: string };

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
