import type {
  Material,
  Reception,
  ReceptionFilters,
  ReceptionView,
  Recipe,
  RecipeIngredient,
  ProductionBatch,
  ProductionBatchIngredient,
  Unit,
} from './types';

export interface MaterialStore {
  list(): Promise<Material[]>;
  listActive(): Promise<Material[]>;
  get(id: string): Promise<Material | null>;
  getByName(name: string, excludeId?: string): Promise<Material | null>;
  create(data: {
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
  }): Promise<Material>;
  update(id: string, data: Partial<{
    name: string;
    category: string;
    unit: Unit;
    storage_condition: string;
    min_stock: number;
    expiration_required: boolean;
    active: boolean;
  }>): Promise<Material>;
  delete(id: string): Promise<void>;
  hasReceptions(materialId: string): Promise<boolean>;
}

export interface ReceptionStore {
  queryRaw(filters: ReceptionFilters): Promise<{
    data: Array<Record<string, unknown>>;
    truncated: boolean;
  }>;
  get(id: string): Promise<Reception | null>;
  create(data: Record<string, unknown>): Promise<Reception>;
  update(id: string, data: Record<string, unknown>): Promise<Reception>;
  delete(id: string): Promise<void>;
  countExpired(beforeDate: string): Promise<number>;
  countNearExpiry(fromDate: string, toDate: string): Promise<number>;
  countMissingExpiry(): Promise<number>;
}

export interface RecipeStore {
  list(): Promise<Recipe[]>;
  get(id: string): Promise<Recipe | null>;
  getByName(name: string, excludeId?: string): Promise<Recipe | null>;
  create(data: Record<string, unknown>): Promise<Recipe>;
  update(id: string, data: Record<string, unknown>): Promise<Recipe>;
  delete(id: string): Promise<void>;
  listIngredients(recipeId: string): Promise<RecipeIngredient[]>;
  replaceIngredients(recipeId: string, ingredients: Array<{
    recipe_id: string;
    material_id: string;
    quantity: number;
    unit: Unit;
    loss_percent: number | null;
    notes: string | null;
    sort_order: number;
  }>): Promise<void>;
  getIngredientCounts(recipeIds: string[]): Promise<Map<string, number>>;
  getRecipeIngredient(id: string): Promise<RecipeIngredient | null>;
}

export interface ProductionBatchStore {
  list(): Promise<Array<Record<string, unknown>>>;
  getBase(id: string): Promise<ProductionBatch | null>;
  getFull(id: string): Promise<{
    batch: Record<string, unknown>;
    recipe: Record<string, unknown> | null;
    ingredients: Array<Record<string, unknown>>;
    lotUsages: Array<Record<string, unknown>>;
  } | null>;
  create(data: Record<string, unknown>): Promise<ProductionBatch>;
  createIngredient(data: Record<string, unknown>): Promise<ProductionBatchIngredient>;
  createLotUsage(data: Record<string, unknown>): Promise<void>;
  update(id: string, data: Record<string, unknown>): Promise<ProductionBatch>;
  deleteLotUsages(batchId: string): Promise<void>;
  deleteIngredients(batchId: string): Promise<void>;
  deleteBatch(id: string): Promise<void>;
}

export interface ReceptionViewStore {
  list(): Promise<ReceptionView[]>;
  save(id: string, name: string, filters: ReceptionFilters): Promise<void>;
  getByName(name: string): Promise<ReceptionView | null>;
  delete(id: string): Promise<boolean>;
}
