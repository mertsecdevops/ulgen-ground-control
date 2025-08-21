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
    <button on:click={() => sendCommand(drone.id, "ping")} class="control-btn blue-bg" id="ping-btn">Ses Çıkart</button>
    <hr>
    <button on:click={() => sendCommand(drone.id, "rtl")} class="control-btn orange-bg" id="home-btn">Üsse Dön</button>
    <button on:click={() => sendCommand("broadcast", `fl,${drone.id}`)} class="control-btn orange-bg" id="home-btn">Formasyondan Çıkar ve Geri Ekle</button>
    <button on:click={() => sendCommand(drone.id, "lnd")} class="control-btn orange-bg" id="land-btn">İniş Yap</button>
    <hr>
    <button on:click={() => sendCommand(drone.id, "rst")} class="control-btn red-bg" id="reset-btn">Reset At</button>
    <button on:click={() => sendCommand(drone.id, "rb")} class="control-btn red-bg" id="reboot-btn">Yeniden Başlat</button>
    <hr>
    <button on:click={() => sendCommand(drone.id, "kill")} class="control-btn red-bg" id="emergency-btn">Kill Switch</button>
</div>

<style>
    .status-indicators {
        display: grid;
        grid-auto-flow: row;
    }
</style>