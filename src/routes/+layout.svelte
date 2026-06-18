<script lang="ts">
  import '../styles.css';
  import { Button } from '$lib/components/ui/button';
  import { LogOut } from '@lucide/svelte';
  import { t } from '$lib/i18n';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();
</script>

<svelte:head><title>{$t.nav.appTitle}</title></svelte:head>

<div class="min-h-screen bg-background">
  <header class="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
    <div class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <a class="text-lg font-bold tracking-tight" href="/">{$t.nav.appTitle}</a>
        {#if data.user}
          <p class="text-xs text-muted-foreground">
            {data.dataMode} · {data.user.name} · {data.user.role}
          </p>
        {/if}
      </div>
      {#if data.user}
        <nav class="flex flex-wrap items-center gap-2" aria-label="Main navigation">
          <Button href="/receipts" variant="ghost" size="sm">{$t.nav.receptions}</Button>
          <Button href="/receipts/new" variant="ghost" size="sm">{$t.nav.newReception}</Button>
          <Button href="/materials" variant="ghost" size="sm">{$t.nav.materials}</Button>
          <form method="POST" action="/logout">
            <Button type="submit" variant="outline" size="sm">
              <LogOut class="size-4" />
            </Button>
          </form>
        </nav>
      {/if}
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-4 py-10">
    {@render children()}
  </main>
</div>
