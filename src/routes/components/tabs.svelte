<script>
    export let items = [];
    export let activeTabValue = 1;

    const handleClick = tabValue => () => (activeTabValue = tabValue);
</script>
<div class="panel-tabs">
    {#each items as item}
        {#if item.isVisible}
            <button on:click={handleClick(item.value)} class={activeTabValue === item.value ? 'tab active' : 'tab'}>
                {item.label}
            </button>
        {/if}
    {/each}
</div>
<div class="panel-content">
    {#each items as item}
        {#if activeTabValue == item.value && item.isVisible}
            <svelte:component this={item.component} {...item.props}/>
        {/if}
    {/each}
</div>
<style>
    .tab {
        background-color: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-color);
        border-radius: 3px;
        padding: 3px;
        text-transform: uppercase;
        font-weight: bold;
        letter-spacing: 1px;
        transition: all 0.2s;
    }

    .tab.active {
        background-color: var(--text-color);
        color: var(--bg-primary);
    }
</style>