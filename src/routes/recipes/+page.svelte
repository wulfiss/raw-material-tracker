<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  const canWrite = $derived(data.user?.role === 'admin' || data.user?.role === 'quality');
</script>
<svelte:head><title>{$t.simpleRecipe.title} · {$t.nav.appTitle}</title></svelte:head>
<div class="space-y-6">
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
    <div><h1 class="text-3xl font-bold">{$t.simpleRecipe.title}</h1><p class="mt-2 text-muted-foreground">{$t.simpleRecipe.description}</p></div>
    {#if canWrite}<Button href="/recipes/new">+ {$t.simpleRecipe.new}</Button>{/if}
  </div>
  <div class="grid gap-4 sm:grid-cols-2">
    {#each data.recipes as recipe (recipe.id)}
      <article class="space-y-4 rounded-xl border bg-card p-5">
        <div class="flex flex-wrap items-start justify-between gap-2"><h2 class="break-words text-xl font-bold">{recipe.name}</h2>
          {#if !recipe.active}<span class="text-sm text-muted-foreground">{$t.simpleRecipe.inactive}</span>{/if}
        </div>
        <div><h3 class="mb-2 text-sm font-medium text-muted-foreground">{$t.simpleRecipe.ingredients}</h3>
          <ul class="list-inside list-disc space-y-1">{#each recipe.ingredients as ingredient}<li class="break-words">{ingredient}</li>{/each}</ul>
        </div>
        {#if canWrite}<Button href="/recipes/{recipe.id}/edit" variant="outline" size="sm">{$t.simpleRecipe.edit}</Button>{/if}
      </article>
    {:else}<p class="rounded-xl border p-8 text-center text-muted-foreground sm:col-span-2">{$t.simpleRecipe.empty}</p>{/each}
  </div>
</div>
