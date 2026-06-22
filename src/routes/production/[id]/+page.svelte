<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  let batch = $derived(data.batch);

  function statusLabel(status: string) {
    switch (status) {
      case 'planned': return 'Planned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return '';
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <a href="/production">
        <Button variant="outline">Back</Button>
      </a>
      <div>
        <h1 class="text-2xl font-bold">{batch.batch_number}</h1>
        <p class="text-sm text-muted-foreground">Created {new Date(batch.created_at).toLocaleString()}</p>
      </div>
    </div>
    <Badge class={statusColor(batch.status)}>{statusLabel(batch.status)}</Badge>
  </div>

  <!-- Summary Cards -->
  <div class="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">Recipe</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-xl font-bold">{batch.recipe?.name ?? 'Unknown'}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">Planned Yield</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-xl font-bold">{batch.planned_yield} {batch.yield_unit}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">Actual Yield</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-xl font-bold">
          {#if batch.actual_yield !== null}
            {batch.actual_yield} {batch.yield_unit}
          {:else}
            <span class="text-muted-foreground">Not set</span>
          {/if}
        </p>
      </CardContent>
    </Card>
  </div>

  <!-- Ingredients & Lots Used -->
  <Card>
    <CardHeader>
      <CardTitle>Ingredients & Lots Used</CardTitle>
    </CardHeader>
    <CardContent>
      {#if batch.ingredients && batch.ingredients.length > 0}
        <div class="space-y-6">
          {#each batch.ingredients as ing}
            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-medium">{ing.material?.name ?? 'Material'}</h3>
                <Badge variant="outline">{ing.planned_quantity} {ing.unit}</Badge>
              </div>

              {#if ing.lots && ing.lots.length > 0}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reception</TableHead>
                      <TableHead>Lot Code</TableHead>
                      <TableHead class="text-right">Quantity Used</TableHead>
                      <TableHead>Expiry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {#each ing.lots as lot}
                      <TableRow>
                        <TableCell>
                          <a href="/receptions/{lot.reception_id}" class="text-primary hover:underline">
                            {lot.reception_id}
                          </a>
                        </TableCell>
                        <TableCell>{lot.reception?.lot_code ?? '-'}</TableCell>
                        <TableCell class="text-right">{lot.quantity_used} {ing.unit}</TableCell>
                        <TableCell>{lot.reception?.expiry_date ?? '-'}</TableCell>
                      </TableRow>
                    {/each}
                  </TableBody>
                </Table>
              {:else}
                <p class="text-sm text-muted-foreground">No lots assigned.</p>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-muted-foreground">No ingredients recorded for this batch.</p>
      {/if}
    </CardContent>
  </Card>

  <!-- Observations -->
  {#if batch.observations}
    <Card>
      <CardHeader>
        <CardTitle>Observations</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm whitespace-pre-wrap">{batch.observations}</p>
      </CardContent>
    </Card>
  {/if}
</div>