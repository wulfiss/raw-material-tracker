<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Alert } from '$lib/components/ui/alert';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  let formRecipeId = $derived(form?.recipe_id ?? '');
  let formPlannedYield = $derived(form?.planned_yield ?? '');
  let formYieldUnit = $derived(form?.yield_unit ?? '');
  let formObservations = $derived(form?.observations ?? '');
  let recipeMapObj = $derived(data.recipeMap ?? {});
  let units = $derived(data.units ?? ['kg', 'g', 'L', 'mL', 'units', 'pieces', 'm', 'cm']);

  let recipeId = $state(formRecipeId);
  let plannedYield = $state(formPlannedYield);
  let yieldUnit = $state(formYieldUnit);
  let observations = $state(formObservations);

  let recipesList = $derived(data.recipes);
  let receptionsList = $derived(data.receptions);
  let selectedRecipe = $derived(recipeId ? recipesList.find((r: any) => r.id === recipeId) : null);
  let recipeIngredients = $derived(recipeId && recipeMapObj ? (recipeMapObj[recipeId] ?? []) : []);

  // Each ingredient gets 3 lot slots (server ignores empty ones)
  const LOT_SLOTS = 3;

  let ingredientSlots = $derived(
    recipeIngredients.map((ri: any) => ({
      recipe_ingredient_id: ri.id,
      material_id: ri.material_id,
      material_name: ri.material?.name ?? 'Material',
      planned_quantity: ri.quantity,
      unit: ri.unit,
      slots: Array.from({ length: LOT_SLOTS }, () => ({ reception_id: '', quantity_used: '' })),
    }))
  );

  let receptionsByIngredient = $derived((() => {
    const map = new Map<string, any[]>();
    for (const ri of recipeIngredients) {
      const matReceptions = receptionsList.filter(
        (r: any) => r.material_id === ri.material_id && r.status !== 'rejected'
      );
      map.set(ri.id, matReceptions);
    }
    return map;
  })());
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">New Production Batch</h1>
    <a href="/production">
      <Button variant="outline">Cancel</Button>
    </a>
  </div>

  {#if form?.message}
    <Alert variant="destructive">{form.message}</Alert>
  {/if}

  <form method="POST" class="space-y-6">
    <!-- Recipe Selection -->
    <Card>
      <CardHeader>
        <CardTitle>Select Recipe</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="recipe_id">Recipe</Label>
          <select id="recipe_id" name="recipe_id" class="w-full rounded-md border px-3 py-2" bind:value={recipeId}>
            <option value="">-- Select a recipe --</option>
            {#each recipesList as recipe}
              <option value="{recipe.id}">{recipe.name}</option>
            {/each}
          </select>
        </div>

        {#if selectedRecipe}
          <div class="rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
            <strong>{selectedRecipe.name}</strong>
            {#if selectedRecipe.category} · {selectedRecipe.category}{/if}
          </div>
        {/if}
      </CardContent>
    </Card>

    {#if recipeIngredients.length > 0}
      <!-- Yield Configuration -->
      <Card>
        <CardHeader>
          <CardTitle>Yield Configuration</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Planned Yield</Label>
              <input
                name="planned_yield"
                type="number"
                step="0.01"
                min="0.01"
                class="w-full rounded-md border px-3 py-2"
                bind:value={plannedYield}
              />
            </div>
            <div class="space-y-2">
              <Label>Yield Unit</Label>
              <select name="yield_unit" class="w-full rounded-md border px-3 py-2" bind:value={yieldUnit}>
                <option value="">-- Select --</option>
                {#each units as unit}
                  <option value="{unit}">{unit}</option>
                {/each}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Ingredient Lots -->
      <Card>
        <CardHeader>
          <CardTitle>Assign Reception Lots</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          {#each ingredientSlots as ing}
            {@const ingIdx = ingredientSlots.indexOf(ing)}
            {@const ri = recipeIngredients.find((r: any) => r.id === ing.recipe_ingredient_id)}
            {@const matReceptions = receptionsByIngredient.get(ing.recipe_ingredient_id) ?? []}
            <div class="rounded-lg border p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-medium">{ing.material_name}</h3>
                <Badge variant="outline">Planned: {ri?.quantity ?? '?'} {ri?.unit ?? '?'}</Badge>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>Planned Quantity</Label>
                  <input
                    name="ingredients[{ingIdx}][planned_quantity]"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full rounded-md border px-3 py-2"
                    value={ing.planned_quantity}
                  />
                </div>
                <div class="space-y-2">
                  <Label>Unit</Label>
                  <select name="ingredients[{ingIdx}][unit]" class="w-full rounded-md border px-3 py-2">
                    {#each units as unit}
                      <option value="{unit}">{unit}</option>
                    {/each}
                  </select>
                </div>
              </div>

              <input type="hidden" name="ingredients[{ingIdx}][recipe_ingredient_id]" value="{ing.recipe_ingredient_id}" />
              <input type="hidden" name="ingredients[{ingIdx}][material_id]" value="{ing.material_id}" />

              <!-- Lot slots -->
              <div class="space-y-2">
                <Label>Reception Lots (add up to {LOT_SLOTS})</Label>
                {#each ing.slots as lot}
                  {@const lotIdx = ing.slots.indexOf(lot)}
                  <div class="flex items-center gap-2">
                    <select
                      name="ingredients[{ingIdx}][lots][{lotIdx}][reception_id]"
                      class="flex-1 rounded-md border px-3 py-2"
                    >
                      <option value="">-- Select lot --</option>
                      {#each matReceptions as reception}
                        <option value="{reception.id}">
                          {reception.lot_code} · {reception.quantity} {reception.unit}
                          {#if reception.expiry_date} (Exp: {reception.expiry_date}){/if}
                        </option>
                      {/each}
                    </select>
                    <input
                      name="ingredients[{ingIdx}][lots][{lotIdx}][quantity_used]"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Qty"
                      class="w-24 rounded-md border px-3 py-2"
                    />
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </CardContent>
      </Card>

      <!-- Observations -->
      <Card>
        <CardHeader>
          <CardTitle>Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            name="observations"
            class="w-full rounded-md border px-3 py-2"
            rows={3}
            placeholder="Optional notes about this batch..."
            bind:value={observations}
          ></textarea>
        </CardContent>
      </Card>

      <div class="flex justify-end gap-3">
        <a href="/production">
          <Button type="button" variant="outline">Cancel</Button>
        </a>
        <Button type="submit">Create Production Batch</Button>
      </div>
    {/if}

    {#if recipeIngredients.length === 0 && recipeId}
      <Alert variant="warning">Selected recipe has no ingredients.</Alert>
    {/if}

    {#if recipeIngredients.length === 0 && !recipeId}
      <Card>
        <CardContent class="py-8 text-center text-muted-foreground">
          Select a recipe to start assigning reception lots.
        </CardContent>
      </Card>
    {/if}
  </form>
</div>