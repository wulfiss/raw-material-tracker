import { describe, expect, it, vi } from 'vitest';
import { createRecipes } from './recipes';
import { createInMemoryMaterialStore, createInMemoryRecipeStore } from './in-memory-stores';
import type { Material, Recipe, RecipeIngredient } from './types';
import type { AppUser } from '../auth';
const user: AppUser = { id: 'operator', name: 'Operator', email: 'operator@example.com', role: 'quality' };
const material: Material = { id: 'm1', name: 'Pollo', active: true, category: 'General', unit: 'kg', storageCondition: 'refrigerated', minStock: 0, expirationRequired: true, created_at: '', created_by: '', created_by_name: '' };
const oldRecipe: Recipe = { id: 'r1', name: 'Milanesa', active: true, category: 'Original category', yieldQuantity: 12, yieldUnit: 'unit', notes: 'Original notes', created_at: '', updated_at: '' };
const oldIngredient: RecipeIngredient = { id: 'i1', recipe_id: 'r1', material_id: 'm1', quantity: 4.5, unit: 'kg', lossPercent: 5, notes: 'Original preparation', sort_order: 0, created_at: '', updated_at: '' };
function setup(existing = false, active = true) {
  const store = createInMemoryRecipeStore(existing ? [oldRecipe] : [], existing ? [oldIngredient] : []);
  return { store, recipes: createRecipes(store, createInMemoryMaterialStore([{ ...material, active }])) };
}
describe('simple recipes', () => {
  it('creates a product using only a name and ingredient IDs', async () => {
    const { recipes, store } = setup();
    const result = await recipes.saveSimple({ name: ' Empanada ', materialIds: ['m1'] }, user);
    expect(result).toMatchObject({ ok: { name: 'Empanada', active: true } });
    const rows = await store.list();expect(rows).toHaveLength(1);
    expect(await store.listIngredients(rows[0].id)).toMatchObject([{ material_id: 'm1' }]);
  });
  it('preserves existing formula metadata when editing the name and ingredient list', async () => {
    const { recipes, store } = setup(true);
    await recipes.saveSimple({ name: 'Milanesa de pollo', materialIds: ['m1'] }, user, 'r1');
    expect(await store.get('r1')).toMatchObject({ name: 'Milanesa de pollo', category: oldRecipe.category, yieldQuantity: 12, yieldUnit: 'unit', notes: oldRecipe.notes });
    expect(await store.listIngredients('r1')).toMatchObject([{ quantity: 4.5, unit: 'kg', lossPercent: 5, notes: oldIngredient.notes }]);
  });
  it('allows retaining an inactive historical ingredient but not adding it to a new recipe', async () => {
    expect(await setup(true, false).recipes.saveSimple({ name: 'Milanesa', materialIds: ['m1'] }, user, 'r1')).toHaveProperty('ok');
    expect(await setup(false, false).recipes.saveSimple({ name: 'Empanada', materialIds: ['m1'] }, user)).toEqual({ error: 'inactive_material' });
  });
  it('rejects invalid membership before changing an existing recipe', async () => {
    const { recipes, store } = setup(true);
    expect(await recipes.saveSimple({ name: 'Changed', materialIds: [] }, user, 'r1')).toEqual({ error: 'no_ingredients' });
    expect(await recipes.saveSimple({ name: 'Changed', materialIds: ['m1', 'm1'] }, user, 'r1')).toEqual({ error: 'duplicate_material' });
    expect((await store.get('r1'))?.name).toBe('Milanesa');
    expect(await store.listIngredients('r1')).toHaveLength(1);
  });
  it('rejects duplicate product names without altering records', async () => {
    const { recipes, store } = setup(true);
    expect(await recipes.saveSimple({ name: 'MILANESA', materialIds: ['m1'] }, user)).toEqual({ error: 'duplicate_name' });
    expect(await store.list()).toHaveLength(1);
  });
  it('removes a new product if saving its ingredient list fails', async () => {
    const { recipes, store } = setup();
    vi.spyOn(store, 'replaceIngredients').mockRejectedValue(new Error('Insert failed'));
    await expect(recipes.saveSimple({ name: 'Empanada', materialIds: ['m1'] }, user)).rejects.toThrow('Insert failed');
    expect(await store.list()).toHaveLength(0);
  });
});
