<script>
	import Tabs from "./tabs.svelte";
    import DroneDetails from "./drone-details.svelte";
    import { discoveredDrones } from '$lib/states/drone-states.svelte.js';

    let droneTabs = $derived(
        discoveredDrones.map((drone, i) => {
                return {
                    isVisible: true,
                    label: `Drone ${i + 1}`,
                    value: i,
                    component: DroneDetails,
                    props: {
                        drone: {
                            name: `🚁 Drone ${i + 1}`,
                            battery: drone.status.battery,
                            location: `${drone.status.position.latitude ?? "-"}, ${drone.status.position.longitude ?? "-"}`,
                            altitude: drone.status.position.altitude,
                        }
                    }
                };
            }).filter(Boolean) // Bağlantısı olmayan dronları filtrele
    );
</script>
<div class="drone-controls-panel">
    <h2>Drone Detayları</h2>
    <Tabs items={droneTabs} />
</div>