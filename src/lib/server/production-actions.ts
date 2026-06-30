import { fail, redirect } from '@sveltejs/kit';
import type { MockUser } from './mock-auth';
import { productionBatches } from './repository';
import { isMaterialUnit, isProductionBatchStatus } from './repository/types';
import type { CreateBatchIngredientInput, ProductionBatchStatus, Unit } from './repository/types';
import { getT } from '$lib/i18n';
import { formText } from './form-utils';

export async function validateAndCreateBatch(form: FormData, user: MockUser) {
  const t = getT();
  const recipe_id = formText(form, 'recipe_id');
  const planned_yield = Number(formText(form, 'planned_yield'));
  const yield_unit = formText(form, 'yield_unit');
  const observations = formText(form, 'observations');

  if (!recipe_id) {
    return fail(400, { message: t.productionBatch.messages.selectRecipe, recipe_id, planned_yield: String(planned_yield), yield_unit, observations, ingredients: [] });
  }

  if (!Number.isFinite(planned_yield) || planned_yield <= 0) {
    return fail(400, { message: t.productionBatch.messages.validPlannedYield, recipe_id, planned_yield: String(planned_yield), yield_unit, observations, ingredients: [] });
  }

  if (!isMaterialUnit(yield_unit as Unit)) {
    return fail(400, { message: t.productionBatch.messages.validYieldUnit, recipe_id, planned_yield: String(planned_yield), yield_unit, observations, ingredients: [] });
  }

  const ingredients: CreateBatchIngredientInput[] = [];
  let idx = 0;

  while (form.has(`ingredients[${idx}][recipe_ingredient_id]`)) {
    const recipe_ingredient_id = formText(form, `ingredients[${idx}][recipe_ingredient_id]`);
    const material_id = formText(form, `ingredients[${idx}][material_id]`);
    const planned_quantity = Number(formText(form, `ingredients[${idx}][planned_quantity]`));
    const unit = formText(form, `ingredients[${idx}][unit]`);

    const lot_usages: Array<{ reception_id: string; quantity_used: number }> = [];
    let lotIdx = 0;

    while (form.has(`ingredients[${idx}][lots][${lotIdx}][reception_id]`)) {
      const reception_id = formText(form, `ingredients[${idx}][lots][${lotIdx}][reception_id]`);
      const quantity_used = Number(formText(form, `ingredients[${idx}][lots][${lotIdx}][quantity_used]`));
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
      message: t.productionBatch.messages.atLeastOneIngredientWithLots,
      recipe_id,
      planned_yield: String(planned_yield),
      yield_unit,
      observations,
      ingredients: [],
    });
  }

  let result;
  try {
    result = await productionBatches.create(
      { recipe_id, planned_yield, yield_unit: yield_unit as Unit, ingredients, observations: observations || null },
      user
    );
  } catch {
    return fail(500, { message: t.errors.unexpected, recipe_id, planned_yield: String(planned_yield), yield_unit, observations, ingredients: [] });
  }

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

  throw redirect(303, `/production/${result.ok.id}`);
}

export async function updateBatchStatus(id: string, status: ProductionBatchStatus, user: MockUser, actual_yield?: number | null, observations?: string | null) {
  const t = getT();
  if (!isProductionBatchStatus(status)) return fail(400, { message: t.productionBatch.errors.invalidStatus });

  const existing = await productionBatches.get(id);
  if (!existing) return fail(400, { message: t.productionBatch.errors.notFound });

  const allowedTransitions: Record<ProductionBatchStatus, ProductionBatchStatus[]> = {
    planned: ['in_progress'],
    in_progress: ['completed'],
    completed: [],
  };

  if (!allowedTransitions[existing.status].includes(status)) {
    return fail(400, { message: t.productionBatch.errors.invalidTransition.replace('$1', existing.status).replace('$2', status) });
  }

  const updatePayload: Parameters<typeof productionBatches.update>[1] = { status };
  if (actual_yield !== undefined && actual_yield !== null) updatePayload.actual_yield = actual_yield;
  if (observations !== undefined) updatePayload.observations = observations;

  if (status === 'in_progress' && !existing.started_at) {
    updatePayload.started_at = new Date().toISOString();
  }
  if (status === 'completed' && !existing.completed_at) {
    updatePayload.completed_at = new Date().toISOString();
  }

  try {
    const result = await productionBatches.update(id, updatePayload);
    if ('error' in result) {
      return fail(400, { message: result.error });
    }
    return { success: true };
  } catch {
    return fail(500, { message: t.errors.unexpected });
  }
}

export async function deleteBatchAction(id: string) {
  const t = getT();
  try {
    const result = await productionBatches.remove(id);
    if ('error' in result) {
      return fail(400, { message: result.error });
    }
    throw redirect(303, '/production');
  } catch {
    return fail(500, { message: t.errors.unexpected });
  }
}
