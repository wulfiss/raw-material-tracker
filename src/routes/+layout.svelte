<script lang="ts">
  import '../styles.css';
  import { Button } from '$lib/components/ui/button';
  import { LogOut, Package, ClipboardList, Beaker, Home } from '@lucide/svelte';
  import { t } from '$lib/i18n';
  import { page } from '$app/stores';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();

  function isCurrent(path: string) {
    const pathname = $page.url.pathname;
    return pathname === path || (path !== '/' && pathname.startsWith(path + '/'));
  }
</script>

<svelte:head><title>{$t.nav.appTitle}</title></svelte:head>

<div class="min-h-screen bg-background">
  <header class="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
    <div class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <a class="flex items-center gap-2 text-lg font-bold tracking-tight" href="/">
          <Package class="size-5 text-primary" />
          {$t.nav.appTitle}
        </a>
        {#if data.user}
          <div class="hidden sm:flex items-center gap-1.5 rounded-full border bg-muted/60 px-2.5 py-0.5">
            <span class="size-1.5 rounded-full bg-primary animate-pulse"></span>
            <p class="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {data.dataMode} · {data.user.name}
            </p>
          </div>
        {/if}
      </div>
      {#if data.user}
        <nav class="flex flex-wrap items-center gap-1" aria-label="Main navigation">
          <Button href="/" variant={isCurrent('/') ? 'secondary' : 'ghost'} size="sm" class="gap-2">
            <Home class="size-4" />
            {$t.nav.dashboard}
          </Button>
          <Button href="/receptions" variant={isCurrent('/receptions') ? 'secondary' : 'ghost'} size="sm" class="gap-2">
            <ClipboardList class="size-4" />
            {$t.nav.receptions}
          </Button>
          <Button href="/receptions/new" variant="outline" size="sm" class="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            + {$t.nav.newReception}
          </Button>
          <div class="mx-1 h-4 w-px bg-border"></div>
          <Button href="/materials" variant={isCurrent('/materials') ? 'secondary' : 'ghost'} size="sm" class="gap-2">
            <Package class="size-4" />
            {$t.nav.materials}
          </Button>
          <Button href="/recipes" variant={isCurrent('/recipes') ? 'secondary' : 'ghost'} size="sm" class="gap-2">
            <Beaker class="size-4" />
            {$t.nav.recipes}
          </Button>
          <form method="POST" action="/logout">
            <Button type="submit" variant="ghost" size="sm" class="gap-1 text-muted-foreground hover:text-foreground">
              <LogOut class="size-4" />
              {$t.nav.logout}
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
