<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Alert } from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent } from '$lib/components/ui/card';
  import ReceptionFormFields from '$lib/components/receptions/ReceptionFormFields.svelte';
  import { t } from '$lib/i18n';
  import { translateStatus } from '$lib/i18n/helpers';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  let materials = $derived(data.materials);

  function statusVariant(status: string) {
    if (status === 'accepted') return 'success';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  }
</script>

<div class="mx-auto max-w-lg px-4 pb-32 pt-6">
  <div class="mb-6">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.newReception.subtitle}</p>
    <h1 class="mt-1 text-2xl font-bold tracking-tight">{$t.newReception.title}</h1>
  </div>

  {#if data.loadError}
    <Alert variant="destructive" class="mb-4">{data.loadError}</Alert>
  {/if}
  {#if form?.message}
    <Alert variant="destructive" class="mb-4">{form.message}</Alert>
  {/if}
  {#if data.materials.length === 0}
    <Alert variant="warning" class="mb-4">{$t.newReception.messages.noMaterials}</Alert>
  {/if}

  {#if data.recentReceptions.length > 0}
    <section class="mb-6">
      <h2 class="mb-2 text-sm font-semibold text-muted-foreground">{$t.mobileReception.recentReceptions}</h2>
      <div class="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {#each data.recentReceptions as r (r.id)}
          <Card class="w-56 shrink-0 snap-start">
            <CardContent class="p-3">
              <p class="truncate text-sm font-medium">{r.material?.name ?? '—'}</p>
              <p class="text-xs text-muted-foreground">{r.received_on}</p>
              <div class="mt-1.5 flex items-center gap-2">
                <span class="truncate text-xs text-muted-foreground">{r.supplier}</span>
                <Badge variant={statusVariant(r.status)} class="text-[10px]">{translateStatus(r.status)}</Badge>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    </section>
  {/if}

  <form method="POST" class="space-y-4">
    <ReceptionFormFields
      {materials}
      {form}
      mode="mobile"
      defaults={{ received_on: data.today, status: 'accepted', unit: 'kg' }}
    />

    <div class="sticky bottom-0 -mx-4 mt-8 border-t bg-background px-4 py-3">
      <div class="flex gap-3">
        <Button href="/receptions" variant="outline" class="flex-1">{$t.newReception.buttons.cancel}</Button>
        <Button type="submit" class="flex-1" disabled={data.materials.length === 0}>{$t.newReception.buttons.save}</Button>
      </div>
    </div>
  </form>
</div>
