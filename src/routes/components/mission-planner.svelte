<script>
    import { onMount } from "svelte";
    import { sendWebSocketMessage, discoveredDrones } from '$lib/states/drone-states.svelte.js';

    let sendCommand = (target, command, is_mission_message = false) => {
        if (selectedMission === "birey" && selectedDrones.length < 1 && is_mission_message) {
            alert("Lütfen en az üç drone seçin.");
            return;
        }
        if (selectedMission === "birey" && is_mission_message) {
            discoveredDrones.forEach(drone => {
                let is_main_member = selectedDrones.includes(drone.id) ? 1 : 0;
                let _command_array = command.split(',')
                let command_array = [
                    ..._command_array.slice(0, 5),
                    is_main_member,
                    ..._command_array.slice(5)
                ]
                sendWebSocketMessage({
                    target: drone.id,
                    data: `${command_array.join(',')}`
                });
            });
            return;
        }
        sendWebSocketMessage({
            target: target,
            data: command
        });
    };

    const formations = [
        { name: "V", value: "v"},
        { name: "Çizgi", value: "cizgi" },
        { name: "Ok Başı", value: "ok",},
    ];
    const missions = [
        { name: "3B Formasyon", value: "formasyon"},
        { name: "Sürü Navigasyon", value: "navigasyon" },
        { name: "Birey Ekleme Çıkarma", value: "birey",},
        { name: "Sürü Keşif", value: "kesif",},
    ];
    let selectedPositions = [
        // Seçilen pozisyonlar buraya gelir
    ];
    let selectedDrones = [
        // Seçilen dronlar buraya gelir
    ];
    let selectedFormations = [
        // Seçilen formasyonlar buraya gelir
    ];

    // Seçilen dronları toggle eden fonksiyon
    let toggleDroneSelection = (droneId) => {
        if (selectedDrones.includes(droneId)) {
            selectedDrones = selectedDrones.filter(id => id !== droneId);
        } else {
            selectedDrones = [...selectedDrones, droneId];
        }
    };

    // GPS Girdileri
    let latValue1 = 0;
    let lonValue1 = 0;
    let latValue2 = 0;
    let lonValue2 = 0;
    // NED Girdileri
    let nedX1 = 0;
    let nedY1 = 0;
    let nedX2 = 0;
    let nedY2 = 0;

    let yukseklikValue = 10; // Varsayılan yükseklik değeri
    let droneDistanceValue = 5; // Varsayılan dronlar arası mesafe değeri
    let formationProtectionTimeValue = 5; // Varsayılan formasyon koruma süresi değeri (saniye)
    let selectedMission = "formasyon"; // Varsayılan pozisyon tipi

    let locationInputType = "ned"
    let missionExecutionType = "normal"

    let addPosition = () => {
        let addition = locationInputType === "gps" ? 
            { latitude: latValue1, longitude: lonValue1 } : 
            { north: nedX1, east: nedY1 };
        selectedPositions = [...selectedPositions, addition];
    };

    let removePosition = (position) => {
        selectedPositions = selectedPositions.filter(pos => pos !== position);
    };

    let addFormation = (formation) => {
        selectedFormations = [...selectedFormations, formation];
    };

    let removeFormation = (formation) => {
        selectedFormations = selectedFormations.filter(f => f !== formation);
    };

    function getMissionSpecificParameters() {
        switch (selectedMission) {
            case "formasyon":
                return selectedFormations.join(',');
            case "navigasyon":
                let nav_str = `${selectedFormations[0]},${locationInputType === "gps" ? "0" : "1"}`;
                for (let pos of selectedPositions) {
                    if (Object.keys(pos).includes("latitude") && locationInputType === "gps") {
                        nav_str += `,${pos.latitude},${pos.longitude}`.replace('.','');
                    }
                    else if (Object.keys(pos).includes("north") && locationInputType === "ned") {
                        nav_str += `,${pos.north},${pos.east}`;
                    }
                }
                return nav_str;
            case "birey":
                let birey_str = `${selectedFormations[0]},${locationInputType === "gps" ? "0" : "1"}`;
                for (let pos of selectedPositions) {
                    if (Object.keys(pos).includes("latitude") && locationInputType === "gps") {
                        birey_str += `,${pos.latitude},${pos.longitude}`.replace('.','');
                    }
                    else if (Object.keys(pos).includes("north") && locationInputType === "ned") {
                        birey_str += `,${pos.north},${pos.east}`;
                    }
                }
                return birey_str;
            case "kesif":
                // NED koordinatlar
                let kesif_str = `${selectedFormations[0]},${locationInputType === "gps" ? "0" : "1"}`;
                for (let pos of selectedPositions) {
                    if (Object.keys(pos).includes("latitude") && locationInputType === "gps") {
                        kesif_str += `,${pos.latitude},${pos.longitude}`.replace('.','');
                    }
                    else if (Object.keys(pos).includes("north") && locationInputType === "ned") {
                        kesif_str += `,${pos.north},${pos.east}`;
                    }
                }
                return kesif_str;
            default:
                return "";
        }
    }
    let missionMessage = () => {return `g,${missions.findIndex(m => m.value === selectedMission)},${yukseklikValue},${droneDistanceValue},${formationProtectionTimeValue},${getMissionSpecificParameters()}`}
</script>
<div class="mission-planner">
    <div class="mission-planning-panel">
        <h2>Görev Planlayıcı</h2>
        <div class="mission-details">
            <label for="area-select">Görev:</label>
            <select id="area-select" bind:value={selectedMission}>
                {#each missions as mission, index}
                    <option id={`mission-${index}`} value={mission.value}>{mission.name}</option>
                {/each}
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
                        <input type="range" id="formation-protection-time-slider" min="0" max="50" bind:value={formationProtectionTimeValue}>
                    </div>
                </div>
                <div class="param-item">
                    <label for="position-inputs">Görev Parametreleri</label>
                    <div style="gap:5px;display: grid;grid-auto-flow: column;align-items: center;justify-content: start;">
                        <label for="pid-apf-mode-toggle">PID+APF Modu</label>
                        <input type="checkbox" id="pid-apf-mode-toggle" name="isPIDAPF" value="PID+APF Modu" checked={missionExecutionType === "pid_apf"} on:change={() => missionExecutionType = missionExecutionType === "pid_apf" ? "normal" : "pid_apf"}>
                    </div>
                    <div class="drone-inputs light-border {["birey"].includes(selectedMission) ? '' : 'hidden'}">
                        <label for="drone-selector">Ana Grup Bireyleri:</label>
                        <div class="drone-selector" id="drone-selector">
                            {#each discoveredDrones as drone}
                                <button class="drone-btn {selectedDrones.includes(drone.id) ? 'active' : ''}" on:click={() => toggleDroneSelection(drone.id)}>
                                    {drone.id}
                                </button>
                            {/each}
                        </div>
                    </div>
                    <div class="all-position-inputs light-border {["navigasyon", "kesif", "birey"].includes(selectedMission) ? '' : 'hidden'}">
                        <div style="gap:5px;display: grid;grid-auto-flow: column;align-items: center;justify-content: start;">
                            <label for="gps-mode-toggle">GPS Girdisi</label>
                            <input type="checkbox" id="gps-mode-toggle" name="isGPS" value="GPS Girdisi" checked={locationInputType === "gps"} on:change={() => locationInputType = locationInputType === "gps" ? "ned" : "gps"}>
                        </div>
                        <div class="position-inputs {locationInputType === 'ned' ? '' : 'hidden'}" id="ned-position-inputs">
                            <input bind:value={nedX1} type="number" min=0 step="0.5" id="position-n-1" placeholder="Kuzey (Metre)">
                            <input bind:value={nedY1} type="number" min=0 step="0.5" id="position-e-1" placeholder="Doğu (Metre)">
                            <input bind:value={nedX2} type="number" min=0 step="0.5" id="position-n-2" placeholder="Kuzey (Metre)" style={selectedMission === 'kesif' ? 'display:block;' : 'display:none;'}>
                            <input bind:value={nedY2} type="number" min=0 step="0.5" id="position-n-2" placeholder="Doğu (Metre)" style={selectedMission === 'kesif' ? 'display:block;' : 'display:none;'}>
                        </div>
                        <div class="position-inputs {locationInputType === 'gps' ? '' : 'hidden'}" id="gps-position-inputs">
                            <input bind:value={latValue1} type="number" min=0 step="0.00001" id="position-lat-1" placeholder="Latitude">
                            <input bind:value={lonValue1} type="number" min=0 step="0.00001" id="position-lon-1" placeholder="Longitude">
                            <input bind:value={latValue2} type="number" min=0 step="0.00001" id="position-lat-2" placeholder="Latitude" style={selectedMission === 'kesif' ? 'display:block;' : 'display:none;'}>
                            <input bind:value={lonValue2} type="number" min=0 step="0.00001" id="position-lon-2" placeholder="Longitude" style={selectedMission === 'kesif' ? 'display:block;' : 'display:none;'}>
                        </div>
                        <button id="add-position-data" class="control-btn blue-bg" on:click={addPosition}>Konumu Ekle</button>
                        <div>
                            <div class="selected-positions-container">
                                {#each selectedPositions as pos}
                                    <div class="selected-position light-border">
                                        <span>
                                            {pos.latitude ? `Latitude: ${pos.latitude}, Longitude: ${pos.longitude}` : `Kuzey: ${pos.north}, Doğu: ${pos.east}`}
                                        </span>
                                        <button class="control-btn red-bg" on:click={() => removePosition(pos)}>Sil</button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                    <div class="formation-inputs light-border {["formasyon", "navigasyon", "birey"].includes(selectedMission) ? '' : 'hidden'}">
                        <label for="formation-selector">Formasyon:</label>
                        <div class="formation-selector" id="formation-selector">
                            {#each formations as formation}
                                <button class="formation-btn" on:click={() => addFormation(formation.value)}>
                                    {formation.name}
                                </button>
                            {/each}
                        </div>
                        {#each selectedFormations as formation}
                            <div class="selected-position light-border">
                                <span>
                                    {formation}
                                </span>
                                <button class="control-btn red-bg" on:click={() => removeFormation(formation)}>Sil</button>
                            </div>
                        {/each}
                    </div>
                </div>
                <button on:click={() => sendCommand("broadcast", missionMessage(), true)} class="control-btn blue-bg">Görevi Gönder</button>
                <button on:click={() => sendCommand("broadcast", "abrt")} class="control-btn red-bg">Aktif Görevi İptal Et</button>
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
        grid-template-columns: 1fr 1fr 1fr;
        gap: 3px;
        margin: 5px 0;
        padding: 3px; 
    }

    .param-sliders {
        padding: 3px; 
        max-height: 600px;
        overflow-y: auto;
    }
    .param-sliders-group {
        gap: 5px;
        display: grid;
        grid-template: auto / 1fr 1fr;
    }

    .param-item {
        padding: 0px 2px;
        display: grid;
        /* grid-auto-rows: auto 1fr; */
        align-items: end;
    }
    .formation-btn, .drone-btn {
        padding: 1px;
    }
    .formation-btn.active, .drone-btn.active {
        background-color: var(--text-color);
        color: var(--bg-primary);
    }

    #gps-mode-toggle {
        background-color: var(--bg-secondary);
        aspect-ratio: 1/1;
        width: 13px;
    }

    .all-position-inputs, .formation-inputs {
        padding: 0 5px 5px 5px;
    }

    .selected-positions-container {
        gap:5px;
        display: grid;

        overflow-y: auto;
        max-height: 100px;
    }

    .selected-position {
        gap: 1px;
        display: grid;
        grid-auto-flow: column;

        padding: 2px;
    }
</style>