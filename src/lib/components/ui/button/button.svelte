<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  type Size = 'default' | 'sm' | 'lg';

  type Props = (HTMLButtonAttributes & HTMLAnchorAttributes) & {
    variant?: Variant;
    size?: Size;
    href?: string;
    class?: string;
    children?: Snippet;
  };

  let {
    children,
    class: className,
    variant = 'default',
    size = 'default',
    href,
    type = 'button',
    ...rest
  }: Props = $props();

  const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variants: Record<Variant, string> = {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90'
  };
  const sizes: Record<Size, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-8'
  };
</script>

{#if href}
  <a href={href} class={cn(base, variants[variant], sizes[size], className)} {...rest}>
    {@render children?.()}
  </a>
{:else}
  <button class={cn(base, variants[variant], sizes[size], className)} {type} {...rest}>
    {@render children?.()}
  </button>
{/if}
