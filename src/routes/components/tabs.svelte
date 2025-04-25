<script>
    export let items = [];
    export let activeTabValue = 1;

    const handleClick = tabValue => () => (activeTabValue = tabValue);
</script>
<div class="panel-tabs">
    {#each items as item}
        <button on:click={handleClick(item.value)} class={activeTabValue === item.value ? 'tab active' : 'tab'}>
            {item.label}
        </button>
    {/each}
</div>
<div class="panel-content">
    {#each items as item}
        {#if activeTabValue == item.value}
            <svelte:component this={item.component}/>
        {/if}
    {/each}
</div>