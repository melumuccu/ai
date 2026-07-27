<script>
  export let name = "legacy";
</script>

<button on:click={() => {}}>click</button>

<ul>
  {#each items as item}
    <li>{item}</li>
  {/each}
</ul>
