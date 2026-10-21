import type { Recipe, RecipeIngredient, RecipeListItem, Unit, Material, Result } from './types';
import { isMaterialUnit } from './types';
import type { RecipeStore, MaterialStore } from './stores';
import type { AppUser } from '../auth';

export function createRecipes(
  recipeStore: RecipeStore,
  materialStore: MaterialStore,
) {
  return {
    // The short form edits membership only; retain legacy formula metadata.
    async saveSimple(input: { name: string; materialIds: string[] }, user: AppUser, id?: string): Promise<Result<Recipe>> {
      const name = input.name.trim();
      if (!name || name.length > 120) return { error: 'name_required' };
      if (!input.materialIds.length || input.materialIds.length > 100) return { error: 'no_ingredients' };
      if (new Set(input.materialIds).size !== input.materialIds.length) return { error: 'duplicate_material' };
      const existing = id ? await recipeStore.get(id) : null;
      if (id && !existing) return { error: 'not_found' };
      if (await recipeStore.getByName(name, id)) return { error: 'duplicate_name' };
      const oldIngredients = id ? await recipeStore.listIngredients(id) : [];
      const selected = await Promise.all(input.materialIds.map(mid => materialStore.get(mid)));
      if (selected.some(m => !m || (!m.active && !oldIngredients.some(ing => ing.material_id === m.id)))) {
        return { error: 'inactive_material' };
      }
      let recipe = existing;
      if (!recipe) {
        // Required legacy columns are compatibility defaults, never quantities
        // entered by the user or used to calculate stock in this workflow.
        recipe = await recipeStore.create({ name, yield_quantity: 1, yield_unit: 'unit', active: true });
      }
      try {
        await recipeStore.replaceIngredients(recipe.id, input.materialIds.map((mid, index) => {
          const old = oldIngredients.find(ing => ing.material_id === mid);
          return {
            recipe_id: recipe!.id, material_id: mid,
            quantity: old?.quantity ?? 1, unit: old?.unit ?? selected[index]!.unit,
            loss_percent: old?.lossPercent ?? null, notes: old?.notes ?? null, sort_order: index
          };
        }));
        if (existing) recipe = await recipeStore.update(recipe.id, { name, updated_at: new Date().toISOString() });
      } catch (error) {
        if (!existing) await recipeStore.delete(recipe.id);
        throw error;
      }
      return { ok: recipe };
    },

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
      user: AppUser,
      ingredients?: Array<{ material_id: string; quantity: number; unit: Unit; lossPercent?: number | null; notes?: string | null }>
    ): Promise<Result<Recipe>> {
      if (!input.name || !input.name.trim()) return { error: 'name_required' as const };
      if (input.yieldQuantity <= 0) return { error: 'invalid_yield' as const };
      if (!isMaterialUnit(input.yieldUnit)) return { error: 'invalid_unit' as const };

      const dup = await recipeStore.getByName(input.name);
      if (dup) return { error: 'duplicate_name' as const };

      const recipe = await recipeStore.create({
        name: input.name.trim(),
        category: input.category ?? null,
        yield_quantity: input.yieldQuantity,
        yield_unit: input.yieldUnit,
        active: input.active ?? true,
        notes: input.notes ?? null,
      });

      if (ingredients && ingredients.length > 0) {
        const materialIds = [...new Set(ingredients.map(i => i.material_id))];
        if (materialIds.length !== ingredients.length) {
          await recipeStore.delete(recipe.id);
          return { error: 'duplicate_material' as const };
        }

        const activeCheck = await Promise.all(materialIds.map(mid => materialStore.get(mid)));
        for (const m of activeCheck) {
          if (!m || !m.active) {
            await recipeStore.delete(recipe.id);
            return { error: 'inactive_material' as const };
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
      if (!existing) return { error: 'not_found' as const };

      if (!input.name || !input.name.trim()) return { error: 'name_required' as const };
      if (input.yieldQuantity <= 0) return { error: 'invalid_yield' as const };
      if (!isMaterialUnit(input.yieldUnit)) return { error: 'invalid_unit' as const };

      const dup = await recipeStore.getByName(input.name, id);
      if (dup) return { error: 'duplicate_name' as const };

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
      if (!existing) return { error: 'not_found' as const };

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
      if (!recipe) return { error: 'not_found' as const };

      if (ingredients.length === 0) return { error: 'no_ingredients' as const };

      const materialIds = ingredients.map(i => i.material_id);
      const uniqueIds = [...new Set(materialIds)];
      if (uniqueIds.length !== materialIds.length) return { error: 'duplicate_material' as const };

      const activeCheck = await Promise.all(uniqueIds.map(mid => materialStore.get(mid)));
      for (const m of activeCheck) {
        if (!m || !m.active) return { error: 'inactive_material' as const };
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
