<script lang="ts">
  import { ClipboardList, Database, Beaker, AlertTriangle, CheckCircle2, XCircle, PackagePlus, Plus } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import { StatCard } from '$lib/components/ui/stat-card';
  import { EmptyState } from '$lib/components/ui/empty-state';
  import { Badge } from '$lib/components/ui/badge';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { t } from '$lib/i18n';
  import { translateStatus } from '$lib/i18n/helpers';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const stats = $derived(data.stats);
  const recentReceptions = $derived(data.recentReceptions);

  function statusVariant(status: string) {
    if (status === 'accepted') return 'success';
    if (status === 'rejected') return 'destructive';
    return 'secondary';
  }

  // Stats that need attention
  const needsAttention = $derived(stats.expiredReceptions + stats.nearExpiryReceptions);
</script>

<div class="space-y-8">
  <!-- Header -->
  <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">{$t.home.subtitle}</p>
      <h1 class="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{$t.nav.dashboard}</h1>
      <p class="mt-2 text-muted-foreground">{$t.home.description}</p>
    </div>
    <div class="flex gap-2">
      <Button href="/receptions/new" class="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
        <Plus class="size-4" />
        {$t.nav.newReception}
      </Button>
      <Button href="/materials/new" variant="outline" size="sm" class="gap-1.5">
        <PackagePlus class="size-4" />
        {$t.materials.addMaterial}
      </Button>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Total Materials -->
    <StatCard title={$t.materials.title} value="{stats.activeMaterials} / {stats.totalMaterials}" description="{$t.materials.table.active} · {$t.materials.table.inactive}: {stats.inactiveMaterials}">
      <Database class="mt-1 size-5 text-muted-foreground" />
    </StatCard>

    <!-- Total Recipes -->
    <StatCard title={$t.recipes.title} value={stats.totalRecipes} description={$t.recipes.subtitle}>
      <Beaker class="mt-1 size-5 text-muted-foreground" />
    </StatCard>

    <!-- Total Receptions -->
    <StatCard 
      title={$t.receptions.title} 
      value={stats.totalReceptions} 
      description="{$t.receptions.table.status}: {stats.acceptedReceptions} {$t.common.yes} · {stats.rejectedReceptions} {$t.common.no}"
    >
      <ClipboardList class="mt-1 size-5 text-muted-foreground" />
    </StatCard>

    <!-- Alerts -->
    <StatCard 
      title={$t.receptions.expired} 
      value={needsAttention} 
      description="{$t.receptions.expired}: {stats.expiredReceptions} · {$t.receptions.nearExpiry}: {stats.nearExpiryReceptions}"
      variant={needsAttention > 0 ? 'danger' : 'default'}
    >
      <AlertTriangle class="mt-1 size-5 {needsAttention > 0 ? 'text-destructive' : 'text-muted-foreground'}" />
    </StatCard>
  </div>

  <!-- Quick Actions -->
  <div class="grid gap-3 sm:grid-cols-3">
    <a href="/receptions/new" class="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20">
        <Plus class="size-5" />
      </div>
      <div>
        <p class="font-medium">{$t.receptions.newReception}</p>
        <p class="text-xs text-muted-foreground">{$t.home.registerNewMaterial}</p>
      </div>
    </a>
    <a href="/materials/new" class="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20">
        <PackagePlus class="size-5" />
      </div>
      <div>
        <p class="font-medium">{$t.materials.addMaterial}</p>
        <p class="text-xs text-muted-foreground">{$t.home.addToMaterialCatalog}</p>
      </div>
    </a>
    <a href="/recipes/new" class="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20">
        <Beaker class="size-5" />
      </div>
      <div>
        <p class="font-medium">{$t.recipes.addRecipe}</p>
        <p class="text-xs text-muted-foreground">{$t.home.createNewRecipe}</p>
      </div>
    </a>
  </div>

  <!-- Recent Activity + Alerts -->
  <div class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
    <!-- Recent Receptions -->
    <div class="rounded-xl border bg-card">
      <div class="border-b px-6 py-4">
        <h2 class="text-lg font-semibold">{$t.receptions.title}</h2>
        <p class="text-sm text-muted-foreground">{$t.home.latestReceptions}</p>
      </div>
      <div class="p-0">
        {#if recentReceptions.length > 0}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{$t.receptions.table.date}</TableHead>
                <TableHead>{$t.receptions.table.material}</TableHead>
                <TableHead>{$t.receptions.table.status}</TableHead>
                <TableHead class="text-right">{$t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each recentReceptions as item (item.id)}
                <TableRow>
                  <TableCell class="whitespace-nowrap text-sm">{item.received_on}</TableCell>
                  <TableCell class="font-medium">{item.material?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(item.status)}>
                      {translateStatus(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button size="sm" variant="ghost" href="/receptions/{item.id}/edit" class="h-7 px-2 text-xs">
                      {$t.common.edit}
                    </Button>
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        {:else}
          <EmptyState title={$t.receptions.empty}>
            <ClipboardList class="size-10 text-muted-foreground/50" />
            <Button href="/receptions/new" variant="outline" size="sm">
              {$t.receptions.newReception}
            </Button>
          </EmptyState>
        {/if}
      </div>
    </div>

    <!-- Expiration Alerts -->
    <div class="rounded-xl border bg-card">
      <div class="border-b px-6 py-4">
        <h2 class="flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle class="size-4 text-destructive" />
          {$t.receptions.expired} / {$t.receptions.nearExpiry}
        </h2>
        <p class="text-sm text-muted-foreground">{$t.home.upcomingExpiries}</p>
      </div>
      <div class="space-y-3 p-6">
        {#if stats.expiredReceptions > 0}
          <a href="/receptions?expirationStatus=expired" class="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/[0.03] p-3 transition-colors hover:bg-destructive/[0.06]">
            <div class="flex items-center gap-2">
              <XCircle class="size-4 shrink-0 text-destructive" />
              <span class="text-sm font-medium">{$t.receptions.expired}</span>
            </div>
            <Badge variant="destructive">{stats.expiredReceptions}</Badge>
          </a>
        {/if}

        {#if stats.nearExpiryReceptions > 0}
          <a href="/receptions?expirationStatus=near_expiry" class="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-50 p-3 transition-colors hover:bg-yellow-50/80">
            <div class="flex items-center gap-2">
              <AlertTriangle class="size-4 shrink-0 text-yellow-600" />
              <span class="text-sm font-medium">{$t.receptions.nearExpiry}</span>
            </div>
            <Badge variant="secondary">{stats.nearExpiryReceptions}</Badge>
          </a>
        {/if}

        {#if needsAttention === 0}
          <EmptyState title={$t.receptions.ok}>
            <CheckCircle2 class="size-10 text-primary/50" />
            <p class="text-xs text-muted-foreground">{$t.home.noExpiryPending}</p>
          </EmptyState>
        {/if}

        <!-- Quick links -->
        <div class="pt-2 border-t space-y-1.5">
          <a href="/receptions?expirationStatus=missing" class="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>{$t.receptions.missingExpiration}</span>
            <Badge variant="outline">{stats.totalReceptions - (stats.expiredReceptions + stats.nearExpiryReceptions)}</Badge>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
