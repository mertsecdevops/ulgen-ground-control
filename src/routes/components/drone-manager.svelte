<script>
	import Tabs from "./tabs.svelte";
    import DroneDetails from "./drone-details.svelte";
    import { discoveredDrones } from '$lib/states/drone-states.svelte.js';
    import { mapStore } from '$lib/states/map-states.svelte.js';

    // Harita üzerinde dronun kamerasını uçurmak için fonksiyon
    const flyCamera = (latitude, longitude) => () => {
        mapStore.map.flyTo({
                center: [longitude, latitude],
                zoom: 20, // Uçuş sonrası yakınlaştırma seviyesi
                speed: 1.2, // Uçuş hızı
                curve: 1.5, // Uçuş eğriliği
                essential: true // Uçuş animasyonunu zorla
        })
    };

    let droneTabs = $derived(
        discoveredDrones.map((drone, i) => {
                return {
                    htmlId: `drone-${drone.id}`,
                    isVisible: true,
                    label: `Drone ${i + 1}`,
                    classes: "drone-tab",
                    value: i,
                    clickEvent: flyCamera(drone.status.position.latitude, drone.status.position.longitude),
                    component: DroneDetails,
                    props: {
                        drone: {
                            id: drone.id,
                            name: `🚁 Drone ${i + 1}`,
                            mission: drone.status.mission,
                            ping: Date.now() - (drone.timestamp*1000), // Gecikme hesaplama,
                            location: `${drone.status.position.latitude ?? "-"}, ${drone.status.position.longitude ?? "-"}`,
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