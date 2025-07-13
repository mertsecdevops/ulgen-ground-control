<script>
	import '../app.css';
	import DroneManager from './components/drone-manager.svelte';
	import MissionPlanner from './components/mission-planner.svelte';

	import Tabs from "./components/tabs.svelte";
	import { onMount } from 'svelte';
	
	const monitoringTabs = import.meta.glob('./monitoring-tabs/*.svelte');
	let tabPages = []
	let loading = true;
	
	onMount(async () => {
        const promises = Object.entries(monitoringTabs).map(([path, loadTab], index) => 
            loadTab().then((tab) => {
                const Component = tab.default;
                const fileName = path.split('/').pop().replace('.svelte', '');
                const displayName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
                return { 
					isVisible: tab.isVisible,
                    label: tab.name,
                    value: tab.priority,
                    component: Component,
                    path
                };
            })
        );
        tabPages = await Promise.all(promises);
        tabPages.sort((a, b) => a.value - b.value);
        loading = false;
    });
</script>

<div class="app">
	<slot/>
	<main class="ground-control-panel">
		<section id="mission-planner" class="left-side">
			<MissionPlanner/>
		</section>
		<section id="monitoring-panel" class="middle-content">
            <h2>Gözlem Panelleri</h2>
            {#if !loading}
				<Tabs items={tabPages} />
			{:else}
				<div class="loading">Loading tabs...</div>
			{/if}
		</section>
		<section id="drone-manager" class="right-side">
			<DroneManager/>
		</section>
	</main>
</div>