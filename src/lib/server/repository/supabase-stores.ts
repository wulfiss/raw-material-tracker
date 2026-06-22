import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Material, Reception, ReceptionFilters, ReceptionView,
  Recipe, RecipeIngredient, Unit, ProductionBatch, ProductionBatchIngredient, ProductionBatchStatus,
} from './types';
import { computeExpirationStatus, todayInTimeZone, units } from './types';
import type { MaterialStore, ReceptionStore, RecipeStore, ProductionBatchStore, ReceptionViewStore } from './stores';

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
    status: row.status as Reception['status'],
    observations: (row.observations as string) ?? null,
    created_at: row.created_at as string,
    created_by: row.created_by as string,
    created_by_name: row.created_by_name as string,
  };
}

export function createSupabaseMaterialStore(client: SupabaseClient): MaterialStore {
  return {
    async list(): Promise<Material[]> {
      const { data, error } = await client.from('materials').select().order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(toMaterial);
    },

    async listActive(): Promise<Material[]> {
      const { data, error } = await client.from('materials').select().eq('active', true).order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(toMaterial);
    },

    async get(id: string): Promise<Material | null> {
      const { data, error } = await client.from('materials').select().eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toMaterial(data) : null;
    },

    async getByName(name: string, excludeId?: string): Promise<Material | null> {
      let query = client.from('materials').select().ilike('name', name).limit(1);
      if (excludeId) query = query.neq('id', excludeId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? [])[0] ? toMaterial((data ?? [])[0]) : null;
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
      const { data: insertData, error } = await client.from('materials').insert(data).select().single();
      if (error) throw new Error(error.message);
      return toMaterial(insertData);
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
      const { data: updateData, error } = await client.from('materials').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return toMaterial(updateData);
    },

    async delete(id: string): Promise<void> {
      const { error } = await client.from('materials').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },

    async hasReceptions(materialId: string): Promise<boolean> {
      const { data, error } = await client.from('receptions').select('id').eq('material_id', materialId).limit(1);
      if (error) throw new Error(error.message);
      return (data ?? []).length > 0;
    },
  };
}

export function createSupabaseReceptionStore(client: SupabaseClient): ReceptionStore {
  return {
    async queryRaw(filters: ReceptionFilters) {
      let query = client.from('receptions')
        .select('*, material:materials(id, name, unit, category, storage_condition)')
        .order('received_on', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200);

      if (filters.dateFrom) query = query.gte('received_on', filters.dateFrom);
      if (filters.dateTo) query = query.lte('received_on', filters.dateTo);
      if (filters.materialId) query = query.eq('material_id', filters.materialId);
      if (filters.supplier) query = query.ilike('supplier', `%${filters.supplier.trim()}%`);
      if (filters.category) query = (query as any).eq('material.category', filters.category);
      if (filters.storageCondition) query = (query as any).eq('material.storage_condition', filters.storageCondition);
      if (filters.withObservationsOnly) {
        query = query.not('observations', 'is', null).neq('observations', '');
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return { data: data ?? [], truncated: (data ?? []).length === 200 };
    },

    async get(id: string): Promise<Reception | null> {
      const { data, error } = await client.from('receptions').select().eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toReception(data) : null;
    },

    async create(data: Record<string, unknown>): Promise<Reception> {
      const { data: insertData, error } = await client.from('receptions').insert(data).select().single();
      if (error) throw new Error(error.message);
      return toReception(insertData);
    },

    async update(id: string, data: Record<string, unknown>): Promise<Reception> {
      const { data: updateData, error } = await client.from('receptions').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return toReception(updateData);
    },

    async delete(id: string): Promise<void> {
      const { error } = await client.from('receptions').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },

    async countExpired(beforeDate: string): Promise<number> {
      const { count, error } = await client.from('receptions')
        .select('*', { count: 'exact', head: true })
        .lt('expiry_date', beforeDate);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },

    async countNearExpiry(fromDate: string, toDate: string): Promise<number> {
      const { count, error } = await client.from('receptions')
        .select('*', { count: 'exact', head: true })
        .gte('expiry_date', fromDate)
        .lte('expiry_date', toDate);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },

    async countMissingExpiry(): Promise<number> {
      const { count, error } = await client.from('receptions')
        .select('*, material:materials!inner(expiration_required)', { count: 'exact', head: true })
        .is('expiry_date', null)
        .eq('material.expiration_required', true);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  };
}

function toRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: row.id as string,
    name: row.name as string,
    category: (row.category as string) ?? null,
    yieldQuantity: Number(row.yield_quantity),
    yieldUnit: row.yield_unit as Unit,
    active: Boolean(row.active),
    notes: (row.notes as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function toRecipeIngredient(row: Record<string, unknown>): RecipeIngredient {
  return {
    id: row.id as string,
    recipe_id: row.recipe_id as string,
    material_id: row.material_id as string,
    quantity: Number(row.quantity),
    unit: row.unit as Unit,
    lossPercent: row.loss_percent != null ? Number(row.loss_percent) : null,
    notes: (row.notes as string) ?? null,
    sort_order: Number(row.sort_order),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function createSupabaseRecipeStore(client: SupabaseClient): RecipeStore {
  return {
    async list(): Promise<Recipe[]> {
      const { data, error } = await client.from('recipes').select().order('name', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(toRecipe);
    },

    async get(id: string): Promise<Recipe | null> {
      const { data, error } = await client.from('recipes').select().eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toRecipe(data) : null;
    },

    async getByName(name: string, excludeId?: string): Promise<Recipe | null> {
      let query = client.from('recipes').select('id').ilike('name', name.trim()).limit(1);
      if (excludeId) query = query.neq('id', excludeId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? [])[0] ? toRecipe((data ?? [])[0]) : null;
    },

    async create(data: Record<string, unknown>): Promise<Recipe> {
      const { data: insertData, error } = await client.from('recipes').insert(data).select().single();
      if (error) throw new Error(error.message);
      return toRecipe(insertData);
    },

    async update(id: string, data: Record<string, unknown>): Promise<Recipe> {
      const { data: updateData, error } = await client.from('recipes').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return toRecipe(updateData);
    },

    async delete(id: string): Promise<void> {
      const { error } = await client.from('recipes').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },

    async listIngredients(recipeId: string): Promise<RecipeIngredient[]> {
      const { data, error } = await client.from('recipe_ingredients').select().eq('recipe_id', recipeId).order('sort_order', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(toRecipeIngredient);
    },

    async replaceIngredients(recipeId: string, ingredients: Array<{
      recipe_id: string;
      material_id: string;
      quantity: number;
      unit: Unit;
      loss_percent: number | null;
      notes: string | null;
      sort_order: number;
    }>): Promise<void> {
      await client.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
      const { error } = await client.from('recipe_ingredients').insert(ingredients);
      if (error) throw new Error(error.message);
    },

    async getIngredientCounts(recipeIds: string[]): Promise<Map<string, number>> {
      if (recipeIds.length === 0) return new Map();
      const { data, error } = await client.from('recipe_ingredients')
        .select('recipe_id')
        .in('recipe_id', recipeIds);
      if (error) throw new Error(error.message);
      const map = new Map<string, number>();
      for (const row of data ?? []) {
        map.set(row.recipe_id, (map.get(row.recipe_id) ?? 0) + 1);
      }
      return map;
    },

    async getRecipeIngredient(id: string): Promise<RecipeIngredient | null> {
      const { data, error } = await client.from('recipe_ingredients').select().eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toRecipeIngredient(data) : null;
    },
  };
}

function toProductionBatch(row: Record<string, unknown>): ProductionBatch {
  return {
    id: row.id as string,
    batch_number: row.batch_number as string,
    recipe_id: row.recipe_id as string,
    status: row.status as ProductionBatchStatus,
    planned_yield: Number(row.planned_yield),
    actual_yield: row.actual_yield != null ? Number(row.actual_yield) : null,
    yield_unit: row.yield_unit as Unit,
    started_at: (row.started_at as string) ?? null,
    completed_at: (row.completed_at as string) ?? null,
    observations: (row.observations as string) ?? null,
    created_at: row.created_at as string,
    created_by: row.created_by as string,
  };
}

function toProductionBatchIngredient(row: Record<string, unknown>): ProductionBatchIngredient {
  return {
    id: row.id as string,
    batch_id: row.batch_id as string,
    recipe_ingredient_id: row.recipe_ingredient_id as string,
    material_id: row.material_id as string,
    planned_quantity: Number(row.planned_quantity),
    unit: row.unit as Unit,
  };
}

export function createSupabaseProductionBatchStore(client: SupabaseClient): ProductionBatchStore {
  return {
    async list(): Promise<Array<Record<string, unknown>>> {
      const { data, error } = await client.from('production_batches')
        .select('*, recipe:recipes(id, name)')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },

    async getBase(id: string): Promise<ProductionBatch | null> {
      const { data, error } = await client.from('production_batches').select().eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toProductionBatch(data) : null;
    },

    async getFull(id: string) {
      const { data: batchData, error: batchError } = await client
        .from('production_batches')
        .select('*, recipe:recipes(*)')
        .eq('id', id)
        .maybeSingle();
      if (batchError) throw new Error(batchError.message);
      if (!batchData) return null;

      const { data: ingData, error: ingError } = await client
        .from('production_batch_ingredients')
        .select('*, material:materials(id, name, unit), recipe_ingredient:recipe_ingredients(*)')
        .eq('batch_id', id);
      if (ingError) throw new Error(ingError.message);

      const { data: lotsData, error: lotsError } = await client
        .from('production_batch_lot_usages')
        .select('*, reception:receptions(id, lot_code, expiry_date, quantity)')
        .eq('batch_id', id);
      if (lotsError) throw new Error(lotsError.message);

      return {
        batch: batchData,
        recipe: (batchData as any).recipe ?? null,
        ingredients: ingData ?? [],
        lotUsages: lotsData ?? [],
      };
    },

    async create(data: Record<string, unknown>): Promise<ProductionBatch> {
      const { data: insertData, error } = await client.from('production_batches').insert(data).select().single();
      if (error) throw new Error(error.message);
      return toProductionBatch(insertData);
    },

    async createIngredient(data: Record<string, unknown>): Promise<ProductionBatchIngredient> {
      const { data: ingData, error } = await client.from('production_batch_ingredients').insert(data).select().single();
      if (error) throw new Error(error.message);
      return toProductionBatchIngredient(ingData);
    },

    async createLotUsage(data: Record<string, unknown>): Promise<void> {
      const { error } = await client.from('production_batch_lot_usages').insert(data);
      if (error) throw new Error(error.message);
    },

    async update(id: string, data: Record<string, unknown>): Promise<ProductionBatch> {
      const { data: updateData, error } = await client.from('production_batches').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return toProductionBatch(updateData);
    },

    async deleteLotUsages(batchId: string): Promise<void> {
      const { error } = await client.from('production_batch_lot_usages').delete().eq('batch_id', batchId);
      if (error) throw new Error(error.message);
    },

    async deleteIngredients(batchId: string): Promise<void> {
      const { error } = await client.from('production_batch_ingredients').delete().eq('batch_id', batchId);
      if (error) throw new Error(error.message);
    },

    async deleteBatch(id: string): Promise<void> {
      const { error } = await client.from('production_batches').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}

export function createSupabaseReceptionViewStore(client: SupabaseClient): ReceptionViewStore {
  return {
    async list(): Promise<ReceptionView[]> {
      const { data, error } = await client.from('reception_views').select().order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(row => ({
        id: row.id as string,
        name: row.name as string,
        default: false,
        filters: row.filters as ReceptionFilters,
      }));
    },

    async save(id: string, name: string, filters: ReceptionFilters): Promise<void> {
      const { error } = await client.from('reception_views').insert({ id, name, filters: filters as any });
      if (error) throw new Error(error.message);
    },

    async getByName(name: string): Promise<ReceptionView | null> {
      const { data, error } = await client.from('reception_views').select().ilike('name', name).limit(1);
      if (error) throw new Error(error.message);
      return (data ?? [])[0] ? { id: data[0].id as string, name: data[0].name as string, default: false, filters: data[0].filters as ReceptionFilters } : null;
    },

    async delete(id: string): Promise<boolean> {
      const { data, error } = await client.from('reception_views').delete().eq('id', id).select();
      if (error) throw new Error(error.message);
      return (data ?? []).length > 0;
    },
  };
}
