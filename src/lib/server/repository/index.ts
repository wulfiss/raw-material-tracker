import { db } from '$lib/server/db';
import {
  createSupabaseMaterialStore,
  createSupabaseReceptionStore,
  createSupabaseRecipeStore,
  createSupabaseProductionBatchStore,
  createSupabaseReceptionViewStore,
} from './supabase-stores';
import { createMaterials } from './materials';
import { createReceptions } from './receptions';
import { createRecipes } from './recipes';
import { createProductionBatches } from './production-batches';
import { createViews } from './views';

export * from './types';

const materialStore = createSupabaseMaterialStore(db);
const receptionStore = createSupabaseReceptionStore(db);
const recipeStore = createSupabaseRecipeStore(db);
const batchStore = createSupabaseProductionBatchStore(db);
const viewStore = createSupabaseReceptionViewStore(db);

export const materials = createMaterials(materialStore);
export const receptions = createReceptions(materialStore, receptionStore);
export const recipes = createRecipes(recipeStore, materialStore);
export const productionBatches = createProductionBatches(batchStore, recipeStore);
export const views = createViews(viewStore);

export { createInMemoryMaterialStore } from './in-memory-stores';
export { createInMemoryReceptionStore } from './in-memory-stores';
export { createInMemoryRecipeStore } from './in-memory-stores';
export { createInMemoryProductionBatchStore } from './in-memory-stores';
export { createInMemoryReceptionViewStore } from './in-memory-stores';
