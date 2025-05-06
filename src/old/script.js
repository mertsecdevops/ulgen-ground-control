document.addEventListener('DOMContentLoaded', () => {

    // Formasyon Görünümü Görselleştirmesi
    function renderFormationView() {
        const svg = document.getElementById('formation-svg');
        const activeFormation = document.querySelector('.formation-btn.active').textContent;
        const currentFormation = getFormationNodes(activeFormation);

        // Yumuşak geçişler için yeni SVG grubu oluştur
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('opacity', '0');

        currentFormation.forEach(drone => {
            const droneNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            droneNode.classList.add('drone-node');

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', drone.x);
            circle.setAttribute('cy', drone.y);
            circle.setAttribute('r', 20);
            circle.classList.add('drone-node-circle');

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', drone.x);
            text.setAttribute('y', drone.y + 5);
            text.textContent = `#${drone.number}`;
            text.classList.add('drone-node-text');

            droneNode.appendChild(circle);
            droneNode.appendChild(text);
            group.appendChild(droneNode);
        });

        // Mevcut SVG içeriğini yeni grupla değiştir
        svg.innerHTML = '';
        svg.appendChild(group);

        // Geçişi animasyonla yap
        requestAnimationFrame(() => {
            group.setAttribute('opacity', '1');
            group.querySelectorAll('.drone-node').forEach((node, index) => {
                node.style.transform = `scale(${1 - index * 0.1})`;
                node.style.transformOrigin = 'center';
            });
        });
    }

    function getFormationNodes(formationType) {
        const formations = {
            'Üçgen': [
                { x: 100, y: 50, number: 1 },
                { x: 75, y: 100, number: 2 },
                { x: 125, y: 100, number: 3 }
            ],
            'Hat': [
                { x: 50, y: 100, number: 1 },
                { x: 100, y: 100, number: 2 },
                { x: 150, y: 100, number: 3 }
            ],
            'Izgara': [
                { x: 75, y: 75, number: 1 },
                { x: 125, y: 75, number: 2 },
                { x: 75, y: 125, number: 3 },
                { x: 125, y: 125, number: 4 }
            ]
        };

        return formations[formationType] || formations['Üçgen'];
    }

    // İlk formasyon görünümünü oluştur
    renderFormationView();

    // Görev Tipine Bağlı Dinamik Konum Girişleri
    const areaSelect = document.getElementById('area-select');
    const positionInputs = document.getElementById('position-inputs');
    const positionInputElements = positionInputs.querySelectorAll('input');

    areaSelect.addEventListener('change', () => {
        const isAreaSurvey = areaSelect.value === 'area';
        
        // Ek girişlerin görünürlüğünü değiştir
        positionInputElements[2].style.display = isAreaSurvey ? 'block' : 'none';
        positionInputElements[3].style.display = isAreaSurvey ? 'block' : 'none';
    });

    // Drone Durumu Güncellemeleri Simülasyonu
    function updateDroneStatus() {
        const droneStatusCards = document.querySelectorAll('.drone-details .drone-status-card');
        droneStatusCards.forEach((card, index) => {
            const batteryElement = card.querySelector('.battery');
            const signalElement = card.querySelector('.signal');

            // "Batarya Seviyesi" ile dinamik durum simülasyonu
            batteryElement.textContent = `Batarya Seviyesi: ${85 - index * 10}%`;
            signalElement.textContent = index === 0 ? 'Güçlü' : 
                                        index === 1 ? 'Orta' : 'Zayıf';
        });
    }

    // Terminal Günlük Kaydı Fonksiyonu
    function terminalLog(message, type = 'default') {
        const terminalLog = document.getElementById('terminal-log');
        const logEntry = document.createElement('p');
        logEntry.classList.add('log-entry');
        
        // Zaman damgası ekle
        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        // Türe özgü sınıf ekle
        if (type === 'error') logEntry.classList.add('error');
        if (type === 'warning') logEntry.classList.add('warning');
        if (type === 'success') logEntry.classList.add('success');
        
        terminalLog.appendChild(logEntry);
        
        // Otomatik olarak aşağıya kaydır
        terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    // Kontrol Düğmesi Eylemleri (Simüle edilmiş)
    document.querySelector('.return-btn').addEventListener('click', () => {
        terminalLog('Dronlar üsse geri dönüyor...', 'warning');
        console.log('Returning Drones to Base');
        // Üsse dönüş mantığını ekle
    });

    document.querySelector('.emergency-btn').addEventListener('click', () => {
        terminalLog('ACİL DURDURMA AKTİF!', 'error');
        console.log('Emergency Stop Activated');
        // Acil durdurma mantığını ekle
    });

    // Görev başlatmaya terminal günlük kaydı ekle
    document.querySelector('.launch-btn').addEventListener('click', () => {
        const missionName = document.getElementById('mission-name').value || 'İsimsiz Görev';
        const missionType = document.getElementById('area-select').value;
        
        terminalLog(`Görev Başlatıldı: ${missionName}`, 'success');
        terminalLog(`Görev Tipi: ${missionType === 'target' ? 'Hedefe Ulaşma' : 'Alan Tarama'}`, 'default');
    });

    // Cesium Harita Başlatma
    function initializeCesiumMap() {
        terminalLog('Harita başlatılıyor...', 'default');
        
        try {
            // Türkiye'nin yaklaşık merkez koordinatları
            const turkeyCenter = {
                longitude: Cesium.Math.toRadians(35.2433),
                latitude: Cesium.Math.toRadians(38.9637)
            };

            const viewer = new Cesium.Viewer('cesiumContainer', {
                imageryProvider: new Cesium.OpenStreetMapImageryProvider(), 
                baseLayerPicker: false,
                geocoder: false,
                terrainProvider: new Cesium.EllipsoidTerrainProvider() 
            });

            // Kamerayı Türkiye üzerine konumlandır
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(
                    turkeyCenter.longitude, 
                    turkeyCenter.latitude, 
                    1000000 
                )
            });
            
            terminalLog('Harita başarıyla yüklendi.', 'success');
        } catch (error) {
            terminalLog(`Harita yüklenirken hata oluştu: ${error.message}`, 'error');
        }
    }

    // İlk durum güncellemesi
    updateDroneStatus();
    setInterval(updateDroneStatus, 5000);

    // Harita başlatmayı çağır
    initializeCesiumMap();
});