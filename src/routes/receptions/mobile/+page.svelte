<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { StatCard } from '$lib/components/ui/stat-card';
  import { EmptyState } from '$lib/components/ui/empty-state';
  import { ArrowLeft, ClipboardList, AlertTriangle, XCircle, CheckCircle2, PackagePlus } from '@lucide/svelte';
  import { t } from '$lib/i18n';
  import { translateStatus } from '$lib/i18n/helpers';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const expirationCounts = $derived.by(() => {
    const counts = { expired: 0, near_expiry: 0, missing: 0 };
    for (const r of data.recentReceptions) {
      if (r.expirationStatus === 'expired') counts.expired++;
      else if (r.expirationStatus === 'near_expiry') counts.near_expiry++;
      else if (r.expirationStatus === 'missing') counts.missing++;
    }
    return counts;
  });

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

  function statusVariant(status: string) {
    if (status === 'accepted') return 'success';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center gap-3">
    <Button href="/receptions" variant="ghost" size="sm" class="gap-1.5">
      <ArrowLeft class="size-4" />
      {$t.nav.back}
    </Button>
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.receptions.subtitle}</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{$t.nav.newReception}</h1>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <StatCard title={$t.receptions.title} value={data.recentReceptions.length}>
      <ClipboardList class="mt-1 size-5 text-muted-foreground" />
    </StatCard>
    <StatCard 
      title={$t.receptions.expired} 
      value={expirationCounts.expired} 
      variant={expirationCounts.expired > 0 ? 'danger' : 'default'}
    >
      {#if expirationCounts.expired > 0}<XCircle class="mt-1 size-5 text-destructive" />{:else}<CheckCircle2 class="mt-1 size-5 text-muted-foreground" />{/if}
    </StatCard>
    <StatCard 
      title={$t.receptions.nearExpiry} 
      value={expirationCounts.near_expiry} 
      variant={expirationCounts.near_expiry > 0 ? 'warning' : 'default'}
    >
      {#if expirationCounts.near_expiry > 0}<AlertTriangle class="mt-1 size-5 text-yellow-600" />{:else}<CheckCircle2 class="mt-1 size-5 text-muted-foreground" />{/if}
    </StatCard>
    <a href="/receptions/mobile/new">
      <Button class="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
        <PackagePlus class="size-4" />
        {$t.receptions.newReception}
      </Button>
    </a>
  </div>

  <!-- Quick Observations -->
  <Card>
    <CardHeader>
      <CardTitle>{$t.mobileReception.quickObservations}</CardTitle>
    </CardHeader>
    <CardContent class="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <a href="/receptions/mobile/new?obs=none" class="flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50">
        <CheckCircle2 class="size-6 text-primary" />
        <span class="text-xs font-medium">{$t.mobileReception.obsNone}</span>
      </a>
      <a href="/receptions/mobile/new?obs=packaging" class="flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50">
        <XCircle class="size-6 text-yellow-600" />
        <span class="text-xs font-medium">{$t.mobileReception.obsPackaging}</span>
      </a>
      <a href="/receptions/mobile/new?obs=temperature" class="flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50">
        <AlertTriangle class="size-6 text-orange-600" />
        <span class="text-xs font-medium">{$t.mobileReception.obsTemperature}</span>
      </a>
      <a href="/receptions/mobile/new?obs=label" class="flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50">
        <XCircle class="size-6 text-destructive" />
        <span class="text-xs font-medium">{$t.mobileReception.obsLabel}</span>
      </a>
      <a href="/receptions/mobile/new?obs=missing_doc" class="flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50">
        <XCircle class="size-6 text-destructive" />
        <span class="text-xs font-medium">{$t.mobileReception.obsMissingDoc}</span>
      </a>
    </CardContent>
  </Card>

  <!-- Recent Receptions -->
  <div class="rounded-xl border bg-card">
    <div class="border-b px-6 py-4">
      <h2 class="text-lg font-semibold">{$t.mobileReception.recentReceptions}</h2>
      <p class="text-sm text-muted-foreground">{$t.mobileReception.truncatedNotice}</p>
    </div>
    {#if data.recentReceptions.length > 0}
      <div class="divide-y">
        {#each data.recentReceptions as item (item.id)}
          <a href="/receptions/{item.id}/edit" class="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
            <div class="space-y-1">
              <p class="font-medium">{item.material?.name ?? '—'}</p>
              <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{item.received_on}</span>
                <span>·</span>
                <span>{item.supplier}</span>
                <span>·</span>
                <span>{item.quantity} {item.unit}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Badge variant={expirationBadgeVariant(item.expirationStatus)} class="text-[10px]">
                {expirationLabel(item.expirationStatus)}
              </Badge>
              <Badge variant={statusVariant(item.status)}>{translateStatus(item.status)}</Badge>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <EmptyState title={$t.receptions.empty}>
        <ClipboardList class="size-10 text-muted-foreground/50" />
      </EmptyState>
    {/if}
  </div>
</div>
