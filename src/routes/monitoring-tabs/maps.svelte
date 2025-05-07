<script context="module">
    export const name = 'Harita';
    export const priority = 1;
    export const isVisible = true;
</script>
<svelte:head>
    <script src="https://unpkg.com/deck.gl@latest/dist.min.js"></script>
    <script src="https://unpkg.com/maplibre-gl@3.0.0/dist/maplibre-gl.js"></script>
    <link href="https://unpkg.com/maplibre-gl@3.0.0/dist/maplibre-gl.css" rel="stylesheet" />
</svelte:head>
<script>
    import { onMount } from 'svelte';

    // Geçici veri oluşturma fonksiyonu
    function generateFakeGridmapData(count = 1000, center = { lat: 39.51, lon: 35.27 }, spread = 0.1) {
        const data = [];

        for (let i = 0; i < count; i++) {
            const radius = Math.random() * spread;
            const angle = Math.random() * 2 * Math.PI;
            const lat = center.lat + radius * Math.sin(angle);
            const lon = center.lon + radius * Math.cos(angle);
            const intensity = Math.floor(Math.random() * 100) + 1;

            data.push([lon, lat, intensity]);
        }

        return data;
    }
    // Haritanın başlangıç durumu ve stil ayarları
    const INITIAL_MAP_STATE = {
        latitude: 39,
        longitude: 35.27,
        zoom: 6,
        maxZoom: 16,
        pitch: 20,
        bearing: 0
    };
    const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
    const colorRange = [
        [255, 255, 178, 25],
        [254, 217, 118, 85],
        [254, 178, 76, 127],
        [253, 141, 60, 170],
        [240, 59, 32, 212],
        [189, 0, 38, 255]
    ];

    // Harita için gerekli değişkenler
    let [mapContainer, map, fakeScannedLocations, deckOverlay] = []; // Aynı tip değişkenler undefined olarak başlatılıyor (tek tek yazıp alan kaplamamak için)
    let cellSize = 4;
    const gpuAggregation = true;
    let aggregation = 'SUM';
    const maxLibraryLoadTries = 100; // Kütüphanelerin yüklenmesi için maksimum deneme sayısı
    const layerVisibility = [
        { id: 'drones', name: 'Dronlar', visible: false },
        { id: 'path-lines', name: 'İzlenen Yollar', visible: false },
        { id: 'scan-grid', name: 'Taranan Alan', visible: true },
    ]
    let hideMap = false;
            
    $: {
        if (map && deckOverlay) {
            // Update the layer visibility dynamically
            deckOverlay.setProps({
                layers: [
                    new window.deck.ScreenGridLayer({
                        id: 'scan-grid',
                        data: fakeScannedLocations,
                        opacity: 0.6,
                        getPosition: d => [d[0], d[1]],
                        getWeight: d => d[2],
                        cellSizePixels: cellSize,
                        colorRange,
                        gpuAggregation,
                        aggregation,
                        visible: layerVisibility.find(layer => layer.id === 'scan-grid').visible,
                        updateTriggers: {
                            visible: layerVisibility.find(layer => layer.id === 'scan-grid').visible
                        }
                    })
                ]
            });
        }
    }

    onMount(async () => {
        // Harita kütüphanelerinin yüklenmesini bekle
        let libraryLoadTries = 0;
        while (!window.maplibregl || !window.deck && libraryLoadTries < maxLibraryLoadTries) {
            // Harita kütüphanelerinin yüklenmesini bekle
            libraryLoadTries++;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (libraryLoadTries >= maxLibraryLoadTries) {
            console.error('Kütüphaneler birçok denemeye rağmen yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
            hideMap = true;
            return;
        }

        // Sahte veri oluşturma
        fakeScannedLocations = generateFakeGridmapData(2000)
        // Haritayı oluşturma
        map = new window.maplibregl.Map({
            container: mapContainer,
            style: MAP_STYLE,
            interactive: true,
            center: [INITIAL_MAP_STATE.longitude, INITIAL_MAP_STATE.latitude],
            zoom: INITIAL_MAP_STATE.zoom,
            bearing: INITIAL_MAP_STATE.bearing,
            pitch: INITIAL_MAP_STATE.pitch
        });

        map.on('load', () => {
            // Harita katmanları
            deckOverlay = new window.deck.MapboxOverlay({
                layers: [
                    // Taranan alanları gösteren ızgara katmanı
                    new window.deck.ScreenGridLayer({
                        id: 'scan-grid',
                        data:fakeScannedLocations,
                        opacity: .6,
                        getPosition: d => [d[0], d[1]],
                        getWeight: d => d[2],
                        cellSizePixels: 5,
                        colorRange,
                        gpuAggregation,
                        aggregation,
                        visible: layerVisibility.find(layer => layer.id === 'scan-grid').visible,
                        updateTriggers: {
                            visible: layerVisibility.find(layer => layer.id === 'scan-grid').visible
                        }
                    })
                ]
            });
            
            map.addControl(deckOverlay);
        });
        
        return () => {
            if (map) map.remove();
        };
    });
</script>
<div id="map-container" bind:this={mapContainer}>
    <div id="map-warning" style="display: {hideMap ? 'grid':'none'}; align-items: center; justify-items: center; align-content: center; height: 100%; width: 100%;">
        <h1>Harita Sekmesi</h1>
        <p>
            Bu sekme haritayı görüntülemek için kullanılacaktır,
            eğer bu yazıyı görüyorsanız muhtemelen kütüphanelerin yüklenmesinde bir hata olmuştur.
        </p>
    </div>
    <div style="display: {hideMap ? 'none':'initial'};" class="map-controls">
        <label for="map-settings">Harita Ayarları</label>
        <div id="map-settings">
            <div class="map-setting-item">
                <label for="cell-size">Hücre Boyutu:</label>
                <input type="number" id="cell-size" bind:value={cellSize} min="1" max="100" step="1" />
            </div>
            <div class="map-setting-item">
                <label for="aggregation">Toplama Yöntemi:</label>
                <select id="aggregation" bind:value={aggregation}>
                    <option value="SUM">Toplam</option>
                    <option value="MEAN">Ortalama</option>
                    <option value="MAX">Maksimum</option>
                    <option value="MIN">Minimum</option>
                </select>
            </div>
        </div>
        <label for="layer-controls">Katman Kontrolleri</label>
        <div id="layer-controls">
            {#each layerVisibility as layer}
                <div class="layer-control">
                    <input type="checkbox" id="{layer.id}-layer" bind:checked={layer.visible} />
                    <label for="{layer.id}-layer">{layer.name}</label>
                </div>
            {/each}
        </div>
    </div>
</div>
<style>
    #map-container {
        width: 100%;
        height: 100%;

        padding: 3px; 
        overflow: hidden; 
        
        background-color: #fff;
        border: 1px solid var(--border-color);
    }
    .map-controls {
        user-select: none;;

        z-index: 2;
        position: absolute;

        top: 10px;
        left: 10px;

        padding: 5px;
        border-radius: 0;

        color: white;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .map-controls > div {
        padding-left: 10px;
    }

    #map-settings * {
        color: white;
    }
    #map-settings option {
        color: initial;
    }

    #map-settings input, select {
        border-radius: 0;
        padding: 3px 3px;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .layer-control {
        gap: 5px;
        display: grid;
        grid-auto-flow: column;
        justify-content: start;
    }
</style>