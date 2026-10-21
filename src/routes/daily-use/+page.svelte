<script lang="ts">
  import { t } from '$lib/i18n';
  import { formatProductLot } from '$lib/product-lot';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import type { DailyUseRecord } from '$lib/daily-use';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  const canEdit = $derived(data.user?.role === 'admin' || data.user?.role === 'quality');
  const groups = $derived.by(() => {
    const map = new Map<string, { date: string; name: string; rows: DailyUseRecord[] }>();
    for (const row of data.rows) for (const product of row.products) {
      const key = `${row.used_on}:${product.recipe_id}`;
      if (!map.has(key)) map.set(key, { date: row.used_on, name: product.product_name, rows: [] });
      map.get(key)!.rows.push(row);
    }
    return [...map.values()];
  });
  function pageUrl(page: number) {
    const params = new URLSearchParams({ date: data.date, product: data.product, lot: data.lot, page: String(page) });
    if (data.allDates) params.set('all', '1');
    return `/daily-use?${params}`;
  }
</script>
<svelte:head><title>{$t.dailyUse.title} · {$t.nav.appTitle}</title></svelte:head>
<div class="space-y-6">
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
    <div><h1 class="text-3xl font-bold">{$t.dailyUse.history}</h1><p class="mt-2 text-muted-foreground">{$t.dailyUse.historyHelp}</p></div>
    {#if canEdit}<Button href="/daily-use/new">+ {$t.dailyUse.new}</Button>{/if}
  </div>
  <form method="GET" class="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
    <div class="grid gap-2"><Label for="filter_date">{$t.dailyUse.date}</Label><Input id="filter_date" type="date" name="date" value={data.date} /></div>
    <div class="grid gap-2"><Label for="filter_product">{$t.dailyUse.products}</Label><Select id="filter_product" name="product" value={data.product}>
      <option value="">{$t.dailyUse.allProducts}</option>{#each data.products as product}<option value={product.id}>{product.name}</option>{/each}
    </Select></div>
    <div class="grid gap-2"><Label for="filter_lot">{$t.dailyUse.lotSearch}</Label><Input id="filter_lot" name="lot" value={data.lot} /></div>
    <div class="flex flex-wrap items-end gap-3"><label class="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" name="all" value="1" checked={data.allDates} />{$t.dailyUse.allDates}</label><Button type="submit">{$t.dailyUse.filter}</Button></div>
  </form>
  <p class="text-sm text-muted-foreground">{data.total} {$t.dailyUse.count}</p>
  {#each groups as group}
    <section class="overflow-hidden rounded-xl border bg-card">
      <div class="border-b bg-muted/30 p-4"><h2 class="text-xl font-bold">{group.name}</h2><p class="mt-1 break-words text-sm text-muted-foreground"><span class="font-medium">{$t.dailyUse.productLot}:</span> {formatProductLot(group.name, group.date)}</p><p class="mt-1 text-sm text-muted-foreground">{group.date}</p></div>
      <div class="divide-y">{#each group.rows as row}
        <div class="flex flex-wrap items-start justify-between gap-3 p-4">
          <div class="min-w-0"><h3 class="break-words font-semibold">{row.material_name}</h3>
            <dl class="mt-2 grid gap-1 text-sm"><div><dt class="inline text-muted-foreground">{$t.dailyUse.lot}: </dt><dd class="inline break-all">{row.lot_code}</dd></div>
            <div><dt class="inline text-muted-foreground">{$t.dailyUse.expiry}: </dt><dd class="inline">{row.expiry_date}</dd></div></dl>
            <p class="mt-2 text-xs text-muted-foreground">{$t.dailyUse.by}: {row.created_by_name}</p>
          </div>
          {#if canEdit}<Button href="/daily-use/{row.id}/edit" variant="outline" size="sm">{$t.dailyUse.edit}</Button>{/if}
        </div>
      {/each}</div>
    </section>
  {:else}<div class="rounded-xl border p-8 text-center text-muted-foreground">{$t.dailyUse.empty}</div>{/each}
  {#if data.total > 50}<nav class="flex items-center justify-between gap-3" aria-label={$t.dailyUse.page}>
    <span>{$t.dailyUse.page} {data.page}</span><div class="flex gap-2">
      {#if data.page > 1}<Button href={pageUrl(data.page - 1)} variant="outline">{$t.dailyUse.previousPage}</Button>{/if}
      {#if data.page * 50 < data.total}<Button href={pageUrl(data.page + 1)} variant="outline">{$t.dailyUse.nextPage}</Button>{/if}
    </div></nav>{/if}
</div>
