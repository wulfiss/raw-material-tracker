<script lang="ts">
  import DailyUseForm from '$lib/components/daily-use/DailyUseForm.svelte';
  import { Alert } from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>
<svelte:head><title>{$t.dailyUse.new} · {$t.nav.appTitle}</title></svelte:head>
<div class="mx-auto max-w-xl space-y-5">
  <div><Button href="/daily-use" variant="ghost">← {$t.dailyUse.back}</Button>
    <h1 class="mt-3 text-3xl font-bold">{$t.dailyUse.new}</h1>
    <p class="mt-2 text-muted-foreground">{$t.dailyUse.description}</p>
  </div>
  {#if data.saved}<Alert role="status">{$t.dailyUse.saved}</Alert>{/if}
  {#if !data.materials.length}<Alert>{$t.dailyUse.noMaterials} <a class="underline" href="/materials/new">{$t.dailyUse.addMaterial}</a></Alert>{/if}
  {#if !data.products.length}<Alert>{$t.dailyUse.noProducts} <a class="underline" href="/recipes/new">{$t.dailyUse.addProduct}</a></Alert>{/if}
  <div class="rounded-xl border bg-card p-4 sm:p-6">
    {#key data.defaults.request_token}<DailyUseForm {...data} {form} />{/key}
  </div>
  <a class="block text-center text-sm text-muted-foreground underline" href="/receptions/new?mode=reception">{$t.dailyUse.inbound}</a>
</div>
