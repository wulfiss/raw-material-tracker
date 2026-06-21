<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import { Alert } from '$lib/components/ui/alert';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Plus, X } from '@lucide/svelte';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  const materials = $derived(data.materials);

  type IngredientRow = {
    uid: string;
    material_id: string;
    quantity: string;
    unit: string;
    lossPercent: string;
    notes: string;
    searchQuery: string;
    searchFocused: boolean;
  };

  let ingredients = $state<IngredientRow[]>([]);

  function addIngredient() {
    ingredients.push({
      uid: crypto.randomUUID(),
      material_id: '',
      quantity: '',
      unit: 'kg',
      lossPercent: '',
      notes: '',
      searchQuery: '',
      searchFocused: false,
    });
  }

  function removeIngredient(idx: number) {
    ingredients.splice(idx, 1);
  }

  function materialLabel(m: typeof materials[number]) {
    return `${m.name} · ${m.category} · ${m.unit}`;
  }

  function selectMaterialInRow(row: IngredientRow, m: typeof materials[number]) {
    row.material_id = m.id;
    row.searchQuery = materialLabel(m);
    row.unit = m.unit ?? 'kg';
    row.searchFocused = false;
  }

  function handleMaterialInput(row: IngredientRow, event: Event) {
    row.searchQuery = (event.currentTarget as HTMLInputElement).value;
    row.material_id = '';
    row.searchFocused = true;
  }

  function getFilteredMaterials(row: IngredientRow) {
    if (!row.searchFocused) return [];
    const query = row.searchQuery.trim().toLowerCase();
    const selectedIds = ingredients.filter(r => r.uid !== row.uid && r.material_id).map(r => r.material_id);
    let matches = materials;
    if (query) {
      matches = matches.filter(m => materialLabel(m).toLowerCase().includes(query));
    }
    return matches.filter(m => !selectedIds.includes(m.id)).slice(0, 15);
  }

  $effect(() => {
    if (ingredients.length === 0) addIngredient();
  });
</script>

<div class="mb-8">
  <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.newRecipe.subtitle}</p>
  <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.newRecipe.title}</h1>
</div>

{#if form?.message}
  <Alert variant="destructive" class="mb-6">{form.message}</Alert>
{/if}

<form method="POST">
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>{$t.newRecipe.formTitle}</CardTitle>
      <CardDescription>{$t.newRecipe.formDescription}</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-5 md:grid-cols-2">
      <div class="grid gap-2 md:col-span-2">
        <Label for="name">{$t.newRecipe.fields.name}</Label>
        <Input id="name" name="name" required value={form?.fields?.name ?? ''} placeholder={$t.newRecipe.fields.namePlaceholder} />
      </div>
      <div class="grid gap-2">
        <Label for="category">{$t.newRecipe.fields.category}</Label>
        <Input id="category" name="category" value={form?.fields?.category ?? ''} placeholder={$t.newRecipe.fields.categoryPlaceholder} />
      </div>
      <div class="grid gap-2">
        <Label for="yieldQuantity">{$t.newRecipe.fields.yieldQuantity}</Label>
        <Input id="yieldQuantity" name="yieldQuantity" type="number" min="0.001" step="0.001" required value={form?.fields?.yieldQuantity ?? ''} />
      </div>
      <div class="grid gap-2">
        <Label for="yieldUnit">{$t.newRecipe.fields.yieldUnit}</Label>
        <Select id="yieldUnit" name="yieldUnit" required value={form?.fields?.yieldUnit ?? 'kg'}>
          <option value="kg">{$t.newRecipe.units.kg}</option>
          <option value="g">{$t.newRecipe.units.g}</option>
          <option value="liter">{$t.newRecipe.units.liter}</option>
          <option value="unit">{$t.newRecipe.units.unit}</option>
          <option value="box">{$t.newRecipe.units.box}</option>
        </Select>
      </div>
      <div class="grid gap-2 flex flex-row items-center gap-4 md:col-span-2">
        <div class="flex items-center space-x-2">
          <input type="checkbox" id="active" name="active" checked={form?.fields?.active ?? true} class="h-4 w-4" />
          <Label for="active">{$t.newRecipe.fields.active}</Label>
        </div>
      </div>
      <div class="grid gap-2 md:col-span-2">
        <Label for="notes">{$t.newRecipe.fields.notes}</Label>
        <Textarea id="notes" name="notes" rows={3} value={form?.fields?.notes ?? ''} />
      </div>
    </CardContent>
  </Card>

  <Card class="mb-6">
    <CardHeader>
      <CardTitle>{$t.newRecipe.ingredients.title}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      {#each ingredients as row, idx (row.uid)}
        <div class="rounded-lg border bg-card p-4 space-y-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-muted-foreground">{$t.newRecipe.ingredients.material} {idx + 1}</span>
            {#if ingredients.length > 1}
              <button type="button" onclick={() => removeIngredient(idx)} class="text-destructive hover:underline text-sm flex items-center gap-1">
                <X class="size-3.5" /> {$t.newRecipe.ingredients.remove}
              </button>
            {/if}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="relative grid gap-2">
              <Label>{$t.newRecipe.ingredients.material}</Label>
              <input type="hidden" name={`ing_${idx}_material_id`} value={row.material_id} />
              <Input
                required
                value={row.searchQuery}
                placeholder={$t.newRecipe.ingredients.materialPlaceholder}
                autocomplete="off"
                oninput={(e) => handleMaterialInput(row, e)}
                onfocus={() => { row.searchFocused = true; }}
                onblur={() => { setTimeout(() => { row.searchFocused = false; }, 150); }}
              />
              {#if row.searchFocused}
                @{const filtered = getFilteredMaterials(row)}
                {#if filtered.length > 0}
                  <div class="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-md border bg-background shadow-lg">
                    {#each filtered as m (m.id)}
                      <button
                        type="button"
                        class="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                        onmousedown={(event) => event.preventDefault()}
                        onclick={() => selectMaterialInRow(row, m)}
                      >
                        <span class="font-medium">{m.name}</span>
                        <span class="text-xs text-muted-foreground">{m.category} · {m.unit}</span>
                      </button>
                    {/each}
                  </div>
                {:else if row.searchQuery.trim()}
                  <div class="absolute left-0 right-0 top-full z-30 mt-1 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow-lg">
                    {$t.newRecipe.messages.noMaterialsFound}
                  </div>
                {/if}
              {/if}
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="grid gap-2">
                <Label>{$t.newRecipe.ingredients.quantity}</Label>
                <Input type="number" min="0.001" step="0.001" required value={row.quantity} name={`ing_${idx}_quantity`} oninput={(e) => { row.quantity = (e.target as HTMLInputElement).value; }} />
              </div>
              <div class="grid gap-2">
                <Label>{$t.newRecipe.ingredients.unit}</Label>
                <Select bind:value={row.unit} name={`ing_${idx}_unit`}>
                  <option value="kg">{$t.newRecipe.units.kg}</option>
                  <option value="g">{$t.newRecipe.units.g}</option>
                  <option value="liter">{$t.newRecipe.units.liter}</option>
                  <option value="unit">{$t.newRecipe.units.unit}</option>
                  <option value="box">{$t.newRecipe.units.box}</option>
                </Select>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div class="grid gap-2">
              <Label>{$t.newRecipe.ingredients.lossPercent}</Label>
              <Input type="number" min="0" max="100" step="0.1" value={row.lossPercent} name={`ing_${idx}_lossPercent`} oninput={(e) => { row.lossPercent = (e.target as HTMLInputElement).value; }} />
            </div>
          </div>

          <div class="grid gap-2">
            <Label>{$t.newRecipe.ingredients.notes}</Label>
            <Input value={row.notes} name={`ing_${idx}_notes`} oninput={(e) => { row.notes = (e.target as HTMLInputElement).value; }} />
          </div>
        </div>
      {/each}

      <Button type="button" variant="outline" onclick={addIngredient}>
        <Plus class="size-4 mr-1" /> {$t.newRecipe.ingredients.add}
      </Button>
    </CardContent>
  </Card>

  <div class="flex justify-end gap-3">
    <Button href="/recipes" variant="outline">{$t.newRecipe.buttons.cancel}</Button>
    <Button type="submit">{$t.newRecipe.buttons.save}</Button>
  </div>
</form>
