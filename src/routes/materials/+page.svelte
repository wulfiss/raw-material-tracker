<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">Catalogue</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight">Materials</h1>
  </div>
  <Button href="/materials/new">Add material</Button>
</div>

{#if data.loadError}
  <Alert variant="destructive" class="mb-6">{data.loadError}</Alert>
{/if}

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Category</TableHead>
      <TableHead>Unit</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Created by</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each data.materials as material (material.id)}
      <TableRow>
        <TableCell class="font-medium">{material.name}</TableCell>
        <TableCell>{material.category}</TableCell>
        <TableCell>{material.default_unit}</TableCell>
        <TableCell>
          <Badge variant={material.active ? 'success' : 'secondary'}>{material.active ? 'Active' : 'Inactive'}</Badge>
        </TableCell>
        <TableCell>{material.created_by_name}</TableCell>
      </TableRow>
    {:else}
      <TableRow><TableCell colspan={5} class="text-muted-foreground">No materials registered.</TableCell></TableRow>
    {/each}
  </TableBody>
</Table>
