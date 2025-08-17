<script>
    import { onMount } from "svelte";
    import { sendWebSocketMessage } from '$lib/states/drone-states.svelte.js';

    let sendCommand = (target, command) => {
        sendWebSocketMessage({
            target: target,
            data: command
        });
    };

    let yukseklikValue = 5; // Varsayılan yükseklik değeri
    let droneDistanceValue = 5; // Varsayılan dronlar arası mesafe değeri
    let formationProtectionTimeValue = 5; // Varsayılan formasyon koruma süresi değeri (saniye)
    let positionInputType = "formasyon"; // Varsayılan pozisyon tipi

    let activeFormation = "v"; // Varsayılan formasyon
    const formations = [
        { name: "V", value: "v", positions: 
            [
                
                { x: 100, y: 50, number: 1 },
                { x: 75, y: 100, number: 2 },
                { x: 125, y: 100, number: 3 }
            ] 
        },
        { name: "Çizgi", value: "cizgi", positions: 
            [
                
                { x: 50, y: 100, number: 1 },
                { x: 100, y: 100, number: 2 },
                { x: 150, y: 100, number: 3 }
            ] 
        },
        { name: "Ok Başı", value: "ok", positions: 
            [
                
                { x: 75, y: 75, number: 1 },
                { x: 125, y: 75, number: 2 },
                { x: 75, y: 125, number: 3 },
                { x: 125, y: 125, number: 4 }
            ] 
        },
        { name: "Serbest", value: "serbest", positions: 
            [
                
            ] 
        }
    ];
    const handleClick = (formation) => (activeFormation = formation);

</script>
<div class="mission-planner">
    <div class="mission-planning-panel">
        <h2>Görev Planlayıcı</h2>
        <div class="mission-details">
            <label for="area-select">Görev:</label>
            <select id="area-select" bind:value={positionInputType}>
                <option value="formasyon">3B Formasyon</option>
                <option value="navigasyon">Sürü Navigasyon</option>
                <option value="birey">Birey Ekleme Çıkarma</option>
                <option value="kesif">Sürü Keşif</option>
            </select>

            <label for="param-sliders">Genel Parametreler:</label>
            <div class="param-sliders" id="param-sliders">
                <div class="param-sliders-group">
                    <div class="param-item light-border">
                        <label for="yukseklik-slider">Yükseklik (<span id="yukseklikValue">{yukseklikValue}</span> m)</label>
                        <input type="range" id="yukseklik-slider" min="5" max="50" bind:value={yukseklikValue}>
                    </div>
                    <div class="param-item light-border">
                        <label for="drone-distance-slider">Dronlar Arası Mesafe (<span id="droneDistanceValue">{droneDistanceValue}</span> m)</label>
                        <input type="range" id="drone-distance-slider" min="1" max="50" bind:value={droneDistanceValue}>
                    </div>
                    <div class="param-item light-border">
                        <label for="formation-protection-time-slider">Formasyon Koruma Süresi (<span id="formationProtectionTimeValue">{formationProtectionTimeValue}</span> s)</label>
                        <input type="range" id="formation-protection-time-slider" min="1" max="50" bind:value={formationProtectionTimeValue}>
                    </div>
                </div>
                <div class="param-item">
                    <label for="position-inputs">Görev Noktaları</label>
                    <div class="position-inputs" id="position-inputs">
                        <input type="text" id="position-x1" placeholder="X1 Pozisyonu">
                        <input type="text" id="position-y1" placeholder="Y1 Pozisyonu">
                        <input type="text" id="position-x2" placeholder="X2 Pozisyonu" style={positionInputType === 'kesif' ? 'display:block;' : 'display:none;'}>
                        <input type="text" id="position-y2" placeholder="Y2 Pozisyonu" style={positionInputType === 'kesif' ? 'display:block;' : 'display:none;'}>
                    </div>
                    <label for="formation-selector">Formasyon:</label>
                    <div class="formation-selector" id="formation-selector">
                        {#each formations as formation}
                            <button class="formation-btn {activeFormation === formation.value ? 'active' : ''}" on:click={() => handleClick(formation.value)}>
                                {formation.name}
                            </button>
                        {/each}
                    </div>
                </div>
                <button on:click={() => sendCommand("broadcast", "g")} class="control-btn blue-bg">Görevi Gönder</button>
            </div>
        </div>
    </div>
    <div class="mission-launch-controls">
        <h4>Sürü Kontrolleri</h4>
        <button on:click={() => sendCommand("broadcast", "rtl")} class="control-btn orange-bg" id="swarm-return-btn">Üsse Dön</button>
        <button on:click={() => sendCommand("broadcast", "lnd")} class="control-btn orange-bg" id="swarm-land-btn">Toplu İniş Yap</button>
        <hr>
        <button on:click={() => sendCommand("broadcast", "kill")} class="control-btn red-bg" id="swarm-emergency-btn">Kill Switch</button>
    </div>
</div>
<style>
    .mission-planner {
        gap:5px;
        display: grid;
        grid-auto-flow: row;
    }

    .mission-planning-panel, .mission-launch-controls {
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);  
        padding: 5px; 
        border-radius: 4px;  
    }

    .mission-details label {
        display: block;
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 5px;
        font-size: 11px;
        padding: 3px; 
    }

    .formation-selector {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 3px;
        margin: 5px 0;
        padding: 3px; 
    }

    .param-sliders {
        padding: 3px; 
    }
    .param-sliders-group {
        gap: 5px;
        display: grid;
        grid-template: auto / 1fr 1fr;
    }

    .param-item {
        padding: 0px 2px;
        display: grid;
        grid-auto-rows: 1fr auto;
    }
    .formation-btn {
        padding: 1px;
    }
    .formation-btn.active{
        background-color: var(--text-color);
        color: var(--bg-primary);
    }
</style>