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
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.recipes.subtitle}</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight">{$t.recipes.title}</h1>
  </div>
  <Button href="/recipes/new">{$t.recipes.addRecipe}</Button>
</div>

{#if data.loadError}
  <Alert variant="destructive" class="mb-6">{data.loadError}</Alert>
{/if}

{#if form?.message}
  <Alert variant="destructive" class="mb-6">{form.message}</Alert>
{/if}

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>{$t.recipes.table.name}</TableHead>
      <TableHead>{$t.recipes.table.category}</TableHead>
      <TableHead>{$t.recipes.table.yieldQty}</TableHead>
      <TableHead>{$t.recipes.table.ingredientCount}</TableHead>
      <TableHead>{$t.recipes.table.status}</TableHead>
      <TableHead class="text-right">{$t.common.actions}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each data.recipes as recipe (recipe.id)}
      <TableRow>
        <TableCell class="font-medium">{recipe.name}</TableCell>
        <TableCell>{recipe.category ?? '-'}</TableCell>
        <TableCell>{recipe.yieldQuantity} {recipe.yieldUnit}</TableCell>
        <TableCell>{recipe.ingredientCount}</TableCell>
        <TableCell>
          <Badge variant={recipe.active ? 'success' : 'secondary'}>
            {recipe.active ? $t.recipes.table.active : $t.recipes.table.inactive}
          </Badge>
        </TableCell>
        <TableCell class="text-right">
          <div class="flex justify-end gap-2">
            <Button size="sm" variant="outline" href="/recipes/{recipe.id}/edit">{$t.common.edit}</Button>
            <form method="POST" action="?/toggle">
              <input type="hidden" name="id" value={recipe.id} />
              <Button type="submit" size="sm" variant={recipe.active ? 'destructive' : 'outline'}>
                {recipe.active ? $t.common.deactivate : $t.common.reactivate}
              </Button>
            </form>
          </div>
        </TableCell>
      </TableRow>
    {:else}
      <TableRow><TableCell colspan={6} class="text-muted-foreground">{$t.recipes.empty}</TableCell></TableRow>
    {/each}
  </TableBody>
</Table>
