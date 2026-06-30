import crypto from 'node:crypto';
import type {
  ProductionBatch, ProductionBatchDetail, ProductionBatchIngredient,
  ProductionBatchLotUsage, CreateBatchIngredientInput,
  ProductionBatchStatus, Unit, Recipe, Result,
} from './types';
import type { ProductionBatchStore, RecipeStore, MaterialStore, ReceptionStore } from './stores';
import type { AppUser } from '../auth';
import { toRecipe, toRecipeIngredient } from './mappers';

function generateBatchNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `LOT-${y}${m}${d}-${h}${min}${s}-${rand}`;
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

function toProductionBatchLotUsage(row: Record<string, unknown>): ProductionBatchLotUsage {
  return {
    id: row.id as string,
    batch_id: row.batch_id as string,
    batch_ingredient_id: row.batch_ingredient_id as string,
    reception_id: row.reception_id as string,
    quantity_used: Number(row.quantity_used),
    unit: row.unit as Unit,
  };
}

export function createProductionBatches(
  batchStore: ProductionBatchStore,
  recipeStore: RecipeStore,
) {
  return {
    async list(): Promise<Array<ProductionBatch & { recipe: Pick<Recipe, 'id' | 'name'> | null }>> {
      const data = await batchStore.list();
      return data.map((row: Record<string, unknown>) => ({
        ...toProductionBatch(row),
        recipe: (row.recipe as any) ? { id: (row.recipe as any).id, name: (row.recipe as any).name } : null,
      }));
    },

    async get(id: string): Promise<ProductionBatchDetail | null> {
      const full = await batchStore.getFull(id);
      if (!full) return null;

      const recipe = full.recipe ? toRecipe(full.recipe) : null;

      const ingredients: ProductionBatchDetail['ingredients'] = (full.ingredients ?? []).map((ing: any) => {
        const mat = ing.material;
        const ri = ing.recipe_ingredient;
        return {
          ...toProductionBatchIngredient(ing),
          material: mat ? { id: mat.id, name: mat.name, unit: mat.unit } : null,
          recipe_ingredient: ri ? toRecipeIngredient(ri) : null,
          lot_usages: [] as ProductionBatchDetail['ingredients'][number]['lot_usages'],
        };
      });

      for (const lot of full.lotUsages ?? []) {
        const ing = ingredients.find((i: any) => i.id === lot.batch_ingredient_id);
        if (ing) {
          const rec = (lot.reception as any);
          ing.lot_usages.push({
            ...toProductionBatchLotUsage(lot),
            reception: rec ? { id: rec.id, lot_code: rec.lot_code, expiry_date: rec.expiry_date, quantity: Number(rec.quantity) } : null,
          });
        }
      }

      return { ...toProductionBatch(full.batch), recipe, ingredients };
    },

    async create(
      input: {
        recipe_id: string;
        planned_yield: number;
        yield_unit: Unit;
        ingredients: CreateBatchIngredientInput[];
        observations?: string | null;
      },
      user: AppUser
    ): Promise<Result<ProductionBatch>> {
      const recipe = await recipeStore.get(input.recipe_id);
      if (!recipe) return { error: 'Recipe not found.' };

      if (input.ingredients.length === 0) return { error: 'At least one ingredient with lots is required.' };

      for (const ing of input.ingredients) {
        if (ing.lot_usages.length === 0) return { error: 'Each ingredient must have at least one reception lot.' };
        const ri = await recipeStore.getRecipeIngredient(ing.recipe_ingredient_id);
        if (!ri || ri.recipe_id !== input.recipe_id) return { error: 'Invalid recipe ingredient.' };
      }

      const batch = await batchStore.create({
        batch_number: generateBatchNumber(),
        recipe_id: input.recipe_id,
        planned_yield: input.planned_yield,
        yield_unit: input.yield_unit,
        observations: input.observations ?? null,
        created_by: user.id,
      });

      await Promise.all(
        input.ingredients.map(async (ing) => {
          const batchIng = await batchStore.createIngredient({
            batch_id: batch.id,
            recipe_ingredient_id: ing.recipe_ingredient_id,
            material_id: ing.material_id,
            planned_quantity: ing.planned_quantity,
            unit: ing.unit,
          });

          await Promise.all(
            ing.lot_usages.map((lot) =>
              batchStore.createLotUsage({
                batch_id: batch.id,
                batch_ingredient_id: batchIng.id,
                reception_id: lot.reception_id,
                quantity_used: lot.quantity_used,
                unit: ing.unit,
              })
            )
          );
        })
      );

      return { ok: batch };
    },

    async update(
      id: string,
      input: { status?: ProductionBatchStatus; actual_yield?: number | null; started_at?: string | null; completed_at?: string | null; observations?: string | null; }
    ): Promise<Result<ProductionBatch>> {
      const existing = await batchStore.getBase(id);
      if (!existing) return { error: 'Production batch not found.' };

      const batch = await batchStore.update(id, input);
      return { ok: batch };
    },

    async remove(id: string): Promise<Result<{ success: true }>> {
      const existing = await batchStore.getBase(id);
      if (!existing) return { error: 'Production batch not found.' };

      await Promise.all([batchStore.deleteLotUsages(id), batchStore.deleteIngredients(id)]);
      await batchStore.deleteBatch(id);

      return { ok: { success: true } };
    },
  };
}
