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
    function generateFakeDroneLocations(count=3, center = { lat: 39.51, lon: 35.27 }, spread = 0.1) {
        const data = [];
        for (let i = 0; i < count; i++) {
            const radius = Math.random() * spread;
            const angle = Math.random() * 2 * Math.PI;
            const lat = center.lat + radius * Math.sin(angle);
            const lon = center.lon + radius * Math.cos(angle);

            data.push({
                name: `Drone ${i + 1}`,
                coordinates: [lon, lat],
            });
        }
        return data;
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

    var mapSettings = {
        cellSize: 4,
        aggregation: 'SUM',
        gpuAggregation: true
    };

    // Harita katmanları
    var layerVisibility = [
        { id: 'drones', name: 'Dronlar', visible: true },
        { id: 'drone-paths', name: 'İzlenecek Rota', visible: false },
        { id: 'drone-traces', name: 'Geçmiş Rota', visible: false },
        { id: 'scan-grid', name: 'Taranan Alan', visible: true },
    ]

    function createLayers(window, mapSettings = mapSettings) {
        const layers = []
        // Taranan alan katmanı
        const scanGridLayer = new window.deck.ScreenGridLayer({
            id: 'scan-grid',
            data: fakeScannedLocations,
            opacity: 0.6,
            getPosition: d => [d[0], d[1]],
            getWeight: d => d[2],
            cellSizePixels: mapSettings.cellSize,
            colorRange,
            gpuAggregation: mapSettings.gpuAggregation,
            aggregation: mapSettings.aggregation,
            visible: layerVisibility.find(layer => layer.id === 'scan-grid').visible
        });
        const dronesLayer = new window.deck.ScenegraphLayer({
            id: 'drones',
            data: generateFakeDroneLocations(),
            getPosition: d => d.coordinates,
            getOrientation: d => [0, Math.random() * 180, 90],
            scenegraph: "https://raw.githubusercontent.com/yussufbiyik/yussufbiyik.github.io/main/assets/drone.glb",
            sizeScale: 500, //! Boyut zoom a göre değişmeli
            _lighting: '',
            pickable: true
        })
        layers.push(scanGridLayer);
        layers.push(dronesLayer);
        return layers;
    }

    // Katman değişikliklerini dinamik olarak güncelle
    $: if (map && deckOverlay && layerVisibility) {
        // layerVisibility aslında her zaman tanımlı, 
        // burada yine de if içerisinde olmasının sebebi
        // bu bloğun tekrar çalışmasını sağlamak
        // aslında bunun daha iyi bir yolu var ama şu an için bu yeterli
        // bilen birisi daha iyi bir yol önerirse hatta yazarsa sevinirim
        deckOverlay.setProps({ layers: createLayers(window, mapSettings) });
    }

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

        // Sahte veri oluştur
        fakeScannedLocations = generateFakeGridmapData(2000)
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
                <input type="number" id="cell-size" bind:value={mapSettings.cellSize} min="1" max="100" step="1" />
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