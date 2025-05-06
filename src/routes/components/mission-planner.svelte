<script>
    import { onMount } from "svelte";

    let yukseklikValue = 100; // Varsayılan yükseklik değeri
    let positionInputType = "target"; // Varsayılan pozisyon tipi

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
<div class="mission-planning-panel">
    <h2>Görev Planlayıcı</h2>
    <div class="mission-details">
        <label for="mission-name">Görev Adı:</label>
        <input type="text" id="mission-name">
        
        <label for="area-select">Görev Tipi:</label>
        <select id="area-select" bind:value={positionInputType}>
            <option value="target">Hedefe Ulaşma</option>
            <option value="area">Alan Tarama</option>
        </select>

        <label for="formation-selector">Formasyon:</label>
        <div class="formation-selector" id="formation-selector">
            {#each formations as formation}
                <button class="formation-btn {activeFormation === formation.value ? 'active' : ''}" on:click={() => handleClick(formation.value)}>
                    {formation.name}
                </button>
            {/each}
        </div>

        <label for="param-sliders">Görev Parametreleri:</label>
        <div class="param-sliders" id="param-sliders">
            <div class="param-item">
                <label for="yukseklik-slider">Yükseklik (<span id="yukseklikValue">{yukseklikValue}</span> m)</label>
                <input type="range" id="yukseklik-slider" min="10" max="500" bind:value={yukseklikValue}>
            </div>
            <div class="param-item">
                <label for="position-inputs">Görev Noktaları</label>
                <div class="position-inputs" id="position-inputs">
                    <input type="text" id="position-x1" placeholder="X1 Pozisyonu">
                    <input type="text" id="position-y1" placeholder="Y1 Pozisyonu">
                    <input type="text" id="position-x2" placeholder="X2 Pozisyonu" style={positionInputType === 'area' ? 'display:block;' : 'display:none;'}>
                    <input type="text" id="position-y2" placeholder="Y2 Pozisyonu" style={positionInputType === 'area' ? 'display:block;' : 'display:none;'}>
                </div>
            </div>
        </div>

        <div class="mission-launch-controls">
            <h4>Sürü Kontrolleri</h4>
            <button class="control-btn launch-btn">Başlat</button>
            <button class="control-btn return-btn">Üsse Döndür</button>
            <button class="control-btn emergency-btn">Acil Durdur</button>
        </div>
    </div>
</div>
<style>
    .mission-planning-panel {
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

    .param-item {
        margin-bottom: 5px;
    }
    .formation-btn {
        padding: 1px;
    }
    .formation-btn.active{
        background-color: var(--text-color);
        color: var(--bg-primary);
    }
</style>