<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  type Props = HTMLSelectAttributes & {
    children?: Snippet;
    class?: string;
    value?: string | string[];
  };

  let { children, class: className, value = $bindable(), ...rest }: Props = $props();
</script>

<select
  bind:value
  class={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)}
  {...rest}
>
  {@render children?.()}
</select>
