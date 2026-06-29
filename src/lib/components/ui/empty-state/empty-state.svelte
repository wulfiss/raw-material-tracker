<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  let {
    title,
    description,
    class: className = '',
    children
  }: HTMLAttributes<HTMLDivElement> & {
    title?: string;
    description?: string;
    class?: string;
    children?: Snippet;
  } = $props();

  const classes = $derived(cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className));
</script>

<div class={classes}>
  {@render children?.()}
  {#if title || description}
    <div class="space-y-1">
      {#if title}
        <h3 class="text-lg font-semibold">{title}</h3>
      {/if}
      {#if description}
        <p class="text-sm text-muted-foreground max-w-xs">{description}</p>
      {/if}
    </div>
  {/if}
</div>
