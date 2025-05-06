<script>
	import Tabs from "./tabs.svelte";
    import DroneDetails from "./drone-details.svelte";
    // Asıl projede dinamik olarak veriler güncellenecek.
    let droneTabs = [
        {
            isVisible: true,
            label: "Drone 1",
            value: 1,
            component: DroneDetails,
            props: {
                drone: {
                    name: "🚁 Drone 1",
                    battery: 85,
                    signal: "Güçlü",
                    location: "42.5° N, 73.2° W",
                    altitude: 120,
                    speed: 15,
                },
            },
        },
        {
            isVisible: true,
            label: "Drone 2",
            value: 2,
            component: DroneDetails,
            props: {
                drone: {
                    name: "🚁 Drone 2",
                    battery: 10,
                    signal: "Zayıf",
                    location: "42.5° N, 74.2° W",
                    altitude: 10,
                    speed: 1,
                },
            },
        },
        {
            isVisible: true,
            label: "Drone 3",
            value: 3,
            component: DroneDetails,
            props: {
                drone: {
                    name: "🚁 Drone 3",
                    battery: 40,
                    signal: "Orta",
                    location: "44.5° N, 73.2° W",
                    altitude: 50,
                    speed: 15,
                },
            },
        },
    ]
</script>
<div class="drone-controls-panel">
    <h2>Drone Detayları</h2>
    <Tabs items={droneTabs} />
</div>