<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { enhance } from '$app/forms';
  import { t } from '$lib/i18n';
  import type { SimpleRecipeFields } from '$lib/simple-recipe';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert } from '$lib/components/ui/alert';
  let { materials, defaults, form }: {
    materials: { id: string; name: string }[]; defaults: SimpleRecipeFields;
    form: { fields?: SimpleRecipeFields; message?: string; materialAdded?: boolean } | null;
  } = $props();
  let name = $state(untrack(() => (form?.fields ?? defaults).name));
  let selected = $state<string[]>(untrack(() => [...(form?.fields ?? defaults).material_ids]));
  let search = $state('');
  let newMaterial = $state('');
  let saving = $state(false);
  let ready = $state(false);
  onMount(() => { ready = true; });
  $effect(() => {
    if (form?.fields) { name = form.fields.name; selected = [...form.fields.material_ids]; }
    if (form?.materialAdded) newMaterial = '';
  });
  const visible = $derived(materials.filter(m => selected.includes(m.id) || m.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())));
</script>
{#if form?.message}<Alert role="alert" variant="destructive" class="mb-4">{form.message}</Alert>{/if}
{#if form?.materialAdded}<Alert role="status" class="mb-4">{$t.simpleRecipe.added}</Alert>{/if}
<form method="POST" action="?/save" class="grid gap-5" use:enhance={() => {
  saving = true;
  return async ({ update }) => { try { await update({ reset: false }); } finally { saving = false; } };
}}>
  <fieldset disabled={!ready || saving} class="contents" aria-label={$t.simpleRecipe.title}>
    <div class="grid gap-2"><Label for="recipe_name">{$t.simpleRecipe.name}</Label>
      <Input id="recipe_name" name="name" required maxlength={120} value={name} placeholder={$t.simpleRecipe.placeholder}
        oninput={event => name = event.currentTarget.value} />
    </div>
    <fieldset class="min-w-0 space-y-3">
      <legend class="text-sm font-semibold">{$t.simpleRecipe.ingredients}</legend>
      <p class="text-sm text-muted-foreground">{$t.simpleRecipe.help}</p>
      <Input type="search" aria-label={$t.simpleRecipe.search} placeholder={$t.simpleRecipe.search} value={search} oninput={event => search = event.currentTarget.value} />
      <div class="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-2">
        {#each visible as material (material.id)}
          <label class="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border p-3 has-checked:border-primary has-checked:bg-primary/5">
            <input class="size-5 shrink-0 accent-primary" type="checkbox" name="material_ids" value={material.id} checked={selected.includes(material.id)}
              onchange={event => selected = event.currentTarget.checked ? [...selected, material.id] : selected.filter(id => id !== material.id)} />
            <span class="break-words font-medium">{material.name}</span>
          </label>
        {:else}<p class="p-3 text-sm text-muted-foreground">{$t.simpleRecipe.noMatches}</p>{/each}
      </div>
      <p class="text-sm text-muted-foreground" aria-live="polite">{selected.length} {$t.simpleRecipe.selected}</p>
    </fieldset>
    <div class="space-y-2 rounded-lg border bg-muted/20 p-3">
      <Label for="new_material">{$t.simpleRecipe.newMaterial}</Label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <Input id="new_material" name="new_material" maxlength={120} value={newMaterial} placeholder={$t.simpleRecipe.newMaterialPlaceholder} oninput={event => newMaterial = event.currentTarget.value} />
        <Button type="submit" formaction="?/addMaterial" formnovalidate variant="outline" disabled={saving}>{$t.simpleRecipe.addMaterial}</Button>
      </div>
    </div>
    <div class="flex flex-wrap justify-end gap-3 border-t pt-5">
      <Button href="/recipes" variant="outline">{$t.simpleRecipe.cancel}</Button>
      <Button type="submit" disabled={saving}>{saving ? $t.simpleRecipe.saving : $t.simpleRecipe.save}</Button>
    </div>
  </fieldset>
</form>
