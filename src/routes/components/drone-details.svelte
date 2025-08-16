<script>
    export let drone = {};
    export const isVisible = true;
    import { onMount } from 'svelte';
    import { sendWebSocketMessage } from '$lib/states/drone-states.svelte.js';

    let mission_status = () => {
        if (!drone.mission) return "Görev Yok";
        switch (drone.mission.status) {
            case 0:
                return "Devam Ediyor";
            case 1:
                return "Tamamlandı";
            case 2:
                return "Başarısız/Hatalı Tamamlandı";
            default:
                break;
        }
    }

    let mission_emoji = () => {
        if (!drone.mission) return "❌";
        switch (drone.mission.status) {
            case 0:
                return "🚀";
            case 1:
                return "✅";
            case 2:
                return "❌";
            default:
                break;
        }
    }

    let sendCommand = (target, command) => {
        sendWebSocketMessage({
            target: target,
            data: command
        });
    };
</script>
<div class="drone-status-card">
    <span>{drone.name}</span>
    <div class="status-indicators">
        <!-- <span class="battery">🔋 {drone.battery}%</span> -->
        <span>📶 Gecikme: {Math.abs(drone.ping)}ms</span>
    </div>
</div>
<div class="drone-detailed-info">
    <p>{mission_emoji()} Görev Durumu: {drone.mission.index+1}. Adım - {mission_status()}</p>
    <p>🚩 Konum: {drone.location}</p>
    <!-- <p>📏 Yükseklik: {drone.altitude}m</p> -->
    <!-- <p>⏩ Hız: {Math.sqrt(drone.velocity.x**2+drone.velocity.y**2+drone.velocity.z**2).toFixed(2)} m/s</p> -->
</div>
<div class="drone-controls">
    <h4>Drone Kontrolleri</h4>
    <button on:click={() => sendCommand(drone.id, "home")} class="control-btn return-btn">Üsse Dön</button>
    <button on:click={() => sendCommand(drone.id, "acil")} class="control-btn emergency-btn">Acil Durdur</button>
</div>

<style>
    .status-indicators {
        display: grid;
        grid-auto-flow: row;
    }
</style>