<script>
	import Tabs from "./tabs.svelte";
    import DroneDetails from "./drone-details.svelte";
    import { droneStats } from '$lib/stores/ros';

    // console.log("Drone verileri:", $droneStats);
    let droneTabs = []
    $: droneTabs = $droneStats
        .map((drone, i) => {
            console.log(drone)
            if (!drone.status.state.connected) return null;
            console.log(`Drone ${i + 1} durumu:`, drone.status);
            return {
                isVisible: true,
                label: `Drone ${i + 1}`,
                value: i,
                component: DroneDetails,
                props: {
                    drone: {
                        name: `🚁 Drone ${i + 1}`,
                        battery: (drone.status.battery*100).toFixed(2),
                        signal: "OK",
                        location: `${drone.status.position.global.latitude ?? "-"}, ${drone.status.position.global.longitude ?? "-"}`,
                        altitude: drone.status.position.local.z.toFixed(2),
                        speed: drone.status.velocity.speed,
                    }
                }
            };
        })
        .filter(Boolean); // Bağlantısı olmayan dronları filtrele
</script>
<div class="drone-controls-panel">
    <h2>Drone Detayları</h2>
    <Tabs items={droneTabs} />
</div>