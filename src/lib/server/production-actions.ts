import { fail, redirect } from '@sveltejs/kit';
import type { MockUser } from './mock-auth';
import type { CreateBatchIngredientInput, ProductionBatchStatus, Unit } from './repository';
import {
  createProductionBatch,
  updateProductionBatch,
  deleteProductionBatch,
  getProductionBatch,
  isMaterialUnit,
} from './repository';

const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

export async function validateAndCreateBatch(form: FormData, user: MockUser) {
  const recipe_id = text(form, 'recipe_id');
  const planned_yield = Number(text(form, 'planned_yield'));
  const yield_unit = text(form, 'yield_unit');
  const observations = text(form, 'observations');

  if (!recipe_id) {
    return fail(400, { message: 'Select a recipe.', recipe_id, planned_yield: String(planned_yield), yield_unit, observations, ingredients: [] });
  }

  if (!Number.isFinite(planned_yield) || planned_yield <= 0) {
    return fail(400, { message: 'Enter a valid planned yield.', recipe_id, planned_yield: String(planned_yield), yield_unit, observations, ingredients: [] });
  }

  if (!isMaterialUnit(yield_unit as Unit)) {
    return fail(400, { message: 'Select a valid yield unit.', recipe_id, planned_yield: String(planned_yield), yield_unit, observations, ingredients: [] });
  }

  // Parse ingredients
  const ingredients: CreateBatchIngredientInput[] = [];
  let idx = 0;

  while (form.has(`ingredients[${idx}][recipe_ingredient_id]`)) {
    const recipe_ingredient_id = text(form, `ingredients[${idx}][recipe_ingredient_id]`);
    const material_id = text(form, `ingredients[${idx}][material_id]`);
    const planned_quantity = Number(text(form, `ingredients[${idx}][planned_quantity]`));
    const unit = text(form, `ingredients[${idx}][unit]`);

    const lot_usages: Array<{ reception_id: string; quantity_used: number }> = [];
    let lotIdx = 0;

    while (form.has(`ingredients[${idx}][lots][${lotIdx}][reception_id]`)) {
      const reception_id = text(form, `ingredients[${idx}][lots][${lotIdx}][reception_id]`);
      const quantity_used = Number(text(form, `ingredients[${idx}][lots][${lotIdx}][quantity_used]`));
      if (reception_id && quantity_used > 0) {
        lot_usages.push({ reception_id, quantity_used });
      }
      lotIdx++;
    }

    if (recipe_ingredient_id && material_id && lot_usages.length > 0) {
      ingredients.push({
        recipe_ingredient_id,
        material_id,
        planned_quantity,
        unit: unit as Unit,
        lot_usages,
      });
    }
    idx++;
  }

  if (ingredients.length === 0) {
    return fail(400, {
      message: 'At least one ingredient with lots is required.',
      recipe_id,
      planned_yield: String(planned_yield),
      yield_unit,
      observations,
      ingredients: [],
    });
  }

  const result = await createProductionBatch(
    { recipe_id, planned_yield, yield_unit: yield_unit as Unit, ingredients, observations: observations || null },
    user
  );

  if ('error' in result) {
    return fail(400, {
      message: result.error,
      recipe_id,
      planned_yield: String(planned_yield),
      yield_unit,
      observations,
      ingredients: [],
    });
  }

  throw redirect(303, `/production/${result.batch.id}`);
}

export async function updateBatchStatus(id: string, status: ProductionBatchStatus, user: MockUser, actual_yield?: number | null, observations?: string | null) {
  const existing = await getProductionBatch(id);
  if (!existing) return fail(400, { message: 'Production batch not found.' });

  const updatePayload: any = { status };
  if (actual_yield !== undefined && actual_yield !== null) updatePayload.actual_yield = actual_yield;
  if (observations !== undefined) updatePayload.observations = observations;

  if (status === 'in_progress' && !existing.started_at) {
    updatePayload.started_at = new Date().toISOString();
  }
  if (status === 'completed' && !existing.completed_at) {
    updatePayload.completed_at = new Date().toISOString();
  }

  const result = await updateProductionBatch(id, updatePayload);
  if ('error' in result) {
    return fail(400, { message: result.error });
  }

  return { success: true };
}

export async function deleteBatchAction(id: string, user: MockUser) {
  const result = await deleteProductionBatch(id);
  if ('error' in result) {
    return fail(400, { message: result.error });
  }
  throw redirect(303, '/production');
}