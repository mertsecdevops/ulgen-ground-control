<div class="mission-planning-panel">
    <h2>Görev Planlama</h2>
    <div class="mission-details">
        <label>Görev Adı:</label>
        <input type="text" id="mission-name">
        
        <label>Görev Tipi:</label>
        <select id="area-select">
            <option value="target">Hedefe Ulaşma</option>
            <option value="area">Alan Tarama</option>
        </select>

        <label>Formasyon:</label>
        <div class="formation-selector">
            <button class="formation-btn active">Üçgen</button>
            <button class="formation-btn">Hat</button>
            <button class="formation-btn">Izgara</button>
        </div>

        <label>Görev Parametreleri:</label>
        <div class="param-sliders">
            <div class="param-item">
                <label for="yukseklik-slider">Yükseklik (<span id="yukseklikValue">100</span> m)</label>
                <input type="range" id="yukseklik-slider" min="10" max="500" value="100">
            </div>
            <div class="param-item">
                <label>Görev Noktaları</label>
                <div class="position-inputs" id="position-inputs">
                    <input type="text" id="position-x1" placeholder="X1 Pozisyonu">
                    <input type="text" id="position-y1" placeholder="Y1 Pozisyonu">
                    <input type="text" id="position-x2" placeholder="X2 Pozisyonu" style="display:none;">
                    <input type="text" id="position-y2" placeholder="Y2 Pozisyonu" style="display:none;">
                </div>
            </div>
        </div>

        <div class="mission-launch-controls">
            <button class="control-btn launch-btn">Sürüyü Başlat</button>
            <button class="control-btn emergency-btn">Sürüyü Acil Durdur</button>
        </div>
    </div>
</div>