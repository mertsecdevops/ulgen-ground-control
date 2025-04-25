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
        const promises = [];
        // Bir dizi promise
        for (const path in monitoringTabs) {
            promises.push(
                monitoringTabs[path]().then((tab) => {
                    const Component = tab.default;
                    const fileName = path.split('/').pop().replace('.svelte', '');
                    // Sekme adı
                    const displayName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
                    return { 
                        label: displayName,
                        value: Object.keys(monitoringTabs).indexOf(path) + 1,
                        component: Component,
                        path
                    };
                })
            );
        }
        // Tüm sekmelerin yüklenmesini bekle
        tabPages = await Promise.all(promises);
        loading = false;
    });
</script>

<div class="app">
	<main class="ground-control-panel">
		<section id="mission-planner" class="left-side">
			<MissionPlanner/>
		</section>
		<section id="monitoring-panel" class="middle-content">
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