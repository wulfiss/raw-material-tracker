import type { Recipe, RecipeIngredient, Unit } from './types';

export function toRecipe(row: Record<string, unknown>): Recipe {
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

export function toRecipeIngredient(row: Record<string, unknown>): RecipeIngredient {
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
