<script lang="ts">
  import '../styles.css';
  import { Button } from '$lib/components/ui/button';
  import { LogOut, Package, ClipboardList, Beaker, Home, Menu, X } from '@lucide/svelte';
  import { t } from '$lib/i18n';
  import { page } from '$app/stores';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();

  function isCurrent(path: string) {
    const pathname = $page.url.pathname;
    return pathname === path || (path !== '/' && pathname.startsWith(path + '/'));
  }

  let menuOpen = $state(false);

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }
</script>

<svelte:head><title>{$t.nav.appTitle}</title></svelte:head>

<div class="min-h-screen bg-background">
  <header class="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
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
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-md hover:bg-accent sm:hidden"
          aria-label="Toggle menu"
          onclick={toggleMenu}
        >
          {#if menuOpen}
            <X class="size-5" />
          {:else}
            <Menu class="size-5" />
          {/if}
        </button>
      {/if}
    </div>

    {#if data.user && menuOpen}
      <button
        type="button"
        class="fixed inset-0 z-[9] bg-black/20 sm:hidden"
        aria-label="Close menu"
        onclick={closeMenu}
        onkeydown={(e) => e.key === 'Escape' && closeMenu()}
      >
        <nav class="relative z-[10] border-b bg-card px-4 py-3 space-y-1" aria-label="Main navigation">
          <Button href="/" variant={isCurrent('/') ? 'secondary' : 'ghost'} size="sm" class="w-full justify-start gap-2" onclick={closeMenu}>
            <Home class="size-4" />
            {$t.nav.dashboard}
          </Button>
          <Button href="/receptions" variant={isCurrent('/receptions') ? 'secondary' : 'ghost'} size="sm" class="w-full justify-start gap-2" onclick={closeMenu}>
            <ClipboardList class="size-4" />
            {$t.nav.receptions}
          </Button>
          <Button href="/receptions/new" variant="outline" size="sm" class="w-full justify-start gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onclick={closeMenu}>
            + {$t.nav.newReception}
          </Button>
          <div class="my-2 h-px bg-border"></div>
          <Button href="/materials" variant={isCurrent('/materials') ? 'secondary' : 'ghost'} size="sm" class="w-full justify-start gap-2" onclick={closeMenu}>
            <Package class="size-4" />
            {$t.nav.materials}
          </Button>
          <Button href="/recipes" variant={isCurrent('/recipes') ? 'secondary' : 'ghost'} size="sm" class="w-full justify-start gap-2" onclick={closeMenu}>
            <Beaker class="size-4" />
            {$t.nav.recipes}
          </Button>
          <form method="POST" action="/logout">
            <Button type="submit" variant="ghost" size="sm" class="w-full justify-start gap-1 text-muted-foreground hover:text-foreground" onclick={closeMenu}>
              <LogOut class="size-4" />
              {$t.nav.logout}
            </Button>
          </form>
        </nav>
      </button>
    {/if}
  </header>

  <main class="mx-auto max-w-6xl px-4 py-10">
    {@render children()}
  </main>
</div>
