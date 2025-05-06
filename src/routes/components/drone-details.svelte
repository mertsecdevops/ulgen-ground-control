<script>
    export let drone = {};
    export const isVisible = true;
</script>
<div class="drone-status-card">
    <span>{drone.name}</span>
    <div class="status-indicators">
        <div class="battery">🔋 {drone.battery}%</div>
        <div class="signal">📶 {drone.signal}</div>
    </div>
</div>
<div class="drone-detailed-info">
    <p>🚩 Konum: {drone.location}</p>
    <p>📏 Yükseklik: {drone.altitude}m</p>
    <p>⏩ Hız: {drone.speed} m/s</p>
</div>
<div class="drone-controls">
    <h4>Drone Kontrolleri</h4>
    <button class="control-btn return-btn">Üsse Dön</button>
    <button class="control-btn emergency-btn">Acil Durdur</button>
</div>