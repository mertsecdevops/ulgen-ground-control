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
    import { mapStore } from '$lib/states/map-states.svelte.js';
    import { discoveredDrones, dronePreviousPoints } from '$lib/states/drone-states.svelte.js';

    // Asıl veri çekme fonksiyonları
    const droneLocations = $derived(discoveredDrones.map(drone => ({
            type: "drone",
            id: drone.id,
            name: drone.name || `Drone ${drone.id}`,
            coordinates: [drone.status.position.longitude, drone.status.position.latitude],
        })));

    function changeDroneTab(info, event) {
        const { object } = info;
        // Dron tıklanırsa drone sekmesine geç
        const droneTab = document.querySelector(`#drone-${object.id}`);
        if (droneTab) {
            droneTab.click();
        }
    }

    // Harita
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
    let [mapContainer, map, fakeScannedLocations, deckOverlay] = []; // Aynı tip değişkenler undefined olarak başlatılıyor (tek tek yazıp alan kaplamamak için)

    var mapSettings = $state({
        cellSize: 25,
        aggregation: 'SUM',
        gpuAggregation: true,
        scannedAreaOpacity: 0.6,
        droneSize: 150,
        pathWidth: 5,
    });

    // Harita katmanları
    var layerVisibility = $state([
        { id: 'drones', name: 'Dronlar', visible: true },
        { id: 'drone-past-paths', name: 'Geçilen Rota', visible: true },
        { id: 'scan-grid', name: 'Taranan Alan', visible: false },
    ])

    const DRONE_ORIENTATION = [0, 62, 90];
    const DRONE_LOCATIONS = $derived(droneLocations);
    const DRONE_TARGET_PATHS = $derived(generateFakeDronePaths(DRONE_LOCATIONS))
    const DRONE_PAST_PATHS = $derived(dronePreviousPoints.flatMap(drone => {
        const positions = drone.positions
        let segments = []
        for (let i = 0; i < positions.length - 1; i++) {
            segments.push({
                start: positions[i],
                end: positions[i + 1]
            });
        }
        return segments;
    }));
    function createLayers(window, mapSettings = mapSettings) {
        const layers = []
        const dronesLayer = new window.deck.ScenegraphLayer({
            id: 'drones',
            data: DRONE_LOCATIONS,
            getPosition: d => [...d.coordinates],
            getOrientation: DRONE_ORIENTATION,
            scenegraph: "https://raw.githubusercontent.com/yussufbiyik/yussufbiyik.github.io/main/assets/drone.glb",
            sizeScale: mapSettings.droneSize,
            _lighting: '',
            pickable: true,
            onClick: (info, event) => {
                changeDroneTab(info, event);
            },
            visible: layerVisibility.find(layer => layer.id === 'drones').visible
        })
        const dronePastPathsLayer = new window.deck.LineLayer({
            id: 'drone-past-paths',
            data: DRONE_PAST_PATHS,
            opacity: 0.8,
            getSourcePosition: d => d.start,
            getTargetPosition: d => d.end,
            getColor: d => {
                const z = d.start[2];
                const r = z / 10000;
                return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
            },
            getWidth: mapSettings.pathWidth,
            pickable: true,
            visible: layerVisibility.find(layer => layer.id === 'drone-past-paths').visible
        });
        // Taranan alan katmanı
        const scanGridLayer = new window.deck.ScreenGridLayer({
            id: 'scan-grid',
            data: DRONE_PAST_PATHS,
            opacity: mapSettings.scannedAreaOpacity,
            getPosition: d => [d.end[0], d.end[1]],
            getWeight: d => 1,
            cellSizePixels: mapSettings.cellSize,
            colorRange,
            gpuAggregation: mapSettings.gpuAggregation,
            aggregation: mapSettings.aggregation,
            visible: layerVisibility.find(layer => layer.id === 'scan-grid').visible
        });
        layers.push(dronePastPathsLayer);
        layers.push(scanGridLayer);
        layers.push(dronesLayer);
        return layers;
    }

    function getTooltip({ object }) {
        if (!object) return null;
        if (object.type === 'drone') {
            return `${object.name}\nKoordinatlar: ${object.coordinates[1]}, ${object.coordinates[0]}`;
        } else if (object.type === 'target-path') {
            return `${object.id}. Dronunun Hedef Rotası\nUzunluk: ${object.length}`;
        }
    }

    // Katman değişikliklerini dinamik olarak güncelle
    $effect(() => {
        layerVisibility.map(l => l.visible);
        DRONE_LOCATIONS.map(d => d.id);
        if (deckOverlay) {
            deckOverlay.setProps({
                layers: createLayers(window, mapSettings),
                getTooltip
            });
        }
    });


    // Harita kütüphanelerinin yüklenmesini bekle
    let hideMap = false;
    const maxLibraryLoadTries = 100; // maksimum deneme sayısı
    const libraryTrialInterval = 500; // deneme sıklığı (ms)
    function waitForLibraries(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onMount(async () => {
        // Harita kütüphanelerinin yüklenmesini bekle
        let libraryLoadTries = 0;
        while (!window.maplibregl || !window.deck) {
            if (++libraryLoadTries >= maxLibraryLoadTries) {
                console.error('Kütüphaneler birçok denemeye rağmen yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
                window.alert('Kütüphaneler birçok denemeye rağmen yüklenemedi. Lütfen internet bağlantınızı kontrol edin.\n Hata: \n\t' + error.message);
                hideMap = true;
                return;
            }
            console.log(`Kütüphaneler yükleniyor... (${libraryLoadTries})`);
            libraryLoadTries++;
            await waitForLibraries(libraryTrialInterval);
        }
        // Haritayı oluştur
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
                layers: createLayers(window, mapSettings)
            });
            
            map.addControl(deckOverlay);
        });

        // Harita triggerleri eklemek için https://maplibre.org/maplibre-gl-js/docs/API/classes/Map bakılabilir
        map.on('zoom', ()=>{
            let zoom = map.getZoom();
            // Zoom durumuna göre dinamik olarak dron boyutunu ve taranan alan opaklığını ayarla
            mapSettings.droneSize = Math.ceil(Math.min(Math.max(1500 - (zoom*110), 1), 1500));
            mapSettings.scannedAreaOpacity = Number(Math.max(Math.min(0.6, (zoom - 5) * 0.1), 0.1)).toFixed(2);
        })
        mapStore.map = map
        return () => {
            if (map) map.remove();
        };
    });
</script>
<div id="map-container" bind:this={mapContainer}>
    <div id="map-warning" class:hidden={!hideMap}>
        <h1>Harita Sekmesi</h1>
        <p>
            Bu sekme haritayı görüntülemek için kullanılacaktır,
            eğer bu yazıyı görüyorsanız muhtemelen kütüphanelerin yüklenmesinde bir hata olmuştur.
        </p>
    </div>
    <div class="map-controls" class:hidden={hideMap}>
        <label for="map-settings">Harita Ayarları</label>
        <div id="map-settings">
            <div class="map-setting-item">
                <label for="cell-size">Hücre Boyutu:</label>
                <input type="number" id="cell-size" bind:value={mapSettings.cellSize} min="25" max="40" step="1" />
            </div>
            <div class="map-setting-item">
                <label for="path-width">Rota Kalınlığı:</label>
                <input type="number" id="path-width" bind:value={mapSettings.pathWidth} min="1" max="10" step="1" />
            </div>
            <div class="map-setting-item">
                <label for="aggregation">Toplama Yöntemi:</label>
                <select id="aggregation" bind:value={mapSettings.aggregation}>
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
    .hidden {
        display: none !important;
    }

    #map-container {
        width: 100%;
        height: 100%;

        padding: 3px; 
        overflow: hidden; 
        
        background-color: #fff;
        border: 1px solid var(--border-color);
    }

    #map-warning {
        align-items: center; 
        justify-items: center; 
        align-content: center; 
        height: 100%; width: 100%;
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