import type { Recipe, RecipeIngredient, RecipeListItem, Unit, Material, Result } from './types';
import { isMaterialUnit } from './types';
import type { RecipeStore, MaterialStore } from './stores';
import type { MockUser } from '../mock-auth';

export function createRecipes(
  recipeStore: RecipeStore,
  materialStore: MaterialStore,
) {
  return {
    async list(): Promise<RecipeListItem[]> {
      const allRecipes = await recipeStore.list();
      const ids = allRecipes.map((r: Recipe) => r.id);
      const countMap = await recipeStore.getIngredientCounts(ids);
      return allRecipes.map((r: Recipe) => ({ ...r, ingredientCount: countMap.get(r.id) ?? 0 }));
    },

    async get(id: string): Promise<Recipe | null> {
      return recipeStore.get(id);
    },

    async create(
      input: { name: string; category?: string | null; yieldQuantity: number; yieldUnit: Unit; notes?: string | null; active?: boolean },
      user: MockUser,
      ingredients?: Array<{ material_id: string; quantity: number; unit: Unit; lossPercent?: number | null; notes?: string | null }>
    ): Promise<Result<Recipe>> {
      if (!input.name || !input.name.trim()) return { error: 'Recipe name is required.' };
      if (input.yieldQuantity <= 0) return { error: 'Yield quantity must be greater than zero.' };
      if (!isMaterialUnit(input.yieldUnit)) return { error: 'Select a valid yield unit.' };

      const dup = await recipeStore.getByName(input.name);
      if (dup) return { error: 'A recipe with this name already exists.' };

      const recipe = await recipeStore.create({
        name: input.name.trim(),
        category: input.category ?? null,
        yield_quantity: input.yieldQuantity,
        yield_unit: input.yieldUnit,
        active: input.active ?? true,
        notes: input.notes ?? null,
        created_by: user.id,
      });

      if (ingredients && ingredients.length > 0) {
        const materialIds = [...new Set(ingredients.map(i => i.material_id))];
        if (materialIds.length !== ingredients.length) {
          await recipeStore.delete(recipe.id);
          return { error: 'Duplicate material in ingredient list.' };
        }

        const activeCheck = await Promise.all(materialIds.map(mid => materialStore.get(mid)));
        for (const m of activeCheck) {
          if (!m || !m.active) {
            await recipeStore.delete(recipe.id);
            return { error: 'Select only active materials for ingredients.' };
          }
        }

        await recipeStore.replaceIngredients(recipe.id, ingredients.map((ing, idx) => ({
          recipe_id: recipe.id,
          material_id: ing.material_id,
          quantity: ing.quantity,
          unit: ing.unit,
          loss_percent: ing.lossPercent ?? null,
          notes: ing.notes ?? null,
          sort_order: idx,
        })));
      }

      return { ok: recipe };
    },

    async update(
      id: string,
      input: { name: string; category?: string | null; yieldQuantity: number; yieldUnit: Unit; notes?: string | null; active?: boolean }
    ): Promise<Result<Recipe>> {
      const existing = await recipeStore.get(id);
      if (!existing) return { error: 'Recipe not found.' };

      if (!input.name || !input.name.trim()) return { error: 'Recipe name is required.' };
      if (input.yieldQuantity <= 0) return { error: 'Yield quantity must be greater than zero.' };
      if (!isMaterialUnit(input.yieldUnit)) return { error: 'Select a valid yield unit.' };

      const dup = await recipeStore.getByName(input.name, id);
      if (dup) return { error: 'A recipe with this name already exists.' };

      const recipe = await recipeStore.update(id, {
        name: input.name.trim(),
        category: input.category ?? null,
        yield_quantity: input.yieldQuantity,
        yield_unit: input.yieldUnit,
        active: input.active ?? existing.active,
        notes: input.notes ?? existing.notes,
        updated_at: new Date().toISOString(),
      });
      return { ok: recipe };
    },

    async toggleActive(id: string): Promise<Result<Recipe>> {
      const existing = await recipeStore.get(id);
      if (!existing) return { error: 'Recipe not found.' };

      const recipe = await recipeStore.update(id, {
        active: !existing.active,
        updated_at: new Date().toISOString(),
      });
      return { ok: recipe };
    },

    async listIngredients(recipeId: string): Promise<RecipeIngredient[]> {
      return recipeStore.listIngredients(recipeId);
    },

    async replaceIngredients(
      recipeId: string,
      ingredients: Array<{ material_id: string; quantity: number; unit: Unit; lossPercent?: number | null; notes?: string | null }>
    ): Promise<Result<{ success: true }>> {
      const recipe = await recipeStore.get(recipeId);
      if (!recipe) return { error: 'Recipe not found.' };

      if (ingredients.length === 0) return { error: 'A recipe must have at least one ingredient.' };

      const materialIds = ingredients.map(i => i.material_id);
      const uniqueIds = [...new Set(materialIds)];
      if (uniqueIds.length !== materialIds.length) return { error: 'Duplicate material in ingredient list.' };

      const activeCheck = await Promise.all(uniqueIds.map(mid => materialStore.get(mid)));
      for (const m of activeCheck) {
        if (!m || !m.active) return { error: 'Select only active materials for ingredients.' };
      }

      await recipeStore.replaceIngredients(recipeId, ingredients.map((ing, idx) => ({
        recipe_id: recipeId,
        material_id: ing.material_id,
        quantity: ing.quantity,
        unit: ing.unit,
        loss_percent: ing.lossPercent ?? null,
        notes: ing.notes ?? null,
        sort_order: idx,
      })));

      return { ok: { success: true } };
    },
  };
}
