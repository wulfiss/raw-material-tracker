<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount, untrack } from 'svelte';
  import { t } from '$lib/i18n';
  import type { DailyUseFields, DailyUseOption } from '$lib/daily-use';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert } from '$lib/components/ui/alert';

  let { materials, products, ingredients, defaults, form, editing = false, suggestions = [] }: {
    materials: DailyUseOption[]; products: DailyUseOption[];
    ingredients: { material_id: string; recipe_id: string }[];
    defaults: DailyUseFields; form: { fields?: DailyUseFields; message?: string } | null;
    editing?: boolean; suggestions?: string[];
  } = $props();
  let fields = $derived(form?.fields ?? defaults);
  let values = $state(untrack(() => ({ ...fields })));
  let materialSearch = $state(untrack(() => materials.find(m => m.id === fields.material_id)?.name ?? ''));
  let selected = $state<string[]>(untrack(() => [...fields.product_ids]));
  let search = $state('');
  let saving = $state(false);
  // Prevent fast input from being overwritten while the page hydrates.
  let ready = $state(false);
  onMount(() => { ready = true; });
  $effect(() => {
    if (form?.fields) {
      values = { ...form.fields };
      materialSearch = materials.find(m => m.id === form.fields?.material_id)?.name ?? '';
      selected = [...form.fields.product_ids];
    }
  });
  let materialId = $derived(materials.find(m => m.name === materialSearch)?.id ?? '');
  let recommended = $derived(ingredients.filter(i => i.material_id === materialId).map(i => i.recipe_id));
  let filtered = $derived(products.filter(p => selected.includes(p.id) || p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
    .toSorted((a, b) => Number(recommended.includes(b.id)) - Number(recommended.includes(a.id)) || a.name.localeCompare(b.name)));
</script>

{#if form?.message}<Alert role="alert" variant="destructive" class="mb-5">{form.message}</Alert>{/if}
<form method="POST" class="grid gap-5" use:enhance={() => {
  saving = true;
  return async ({ update }) => { try { await update({ reset: false }); } finally { saving = false; } };
}}>
  <fieldset disabled={!ready || saving} class="contents" aria-label={$t.dailyUse.title}>
  <input type="hidden" name="request_token" value={values.request_token} />
  <div class="grid gap-2">
    <Label for="used_on">{$t.dailyUse.date}</Label>
    <Input id="used_on" name="used_on" type="date" required value={values.used_on} oninput={(event) => values.used_on = event.currentTarget.value} />
  </div>
  <div class="grid gap-2">
    <Label for="daily_material">{$t.dailyUse.material}</Label>
    <Input id="daily_material" type="search" list="daily-materials" placeholder={$t.dailyUse.materialPlaceholder}
      required autocomplete="off" value={materialSearch} oninput={(event) => materialSearch = event.currentTarget.value} />
    <datalist id="daily-materials">{#each materials as material}<option value={material.name}></option>{/each}</datalist>
    <input type="hidden" name="material_id" value={materialId} />
  </div>
  <div class="grid gap-2">
    <Label for="supplier">{$t.dailyUse.supplier}</Label>
    <Input id="supplier" name="supplier" required maxlength={160} value={values.supplier}
      oninput={event => values.supplier = event.currentTarget.value} />
  </div>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="grid gap-2">
      <Label for="lot_code">{$t.dailyUse.lot}</Label>
      <Input id="lot_code" name="lot_code" required maxlength={120} autocomplete="off" value={values.lot_code} oninput={(event) => values.lot_code = event.currentTarget.value} />
    </div>
    <div class="grid gap-2">
      <Label for="expiry_date">{$t.dailyUse.expiry}</Label>
      <Input id="expiry_date" name="expiry_date" type="date" required value={values.expiry_date} oninput={(event) => values.expiry_date = event.currentTarget.value} />
    </div>
  </div>
  <fieldset class="min-w-0 space-y-3">
    <legend class="text-sm font-semibold">{$t.dailyUse.products}</legend>
    <p class="text-sm text-muted-foreground">{$t.dailyUse.productHelp}</p>
    <Input type="search" aria-label={$t.dailyUse.productSearch} placeholder={$t.dailyUse.productSearch} value={search} oninput={(event) => search = event.currentTarget.value} />
    <div class="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-2">
      {#each filtered as product (product.id)}
        <label class="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border p-3 has-checked:border-primary has-checked:bg-primary/5">
          <input type="checkbox" name="product_ids" value={product.id} checked={selected.includes(product.id)}
            class="size-5 shrink-0 accent-primary" onchange={(event) => {
              selected = event.currentTarget.checked ? [...selected, product.id] : selected.filter(id => id !== product.id);
            }} />
          <span class="min-w-0">
            <span class="block break-words font-medium">{product.name}</span>
            {#if recommended.includes(product.id)}<span class="block text-xs text-primary">{$t.dailyUse.suggested}</span>
            {:else if suggestions.includes(product.id)}<span class="block text-xs text-muted-foreground">{$t.dailyUse.previous}</span>{/if}
          </span>
        </label>
      {:else}<p class="p-3 text-sm text-muted-foreground">{$t.dailyUse.noMatches}</p>{/each}
    </div>
    <p class="text-sm text-muted-foreground" aria-live="polite">{selected.length} {$t.dailyUse.selected}</p>
  </fieldset>
  <div class="flex flex-col gap-3 border-t pt-5">
    {#if !editing}<Button type="submit" name="intent" value="another" disabled={saving || !materials.length || !products.length}
      class="h-auto min-h-12 whitespace-normal py-3">{saving ? $t.dailyUse.saving : $t.dailyUse.another}</Button>{/if}
    <div class="flex flex-wrap justify-end gap-3">
      <Button href="/daily-use" variant="outline">{$t.dailyUse.cancel}</Button>
      <Button type="submit" name="intent" value="done" disabled={saving || !materials.length || !products.length}>{saving ? $t.dailyUse.saving : $t.dailyUse.save}</Button>
    </div>
  </div>
  </fieldset>
</form>
