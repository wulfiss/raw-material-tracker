<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.materials.subtitle}</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.materials.title}</h1>
  </div>
  <Button href="/materials/new">{$t.materials.addMaterial}</Button>
</div>

{#if data.loadError}
  <Alert variant="destructive" class="mb-6">{data.loadError}</Alert>
{/if}

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>{$t.materials.table.name}</TableHead>
      <TableHead>{$t.materials.table.category}</TableHead>
      <TableHead>{$t.materials.table.unit}</TableHead>
      <TableHead>{$t.materials.table.status}</TableHead>
      <TableHead>{$t.materials.table.createdBy}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each data.materials as material (material.id)}
      <TableRow>
        <TableCell class="font-medium">{material.name}</TableCell>
        <TableCell>{material.category}</TableCell>
        <TableCell>{material.default_unit}</TableCell>
        <TableCell>
          <Badge variant={material.active ? 'success' : 'secondary'}>{material.active ? $t.materials.table.active : $t.materials.table.inactive}</Badge>
        </TableCell>
        <TableCell>{material.created_by_name}</TableCell>
      </TableRow>
    {:else}
      <TableRow><TableCell colspan={5} class="text-muted-foreground">{$t.materials.empty}</TableCell></TableRow>
    {/each}
  </TableBody>
</Table>
