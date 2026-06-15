<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { t } from '$lib/i18n';
  import { translateStatus } from '$lib/i18n/helpers';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const observationPreviewLength = 8;
  let expandedObservationId = $state<string | null>(null);

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
</script>

<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.receipts.subtitle}</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.receipts.title}</h1>
  </div>
  <Button href="/receipts/new">{$t.receipts.newReception}</Button>
</div>

<form class="mb-6 flex max-w-xl gap-3" method="GET">
  <Input name="search" value={data.search} placeholder={$t.receipts.searchPlaceholder} />
  <Button type="submit" variant="outline">{$t.receipts.search}</Button>
</form>

{#if data.loadError}
  <Alert variant="destructive" class="mb-6">{data.loadError}</Alert>
{/if}

<Table class="min-w-[1400px] table-fixed">
  <colgroup>
    <col class="w-32" />
    <col class="w-48" />
    <col class="w-48" />
    <col class="w-36" />
    <col class="w-32" />
    <col class="w-36" />
    <col class="w-28" />
    <col class="w-32" />
    <col class="w-56" />
    <col class="w-40" />
  </colgroup>
  <TableHeader>
    <TableRow>
      <TableHead>{$t.receipts.table.date}</TableHead>
      <TableHead>{$t.receipts.table.material}</TableHead>
      <TableHead>{$t.receipts.table.supplier}</TableHead>
      <TableHead>{$t.receipts.table.lot}</TableHead>
      <TableHead>{$t.receipts.table.expiry}</TableHead>
      <TableHead>{$t.receipts.table.quantity}</TableHead>
      <TableHead>{$t.receipts.table.temp}</TableHead>
      <TableHead>{$t.receipts.table.status}</TableHead>
      <TableHead>{$t.receipts.table.observations}</TableHead>
      <TableHead>{$t.receipts.table.createdBy}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each data.receipts as item (item.id)}
      {@const observations = observationText(item.observations)}
      {@const observationIsExpanded = expandedObservationId === item.id}
      <TableRow>
        <TableCell>{item.received_on}</TableCell>
        <TableCell class="font-medium">{item.material?.name ?? '—'}</TableCell>
        <TableCell>{item.supplier}</TableCell>
        <TableCell>{item.lot_code}</TableCell>
        <TableCell>{item.expiry_date ?? '—'}</TableCell>
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
                  {observationIsExpanded ? $t.receipts.hide : $t.receipts.details}
                </button>
              {/if}
            </div>
          {:else}
            —
          {/if}
        </TableCell>
        <TableCell>{item.created_by_name}</TableCell>
      </TableRow>
      {#if observationIsExpanded && observations}
        <TableRow>
          <TableCell colspan={10} class="bg-muted/30 p-4">
            <div id={`observation-${item.id}`} class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{$t.receipts.observationDetails}</p>
              <p class="whitespace-pre-wrap break-words text-sm leading-relaxed">{observations}</p>
            </div>
          </TableCell>
        </TableRow>
      {/if}
    {:else}
      <TableRow><TableCell colspan={10} class="text-muted-foreground">{$t.receipts.empty}</TableCell></TableRow>
    {/each}
  </TableBody>
</Table>
