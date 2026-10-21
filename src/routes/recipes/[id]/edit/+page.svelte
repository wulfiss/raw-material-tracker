<script lang="ts">
  import SimpleRecipeForm from '$lib/components/recipes/SimpleRecipeForm.svelte';
  import { Button } from '$lib/components/ui/button';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>
<svelte:head><title>{$t.simpleRecipe.edit} · {$t.nav.appTitle}</title></svelte:head>
<div class="mx-auto max-w-xl space-y-5">
  <Button href="/recipes" variant="ghost">← {$t.workspace.recipes}</Button>
  <div><h1 class="text-3xl font-bold">{$t.simpleRecipe.edit}</h1><p class="mt-2 text-muted-foreground">{$t.simpleRecipe.description}</p></div>
  <div class="rounded-xl border bg-card p-4 sm:p-6"><SimpleRecipeForm {...data} {form} /></div>
</div>
