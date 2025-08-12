<script>
	import Tabs from "./tabs.svelte";
    import DroneDetails from "./drone-details.svelte";
    import { discoveredDrones } from '$lib/states/drone-states.svelte.js';
    import map from "../monitoring-tabs/maps.svelte";

    // Harita üzerinde dronun kamerasını uçurmak için fonksiyon
    const flyCamera = (latitude, longitude) => () => {
        $effect(
            map.flyTo({
                    center: [longitude, latitude],
                    zoom: 15, // Uçuş sonrası yakınlaştırma seviyesi
                    speed: 1.2, // Uçuş hızı
                    curve: 1.5, // Uçuş eğriliği
                    essential: true // Uçuş animasyonunu zorla
            })
        )
    };

    let droneTabs = $derived(
        discoveredDrones.map((drone, i) => {
                return {
                    isVisible: true,
                    label: `Drone ${i + 1}`,
                    classes: "drone-tab",
                    value: i,
                    clickEvent: flyCamera(drone.status.position.latitude, drone.status.position.longitude),
                    component: DroneDetails,
                    props: {
                        drone: {
                            name: `🚁 Drone ${i + 1}`,
                            battery: drone.status.battery,
                            location: `${drone.status.position.latitude ?? "-"}, ${drone.status.position.longitude ?? "-"}`,
                            altitude: drone.status.position.altitude,
                            ping: Date.now() - (drone.timestamp*1000), // Gecikme hesaplama,
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