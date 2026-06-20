<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Select } from '$lib/components/ui/select';
  import { Label } from '$lib/components/ui/label';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { t } from '$lib/i18n';
  import { translateStatus } from '$lib/i18n/helpers';
  import type { PageProps } from './$types';
  import { enhance } from '$app/forms';

  let { data }: PageProps = $props();

  const observationPreviewLength = 8;
  let expandedObservationId = $state<string | null>(null);
  let filtersOpen = $state(false);
  let showSaveDialog = $state(false);
  let viewName = $state('');

  function viewUrl(view: typeof data.views[number]) {
    const params = new URLSearchParams();
    if (view.filters.search) params.set('search', view.filters.search);
    if (view.filters.dateFrom) params.set('dateFrom', view.filters.dateFrom);
    if (view.filters.dateTo) params.set('dateTo', view.filters.dateTo);
    if (view.filters.materialId) params.set('materialId', view.filters.materialId);
    if (view.filters.category) params.set('category', view.filters.category);
    if (view.filters.supplier) params.set('supplier', view.filters.supplier);
    if (view.filters.storageCondition) params.set('storageCondition', view.filters.storageCondition);
    if (view.filters.expirationStatus) params.set('expiration', view.filters.expirationStatus);
    if (view.filters.withObservationsOnly) params.set('withObservationsOnly', 'true');
    const qs = params.toString();
    return qs ? `/receptions?${qs}` : '/receptions';
  }

  const expirationCounts = $derived.by(() => {
    const counts = { expired: 0, near_expiry: 0, missing: 0 };
    for (const r of data.receptions) {
      if (r.expirationStatus === 'expired') counts.expired++;
      else if (r.expirationStatus === 'near_expiry') counts.near_expiry++;
      else if (r.expirationStatus === 'missing') counts.missing++;
    }
    return counts;
  });

  const hasActiveFilters = $derived(
    !!data.filters.dateFrom || !!data.filters.dateTo || !!data.filters.materialId ||
    !!data.filters.category || !!data.filters.supplier || !!data.filters.storageCondition ||
    !!data.filters.expirationStatus || data.filters.withObservationsOnly
  );

  function expirationBadgeVariant(status: string) {
    if (status === 'expired') return 'destructive';
    if (status === 'near_expiry') return 'secondary';
    if (status === 'missing') return 'secondary';
    return 'outline';
  }

  function expirationLabel(status: string) {
    if (status === 'expired') return $t.receptions.expired;
    if (status === 'near_expiry') return $t.receptions.nearExpiry;
    if (status === 'missing') return $t.receptions.missingExpiration;
    return $t.receptions.ok;
  }

  function observationText(observations: string | null | undefined) {
    return observations?.trim() ?? '';
  }

  function isObservationLong(observations: string) {
    return observations.length > observationPreviewLength;
  }

  function observationPreview(observations: string) {
    if (!isObservationLong(observations)) return observations;
    return `${observations.slice(0, observationPreviewLength).trimEnd()}…`;
  }

  function toggleObservation(id: string) {
    expandedObservationId = expandedObservationId === id ? null : id;
  }

  function statusVariant(status: string) {
    if (status === 'accepted') return 'success';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  }

  const filterQueryString = $derived.by(() => {
    const p = new URLSearchParams();
    if (data.filters.search) p.set('search', data.filters.search);
    if (data.filters.dateFrom) p.set('dateFrom', data.filters.dateFrom);
    if (data.filters.dateTo) p.set('dateTo', data.filters.dateTo);
    if (data.filters.materialId) p.set('materialId', data.filters.materialId);
    if (data.filters.category) p.set('category', data.filters.category);
    if (data.filters.supplier) p.set('supplier', data.filters.supplier);
    if (data.filters.storageCondition) p.set('storageCondition', data.filters.storageCondition);
    if (data.filters.expirationStatus) p.set('expiration', data.filters.expirationStatus);
    if (data.filters.withObservationsOnly) p.set('withObservationsOnly', 'true');
    return p.toString();
  });

  const exportFilteredUrl = $derived(filterQueryString ? `/receptions/export?${filterQueryString}` : '/receptions/export');
  const printUrl = $derived(filterQueryString ? `/receptions/print?${filterQueryString}` : '/receptions/print');
</script>

<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.receptions.subtitle}</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.receptions.title}</h1>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <Button variant="outline" size="sm" href={exportFilteredUrl}>{$t.receptions.exportFiltered}</Button>
    <Button variant="outline" size="sm" href="/receptions/export">{$t.receptions.exportAll}</Button>
    <Button variant="outline" size="sm" href={printUrl}>{$t.receptions.print}</Button>
    <Button href="/receptions/new">{$t.receptions.newReception}</Button>
  </div>
</div>

<div class="mb-4 flex flex-wrap items-center gap-2">
  {#each data.views as view (view.id)}
    <a
      href={viewUrl(view)}
      class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted {view.default ? 'bg-secondary text-secondary-foreground' : 'bg-background text-foreground'}"
    >
      {view.name}
      {#if !view.default}
        <form method="POST" action="?/deleteView" class="inline">
          <input type="hidden" name="id" value={view.id} />
          <button type="submit" class="ml-1 text-muted-foreground hover:text-destructive" onclick={(e) => e.stopPropagation()}>×</button>
        </form>
      {/if}
    </a>
  {/each}
  <button type="button" class="inline-flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted" onclick={() => (showSaveDialog = !showSaveDialog)}>
    + {$t.receptions.saveView}
  </button>
</div>

{#if showSaveDialog}
  <form method="POST" action="?/saveView" class="mb-4 flex items-end gap-3 rounded-lg border p-3">
    <div class="grid gap-1.5">
      <Label for="viewName">{$t.receptions.viewName}</Label>
      <Input id="viewName" name="name" value={viewName} required placeholder={$t.receptions.viewNamePlaceholder} oninput={(e) => (viewName = (e.target as HTMLInputElement).value)} />
    </div>
    {#if data.filters.search}<input type="hidden" name="search" value={data.filters.search} />{/if}
    {#if data.filters.dateFrom}<input type="hidden" name="dateFrom" value={data.filters.dateFrom} />{/if}
    {#if data.filters.dateTo}<input type="hidden" name="dateTo" value={data.filters.dateTo} />{/if}
    {#if data.filters.materialId}<input type="hidden" name="materialId" value={data.filters.materialId} />{/if}
    {#if data.filters.category}<input type="hidden" name="category" value={data.filters.category} />{/if}
    {#if data.filters.supplier}<input type="hidden" name="supplier" value={data.filters.supplier} />{/if}
    {#if data.filters.storageCondition}<input type="hidden" name="storageCondition" value={data.filters.storageCondition} />{/if}
    {#if data.filters.expirationStatus}<input type="hidden" name="expirationStatus" value={data.filters.expirationStatus} />{/if}
    {#if data.filters.withObservationsOnly}<input type="hidden" name="withObservationsOnly" value="true" />{/if}
    <Button type="submit" size="sm" disabled={!viewName.trim()}>{$t.receptions.saveView}</Button>
    <button type="button" class="text-sm text-muted-foreground hover:text-foreground" onclick={() => (showSaveDialog = false)}>{$t.newReception.buttons.cancel}</button>
  </form>
{/if}

<form method="GET" class="mb-6 space-y-4">
  <div class="flex max-w-xl gap-3">
    <Input name="search" value={data.filters.search} placeholder={$t.receptions.searchPlaceholder} />
    <Button type="submit" variant="outline">{$t.receptions.search}</Button>
    <Button type="button" variant="ghost" onclick={() => (filtersOpen = !filtersOpen)}>
      {$t.receptions.filters}
    </Button>
  </div>

  {#if filtersOpen || hasActiveFilters}
    <Card>
      <CardContent class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="grid gap-2">
          <Label for="dateFrom">{$t.receptions.dateFrom}</Label>
          <Input id="dateFrom" type="date" name="dateFrom" value={data.filters.dateFrom} />
        </div>
        <div class="grid gap-2">
          <Label for="dateTo">{$t.receptions.dateTo}</Label>
          <Input id="dateTo" type="date" name="dateTo" value={data.filters.dateTo} />
        </div>
        <div class="grid gap-2">
          <Label for="materialId">{$t.receptions.table.material}</Label>
          <Select id="materialId" name="materialId" value={data.filters.materialId}>
            <option value="">{$t.receptions.allMaterials}</option>
            {#each data.materials as material}
              <option value={material.id}>{material.name}</option>
            {/each}
          </Select>
        </div>
        <div class="grid gap-2">
          <Label for="category">{$t.receptions.table.category}</Label>
          <Select id="category" name="category" value={data.filters.category}>
            <option value="">{$t.receptions.allCategories}</option>
            {#each data.categories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </Select>
        </div>
        <div class="grid gap-2">
          <Label for="supplier">{$t.receptions.supplierFilter}</Label>
          <Input id="supplier" name="supplier" value={data.filters.supplier} placeholder={$t.receptions.table.supplier} />
        </div>
        <div class="grid gap-2">
          <Label for="storageCondition">{$t.receptions.storageCondition}</Label>
          <Select id="storageCondition" name="storageCondition" value={data.filters.storageCondition}>
            <option value="">{$t.receptions.allConditions}</option>
            {#each data.storageConditions as sc}
              <option value={sc}>{sc}</option>
            {/each}
          </Select>
        </div>
        <div class="grid gap-2">
          <Label for="expirationStatus">{$t.receptions.table.expiry}</Label>
          <Select id="expirationStatus" name="expirationStatus" value={data.filters.expirationStatus ?? ''}>
            <option value="">{$t.receptions.all}</option>
            <option value="expired">{$t.receptions.expired}</option>
            <option value="near_expiry">{$t.receptions.nearExpiry}</option>
            <option value="ok">{$t.receptions.ok}</option>
            <option value="missing">{$t.receptions.missingExpiration}</option>
          </Select>
        </div>
        <div class="flex items-end gap-2">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" name="withObservationsOnly" value="true" checked={data.filters.withObservationsOnly} class="h-4 w-4" />
            {$t.receptions.withObservations}
          </label>
        </div>
      </CardContent>
      <div class="flex justify-end gap-2 border-t px-4 py-3">
        <Button type="submit" variant="default">{$t.receptions.applyFilters}</Button>
        <a href="/receptions" class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{$t.receptions.resetFilters}</a>
      </div>
    </Card>
  {/if}
</form>

{#if data.loadError}
  <Alert variant="destructive" class="mb-6">{data.loadError}</Alert>
{/if}

<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
  <a href={data.filters.expirationStatus === 'expired' ? '/receptions' : '/receptions?expirationStatus=expired'} class="block">
    <Card class="cursor-pointer transition-colors hover:bg-muted/50 {data.filters.expirationStatus === 'expired' ? 'ring-2 ring-destructive' : ''}">
      <CardHeader class="p-4">
        <CardTitle class="text-sm font-medium text-muted-foreground">{$t.receptions.expired}</CardTitle>
      </CardHeader>
      <CardContent class="px-4 pb-4 pt-0">
        <p class="text-2xl font-bold">{expirationCounts.expired}</p>
      </CardContent>
    </Card>
  </a>
  <a href={data.filters.expirationStatus === 'near_expiry' ? '/receptions' : '/receptions?expirationStatus=near_expiry'} class="block">
    <Card class="cursor-pointer transition-colors hover:bg-muted/50 {data.filters.expirationStatus === 'near_expiry' ? 'ring-2 ring-warning' : ''}">
      <CardHeader class="p-4">
        <CardTitle class="text-sm font-medium text-muted-foreground">{$t.receptions.nearExpiry}</CardTitle>
      </CardHeader>
      <CardContent class="px-4 pb-4 pt-0">
        <p class="text-2xl font-bold">{expirationCounts.near_expiry}</p>
      </CardContent>
    </Card>
  </a>
  <a href={data.filters.expirationStatus === 'missing' ? '/receptions' : '/receptions?expirationStatus=missing'} class="block">
    <Card class="cursor-pointer transition-colors hover:bg-muted/50 {data.filters.expirationStatus === 'missing' ? 'ring-2 ring-muted-foreground' : ''}">
      <CardHeader class="p-4">
        <CardTitle class="text-sm font-medium text-muted-foreground">{$t.receptions.missingExpiration}</CardTitle>
      </CardHeader>
      <CardContent class="px-4 pb-4 pt-0">
        <p class="text-2xl font-bold">{expirationCounts.missing}</p>
      </CardContent>
    </Card>
  </a>
</div>

<Table class="min-w-[1400px] table-fixed">
  <colgroup>
    <col class="w-32" />
    <col class="w-48" />
    <col class="w-44" />
    <col class="w-32" />
    <col class="w-28" />
    <col class="w-32" />
    <col class="w-24" />
    <col class="w-28" />
    <col class="w-52" />
    <col class="w-36" />
    <col class="w-28" />
  </colgroup>
  <TableHeader>
    <TableRow>
      <TableHead>{$t.receptions.table.date}</TableHead>
      <TableHead>{$t.receptions.table.material}</TableHead>
      <TableHead>{$t.receptions.table.supplier}</TableHead>
      <TableHead>{$t.receptions.table.lot}</TableHead>
      <TableHead>{$t.receptions.table.expiry}</TableHead>
      <TableHead>{$t.receptions.table.quantity}</TableHead>
      <TableHead>{$t.receptions.table.temp}</TableHead>
      <TableHead>{$t.receptions.table.status}</TableHead>
      <TableHead>{$t.receptions.table.observations}</TableHead>
      <TableHead>{$t.receptions.table.createdBy}</TableHead>
      <TableHead class="text-right">{$t.common.actions}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each data.receptions as item (item.id)}
      {@const observations = observationText(item.observations)}
      {@const observationIsExpanded = expandedObservationId === item.id}
      <TableRow>
        <TableCell>{item.received_on}</TableCell>
        <TableCell class="font-medium">{item.material?.name ?? '—'}</TableCell>
        <TableCell>{item.supplier}</TableCell>
        <TableCell>{item.lot_code}</TableCell>
        <TableCell>
          <div class="flex flex-col gap-1">
            <span>{item.expiry_date ?? '—'}</span>
            <Badge variant={expirationBadgeVariant(item.expirationStatus)} class="w-fit text-[10px]">
              {expirationLabel(item.expirationStatus)}
            </Badge>
          </div>
        </TableCell>
        <TableCell>{item.quantity} {item.unit}</TableCell>
        <TableCell>{item.temperature_c == null ? '—' : `${item.temperature_c} °C`}</TableCell>
        <TableCell><Badge variant={statusVariant(item.status)}>{translateStatus(item.status)}</Badge></TableCell>
        <TableCell class="text-sm text-muted-foreground">
          {#if observations}
            <div class="space-y-2">
              <p
                class="break-words leading-relaxed"
                style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
              >
                {observationPreview(observations)}
              </p>
              {#if isObservationLong(observations)}
                <button
                  type="button"
                  class="text-xs font-medium text-primary underline-offset-4 hover:underline"
                  aria-expanded={observationIsExpanded}
                  aria-controls={`observation-${item.id}`}
                  onclick={() => toggleObservation(item.id)}
                >
                  {observationIsExpanded ? $t.receptions.hide : $t.receptions.details}
                </button>
              {/if}
            </div>
          {:else}
            —
          {/if}
        </TableCell>
        <TableCell>{item.created_by_name}</TableCell>
        <TableCell class="text-right">
          <div class="flex justify-end gap-1">
            <Button size="sm" variant="ghost" href="/receptions/{item.id}/edit">{$t.common.edit}</Button>
            <form method="POST" action="?/deleteReception" use:enhance onsubmit={(e) => { if (!confirm($t.common.confirmDeleteReception)) e.preventDefault(); }}>
              <input type="hidden" name="id" value={item.id} />
              <Button size="sm" variant="ghost" class="text-destructive hover:bg-destructive/10" type="submit">{$t.common.delete}</Button>
            </form>
          </div>
        </TableCell>
      </TableRow>
      {#if observationIsExpanded && observations}
        <TableRow>
          <TableCell colspan={11} class="bg-muted/30 p-4">
            <div id={`observation-${item.id}`} class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{$t.receptions.observationDetails}</p>
              <p class="whitespace-pre-wrap break-words text-sm leading-relaxed">{observations}</p>
            </div>
          </TableCell>
        </TableRow>
      {/if}
    {:else}
      <TableRow><TableCell colspan={11} class="text-muted-foreground">{$t.receptions.empty}</TableCell></TableRow>
    {/each}
  </TableBody>
</Table>
