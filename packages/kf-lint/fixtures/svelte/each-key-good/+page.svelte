<script lang="ts">
  type Item = { id: string; label: string };

  let { data }: { data: { items: Item[]; user: { name: string } } } = $props();
</script>

<p>{data.user.name}</p>

<ul>
  {#each data.items as item (item.id)}
    <li>{item.label}</li>
  {/each}
</ul>
