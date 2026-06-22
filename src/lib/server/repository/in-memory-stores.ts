import crypto from 'node:crypto';
import type {
  Material, Reception, ReceptionFilters, ReceptionView,
  Recipe, RecipeIngredient, Unit,
} from './types';
import type { MaterialStore, ReceptionStore, RecipeStore, ProductionBatchStore, ReceptionViewStore } from './stores';

export function createInMemoryMaterialStore(initial: Material[] = []): MaterialStore {
  const rows: Material[] = initial.map(m => ({ ...m }));

  return {
    async list(): Promise<Material[]> { return [...rows]; },

    async listActive(): Promise<Material[]> { return rows.filter(m => m.active); },

    async get(id: string): Promise<Material | null> { return rows.find(m => m.id === id) ?? null; },

    async getByName(name: string, excludeId?: string): Promise<Material | null> {
      return rows.find(m =>
        m.name.toLowerCase() === name.toLowerCase() &&
        m.id !== excludeId
      ) ?? null;
    },

    async create(data: {
      id: string;
      name: string;
      category: string;
      unit: Unit;
      storage_condition: string;
      min_stock: number;
      expiration_required: boolean;
      active: boolean;
      created_by: string;
      created_by_name: string;
    }): Promise<Material> {
      const m: Material = {
        id: data.id,
        name: data.name,
        category: data.category,
        unit: data.unit,
        storageCondition: data.storage_condition,
        minStock: data.min_stock,
        expirationRequired: data.expiration_required,
        active: data.active,
        created_at: new Date().toISOString(),
        created_by: data.created_by,
        created_by_name: data.created_by_name,
      };
      rows.push(m);
      return m;
    },

    async update(id: string, data: Partial<{
      name: string;
      category: string;
      unit: Unit;
      storage_condition: string;
      min_stock: number;
      expiration_required: boolean;
      active: boolean;
    }>): Promise<Material> {
      const idx = rows.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Material not found');
      if (data.name !== undefined) rows[idx].name = data.name;
      if (data.category !== undefined) rows[idx].category = data.category;
      if (data.unit !== undefined) rows[idx].unit = data.unit;
      if (data.storage_condition !== undefined) rows[idx].storageCondition = data.storage_condition;
      if (data.min_stock !== undefined) rows[idx].minStock = data.min_stock;
      if (data.expiration_required !== undefined) rows[idx].expirationRequired = data.expiration_required;
      if (data.active !== undefined) rows[idx].active = data.active;
      return { ...rows[idx] };
    },

    async delete(id: string): Promise<void> {
      const idx = rows.findIndex(m => m.id === id);
      if (idx !== -1) rows.splice(idx, 1);
    },

    async hasReceptions(_materialId: string): Promise<boolean> {
      return false;
    },
  };
}

export function createInMemoryReceptionStore(initial: Reception[] = []): ReceptionStore {
  const rows: Reception[] = initial.map(r => ({ ...r }));

  return {
    async queryRaw(filters: ReceptionFilters) {
      let filtered = [...rows];

      if (filters.dateFrom) filtered = filtered.filter(r => r.received_on >= filters.dateFrom!);
      if (filters.dateTo) filtered = filtered.filter(r => r.received_on <= filters.dateTo!);
      if (filters.materialId) filtered = filtered.filter(r => r.material_id === filters.materialId);

      filtered.sort((a, b) => {
        const c = b.received_on.localeCompare(a.received_on);
        if (c !== 0) return c;
        return b.created_at.localeCompare(a.created_at);
      });

      return { data: filtered.slice(0, 200), truncated: filtered.length > 200 };
    },

    async get(id: string): Promise<Reception | null> {
      return rows.find(r => r.id === id) ?? null;
    },

    async create(data: Record<string, unknown>): Promise<Reception> {
      const r: Reception = {
        id: data.id as string,
        received_on: data.received_on as string,
        material_id: data.material_id as string,
        supplier: data.supplier as string,
        lot_code: data.lot_code as string,
        manufacture_date: (data.manufacture_date as string) ?? null,
        expiry_date: (data.expiry_date as string) ?? null,
        quantity: Number(data.quantity),
        unit: data.unit as Unit,
        temperature_c: data.temperature_c != null ? Number(data.temperature_c) : null,
        status: data.status as Reception['status'],
        observations: (data.observations as string) ?? null,
        created_at: (data.created_at as string) ?? new Date().toISOString(),
        created_by: data.created_by as string,
        created_by_name: data.created_by_name as string,
      };
      rows.push(r);
      return r;
    },

    async update(id: string, data: Record<string, unknown>): Promise<Reception> {
      const idx = rows.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Reception not found');
      rows[idx] = { ...rows[idx], ...data as any };
      return rows[idx];
    },

    async delete(id: string): Promise<void> {
      const idx = rows.findIndex(r => r.id === id);
      if (idx !== -1) rows.splice(idx, 1);
    },

    async countExpired(beforeDate: string): Promise<number> {
      return rows.filter(r => r.expiry_date != null && r.expiry_date < beforeDate).length;
    },

    async countNearExpiry(fromDate: string, toDate: string): Promise<number> {
      return rows.filter(r => r.expiry_date != null && r.expiry_date >= fromDate && r.expiry_date <= toDate).length;
    },

    async countMissingExpiry(): Promise<number> {
      return rows.filter(r => r.expiry_date == null).length;
    },
  };
}

export function createInMemoryRecipeStore(initial: Recipe[] = [], initialIngredients: RecipeIngredient[] = []): RecipeStore {
  const recipes: Recipe[] = initial.map(r => ({ ...r }));
  const ingredients: RecipeIngredient[] = initialIngredients.map(i => ({ ...i }));

  return {
    async list(): Promise<Recipe[]> { return [...recipes]; },

    async get(id: string): Promise<Recipe | null> { return recipes.find(r => r.id === id) ?? null; },

    async getByName(name: string, excludeId?: string): Promise<Recipe | null> {
      return recipes.find(r =>
        r.name.toLowerCase() === name.toLowerCase() &&
        r.id !== excludeId
      ) ?? null;
    },

    async create(data: Record<string, unknown>): Promise<Recipe> {
      const r: Recipe = {
        id: data.id as string,
        name: data.name as string,
        category: (data.category as string) ?? null,
        yieldQuantity: Number(data.yield_quantity),
        yieldUnit: data.yield_unit as Unit,
        active: Boolean(data.active),
        notes: (data.notes as string) ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      recipes.push(r);
      return r;
    },

    async update(id: string, data: Record<string, unknown>): Promise<Recipe> {
      const idx = recipes.findIndex(r => r.id === id);
      if (idx === -1) throw new Error('Recipe not found');
      recipes[idx] = { ...recipes[idx], ...data as any, updated_at: new Date().toISOString() };
      return recipes[idx];
    },

    async delete(id: string): Promise<void> {
      const idx = recipes.findIndex(r => r.id === id);
      if (idx !== -1) recipes.splice(idx, 1);
    },

    async listIngredients(recipeId: string): Promise<RecipeIngredient[]> {
      return ingredients.filter(i => i.recipe_id === recipeId).sort((a, b) => a.sort_order - b.sort_order);
    },

    async replaceIngredients(recipeId: string, newIngredients: Array<{
      recipe_id: string;
      material_id: string;
      quantity: number;
      unit: Unit;
      loss_percent: number | null;
      notes: string | null;
      sort_order: number;
    }>): Promise<void> {
      const toRemove = ingredients.filter(i => i.recipe_id === recipeId);
      for (const ing of toRemove) {
        const idx = ingredients.indexOf(ing);
        if (idx !== -1) ingredients.splice(idx, 1);
      }
      for (const ing of newIngredients) {
        ingredients.push({
          id: crypto.randomUUID(),
          recipe_id: recipeId,
          material_id: ing.material_id,
          quantity: ing.quantity,
          unit: ing.unit,
          lossPercent: ing.loss_percent ?? null,
          notes: ing.notes ?? null,
          sort_order: ing.sort_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    },

    async getIngredientCounts(recipeIds: string[]): Promise<Map<string, number>> {
      const map = new Map<string, number>();
      for (const ing of ingredients) {
        if (recipeIds.includes(ing.recipe_id)) {
          map.set(ing.recipe_id, (map.get(ing.recipe_id) ?? 0) + 1);
        }
      }
      return map;
    },

    async getRecipeIngredient(id: string): Promise<RecipeIngredient | null> {
      return ingredients.find(i => i.id === id) ?? null;
    },
  };
}

export function createInMemoryProductionBatchStore(): ProductionBatchStore {
  const batches: Array<Record<string, unknown>> = [];

  return {
    async list(): Promise<Array<Record<string, unknown>>> { return [...batches]; },

    async getBase(id: string) {
      const b = batches.find(b => b.id === id);
      return b ? b as any : null;
    },

    async getFull(_id: string) { return null; },

    async create(data: Record<string, unknown>) {
      const b = { ...data, id: crypto.randomUUID() };
      batches.push(b);
      return b as any;
    },

    async createIngredient(data: Record<string, unknown>) {
      return { ...data, id: crypto.randomUUID() } as any;
    },

    async createLotUsage(_data: Record<string, unknown>): Promise<void> {},

    async update(id: string, data: Record<string, unknown>) {
      const idx = batches.findIndex(b => b.id === id);
      if (idx === -1) throw new Error('Batch not found');
      batches[idx] = { ...batches[idx], ...data };
      return batches[idx] as any;
    },

    async deleteLotUsages(_batchId: string): Promise<void> {},
    async deleteIngredients(_batchId: string): Promise<void> {},

    async deleteBatch(id: string): Promise<void> {
      const idx = batches.findIndex(b => b.id === id);
      if (idx !== -1) batches.splice(idx, 1);
    },
  };
}

export function createInMemoryReceptionViewStore(initial: ReceptionView[] = []): ReceptionViewStore {
  const rows: ReceptionView[] = initial.map(v => ({ ...v, filters: { ...v.filters } }));

  return {
    async list(): Promise<ReceptionView[]> { return [...rows]; },

    async save(id: string, name: string, filters: ReceptionFilters): Promise<void> {
      const existing = rows.find(v => v.name.toLowerCase() === name.toLowerCase());
      if (existing) throw new Error('A view with this name already exists.');
      rows.push({ id, name, default: false, filters });
    },

    async getByName(name: string): Promise<ReceptionView | null> {
      return rows.find(v => v.name.toLowerCase() === name.toLowerCase()) ?? null;
    },

    async delete(id: string): Promise<boolean> {
      const idx = rows.findIndex(v => v.id === id);
      if (idx === -1) return false;
      rows.splice(idx, 1);
      return true;
    },
  };
}
