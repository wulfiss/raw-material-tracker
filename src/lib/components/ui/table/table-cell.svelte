<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLTdAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let { children, class: className, ...rest }: HTMLTdAttributes & { children?: Snippet } = $props();
</script>

<td class={cn('p-4 align-middle', className)} {...rest}>{@render children?.()}</td>
