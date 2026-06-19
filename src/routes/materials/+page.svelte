<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { t } from '$lib/i18n';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
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

{#if form?.deactivated}
  <Alert variant="warning" class="mb-6">{@html $t.materials.deactivatedInstead}</Alert>
{/if}

{#if form?.error}
  <Alert variant="destructive" class="mb-6">{form.error}</Alert>
{/if}

<Table>
<TableHeader>
  <TableRow>
    <TableHead>{$t.materials.table.name}</TableHead>
    <TableHead>{$t.materials.table.category}</TableHead>
    <TableHead>{$t.materials.table.unit}</TableHead>
    <TableHead>{$t.materials.table.storage}</TableHead>
    <TableHead>{$t.materials.table.expirationRequired}</TableHead>
    <TableHead>{$t.materials.table.status}</TableHead>
    <TableHead>{$t.materials.table.createdBy}</TableHead>
    <TableHead class="text-right">{$t.common.actions}</TableHead>
  </TableRow>
</TableHeader>
<TableBody>
  {#each data.materials as material (material.id)}
    <TableRow>
      <TableCell class="font-medium">{material.name}</TableCell>
      <TableCell>{material.category}</TableCell>
      <TableCell>{material.unit}</TableCell>
      <TableCell>{material.storageCondition}</TableCell>
      <TableCell>
        <Badge variant="outline" class="text-[10px]">
          {material.expirationRequired ? $t.common.yes : $t.common.no}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={material.active ? 'success' : 'secondary'}>
          {material.active ? $t.materials.table.active : $t.materials.table.inactive}
        </Badge>
      </TableCell>
      <TableCell>{material.created_by_name}</TableCell>
      <TableCell class="text-right">
        <div class="flex justify-end gap-2">
          <Button size="sm" variant="outline" href="/materials/{material.id}/edit">{$t.common.edit}</Button>
          <form method="POST" action="?/toggle">
            <input type="hidden" name="id" value={material.id} />
            <Button type="submit" size="sm" variant={material.active ? 'destructive' : 'outline'}>
              {material.active ? $t.common.deactivate : $t.common.reactivate}
            </Button>
          </form>
          <form method="POST" action="?/delete" onsubmit={(e) => {
            if (!confirm($t.common.confirmDeleteMaterial)) {
              e.preventDefault();
            }
          }}>
            <input type="hidden" name="id" value={material.id} />
            <Button 
              id="delete-{material.id}"
              type="submit" 
              size="sm" 
              variant="ghost"
              class="text-destructive hover:bg-destructive/10"
            >
              {$t.common.delete}
            </Button>
          </form>
        </div>
      </TableCell>
    </TableRow>
  {:else}
    <TableRow><TableCell colspan={8} class="text-muted-foreground">{$t.materials.empty}</TableCell></TableRow>
  {/each}
</TableBody>
</Table>
