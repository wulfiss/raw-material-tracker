<script lang="ts">
  import DailyUseForm from '$lib/components/daily-use/DailyUseForm.svelte';
  import { Button } from '$lib/components/ui/button';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
</script>
<svelte:head><title>{$t.dailyUse.edit} · {$t.nav.appTitle}</title></svelte:head>
<div class="mx-auto max-w-xl space-y-5">
  <Button href="/daily-use" variant="ghost">← {$t.dailyUse.back}</Button>
  <h1 class="text-3xl font-bold">{$t.dailyUse.edit}</h1>
  <div class="rounded-xl border bg-card p-4 sm:p-6"><DailyUseForm {...data} {form} editing /></div>
</div>
