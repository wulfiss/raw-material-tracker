<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select } from '$lib/components/ui/select';
  import { t } from '$lib/i18n';
  import { formatProductLot } from '$lib/product-lot';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  const canWrite = $derived(data.user?.role === 'admin' || data.user?.role === 'quality');
  function pageLink(page: number) {
    const params = new URLSearchParams(Object.entries(data.filters).filter(([, value]) => value));
    params.set('page', String(page));return `/?${params}`;
  }
</script>
<svelte:head><title>{$t.dashboardView.title} · {$t.nav.appTitle}</title></svelte:head>
<div class="space-y-6">
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
    <div><h1 class="text-3xl font-bold">{$t.dashboardView.title}</h1><p class="mt-2 max-w-2xl text-muted-foreground">{$t.dashboardView.description}</p></div>
    {#if canWrite}<Button href="/daily-use/new" class="h-auto min-h-10 whitespace-normal">+ {$t.workspace.daily}</Button>{/if}
  </div>
  <form method="GET" class="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
    <div class="grid gap-2"><Label for="from">{$t.dashboardView.from}</Label><Input id="from" name="from" type="date" value={data.filters.from} /></div>
    <div class="grid gap-2"><Label for="to">{$t.dashboardView.to}</Label><Input id="to" name="to" type="date" value={data.filters.to} /></div>
    <div class="grid gap-2"><Label for="material">{$t.dashboardView.material}</Label><Select id="material" name="material" value={data.filters.material}>
      <option value="">{$t.dashboardView.allMaterials}</option>{#each data.materials as material}<option value={material.id}>{material.name}</option>{/each}
    </Select></div>
    <div class="grid gap-2"><Label for="product">{$t.dashboardView.product}</Label><Select id="product" name="product" value={data.filters.product}>
      <option value="">{$t.dashboardView.allProducts}</option>{#each data.products as product}<option value={product.id}>{product.name}</option>{/each}
    </Select></div>
    <div class="grid gap-2"><Label for="supplier_filter">{$t.dashboardView.supplier}</Label><Input id="supplier_filter" name="supplier" maxlength={160} value={data.filters.supplier} /></div>
    <div class="grid gap-2"><Label for="lot">{$t.dashboardView.lot}</Label><Input id="lot" name="lot" maxlength={120} value={data.filters.lot} /></div>
    <div class="flex flex-wrap items-end gap-3"><Button type="submit">{$t.dashboardView.filter}</Button><Button href="/" variant="outline">{$t.dashboardView.clear}</Button></div>
  </form>
  <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label={$t.dashboardView.summary}>
    {#each [[$t.dashboardView.records, data.stats.records], [$t.dashboardView.materials, data.stats.materials], [$t.dashboardView.products, data.stats.products], [$t.dashboardView.lots, data.stats.productionLots]] as [label, value]}
      <div class="rounded-xl border bg-card p-4"><p class="text-sm text-muted-foreground">{label}</p><p class="mt-2 text-3xl font-bold text-primary">{value}</p></div>
    {/each}
  </section>
  <p class="text-sm text-muted-foreground">{$t.dashboardView.showing}: {data.rows.length} {$t.dashboardView.of} {data.total}</p>
  <div class="hidden overflow-x-auto rounded-xl border bg-card lg:block">
    <table class="w-full text-left text-sm"><thead class="border-b bg-muted/30"><tr>
      <th class="p-4">{$t.dashboardView.date}</th><th class="p-4">{$t.dashboardView.material}</th><th class="p-4">{$t.dashboardView.supplier}</th><th class="p-4">{$t.dashboardView.lot}</th><th class="p-4">{$t.dashboardView.expiry}</th><th class="p-4">{$t.dashboardView.products}</th><th class="p-4">{$t.dashboardView.operator}</th>
    </tr></thead><tbody class="divide-y">
      {#each data.rows as row (row.id)}<tr>
        <td class="whitespace-nowrap p-4">{row.used_on}</td><td class="p-4 font-medium">{row.material_name}</td><td class="max-w-48 break-words p-4">{row.supplier || '—'}</td><td class="max-w-48 break-words p-4">{row.lot_code}</td><td class="whitespace-nowrap p-4">{row.expiry_date}</td>
        <td class="p-4"><ul class="space-y-2">{#each row.products as product}<li><p class="font-medium">{product.product_name}</p><p class="break-all text-xs text-muted-foreground">{formatProductLot(product.product_name, row.used_on)}</p></li>{/each}</ul></td>
        <td class="p-4">{row.created_by_name}{#if canWrite}<a class="mt-2 block text-primary underline" href="/daily-use/{row.id}/edit">{$t.dailyUse.edit}</a>{/if}</td>
      </tr>{:else}<tr><td colspan="7" class="p-8 text-center text-muted-foreground">{$t.dashboardView.empty}</td></tr>{/each}
    </tbody></table>
  </div>
  <div class="space-y-4 lg:hidden">
    {#each data.rows as row (row.id)}<article class="space-y-4 rounded-xl border bg-card p-4">
      <div><p class="text-sm text-muted-foreground">{row.used_on}</p><h2 class="mt-1 break-words text-xl font-bold">{row.material_name}</h2></div>
      <dl class="grid gap-2 text-sm"><div><dt class="text-muted-foreground">{$t.dashboardView.supplier}</dt><dd class="break-words font-medium">{row.supplier || '—'}</dd></div><div><dt class="text-muted-foreground">{$t.dashboardView.lot}</dt><dd class="break-all font-medium">{row.lot_code}</dd></div><div><dt class="text-muted-foreground">{$t.dashboardView.expiry}</dt><dd>{row.expiry_date}</dd></div></dl>
      <div class="space-y-2 border-t pt-3"><h3 class="text-sm font-medium text-muted-foreground">{$t.dashboardView.products}</h3>
        {#each row.products as product}<div><p class="break-words font-medium">{product.product_name}</p><p class="break-all text-sm text-muted-foreground">{formatProductLot(product.product_name, row.used_on)}</p></div>{/each}
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3"><p class="text-xs text-muted-foreground">{$t.dashboardView.operator}: {row.created_by_name}</p>{#if canWrite}<Button href="/daily-use/{row.id}/edit" variant="outline" size="sm">{$t.dailyUse.edit}</Button>{/if}</div>
    </article>{:else}<p class="rounded-xl border p-8 text-center text-muted-foreground">{$t.dashboardView.empty}</p>{/each}
  </div>
  {#if data.pages > 1}<nav class="flex flex-wrap items-center justify-between gap-3" aria-label={$t.dashboardView.page}>
    <span class="text-sm">{$t.dashboardView.page} {data.page} {$t.dashboardView.of} {data.pages}</span><div class="flex gap-2">
      {#if data.page > 1}<Button href={pageLink(data.page - 1)} variant="outline">{$t.dashboardView.previous}</Button>{/if}
      {#if data.page < data.pages}<Button href={pageLink(data.page + 1)} variant="outline">{$t.dashboardView.next}</Button>{/if}
    </div>
  </nav>{/if}
</div>
