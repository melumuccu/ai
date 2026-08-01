<script lang="ts">
  type Item = { id: string; label: string };

  let { items }: { items: Item[] } = $props();
</script>

<ul>
  {#each items as item}
    <li>{item.label}</li>
  {/each}
</ul>
