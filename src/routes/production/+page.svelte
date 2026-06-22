<script>
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  /** @type {import('./$types').PageData} */
  export let data;

  const batches = data.batches;

  function statusLabel(status) {
    switch (status) {
      case 'planned': return 'Planned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  function statusColor(status) {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return '';
    }
  };
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">Production Batches</h1>
    <a href="/production/new">
      <Button>+ New Batch</Button>
    </a>
  </div>

  {#if batches.length === 0}
    <Card>
      <CardContent class="py-8 text-center text-muted-foreground">
        No production batches yet. Create one to get started.
      </CardContent>
    </Card>
  {:else}
    <div class="space-y-4">
      {#each batches as batch}
        <a href="/production/{batch.id}">
          <Card class="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader class="pb-3">
              <div class="flex items-center justify-between">
                <div>
                  <CardTitle class="text-lg">{batch.batch_number}</CardTitle>
                  <p class="text-sm text-muted-foreground mt-1">
                    {batch.recipe?.name ?? 'Unknown Recipe'}
                  </p>
                </div>
                <Badge class="{statusColor(batch.status)}">{statusLabel(batch.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div class="flex gap-6 text-sm">
                <span>Planned yield: <strong>{batch.planned_yield} {batch.yield_unit}</strong></span>
                {#if batch.actual_yield !== null}
                  <span>Actual yield: <strong>{batch.actual_yield} {batch.yield_unit}</strong></span>
                {/if}
                <span class="text-muted-foreground">Created: {new Date(batch.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </a>
      {/each}
    </div>
  {/if}
</div>