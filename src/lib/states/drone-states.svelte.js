class DroneStatus {
    constructor() {
        this.drone = {
            id: null,
            status: {
                armable:null,
                armed:null,
                flight_mode: null,
                battery: null,
                position: {
                    latitude: null,
                    longitude: null,
                    altitude: null
                }
            },
            timestamp: null
        };
    }
}

// Websocket ile bağlantı kur
function connectWebSocket() {
    const ws = new WebSocket("ws://localhost:8765");

    ws.onopen = () => {
        console.log("WebSocket bağlantısı kuruldu.");
    };

    ws.onmessage = (event) => {
        console.log("Mesaj alındı:", event.data);
        updateDrone(event.data);
    };

    ws.onerror = (error) => {
        console.error("WebSocket hatası:", error);
    };

    ws.onclose = () => {
        console.log("WebSocket bağlantısı kapandı, tekrar bağlanılıyor...");
        setTimeout(() => {
            connectWebSocket();
        }, 500);
        return;
    };

    return ws;
}


const droneStatusWebsocket = connectWebSocket();

droneStatusWebsocket.onmessage = (event) => {
    console.log("Güncelleme alındı:", event.data);
    updateDrone(event.data);
};

// XBee üzerinden keşfedilen dronlar burada tutulur
export const discoveredDrones = $state([]);

// XBee mesajlarını formatlamak için kullanılan fonksiyon
function formatXBeeMessage(message) {
    let _message = JSON.parse(message);
    console.log("Gelen XBee verisi:", _message);
    let data = _message.data.split(",");
    let formattedData  = {
        id: _message.sender,
        status: {
            armable: Boolean(Number(data[0])),
            armed: Boolean(Number(data[1])),
            flight_mode: Number(data[2]),
            battery: Number(data[3]),
            position: {
                latitude: parseFloat(Number(data[4]).toFixed(6)), // Enlem
                longitude: parseFloat(Number(data[5]).toFixed(6)), // Boylam
                altitude: parseFloat(Number(data[6]).toFixed(2)) // Yükseklik
            },
            velocity: {
                x: parseFloat(Number(data[9]).toFixed(2)), // X hızı
                y: parseFloat(Number(data[10]).toFixed(2)), // Y hızı
                z: parseFloat(Number(data[11]).toFixed(2))  // Z hızı
            },
            mission: {
                index: Number(data[7]), // Mevcut görev
                status: Number(data[8]), // Mevcut görev durumu
            }
        },
        timestamp: _message.timestamp.toFixed(0) // Zaman damgası
    }
    // console.log("Formatlanmış veri:", formattedData);
    return formattedData;
}

// Dronların güncellenmesi için kullanılan fonksiyon
function updateDrone(data) {
    // Gelen veriyi formatla
    let formattedData = formatXBeeMessage(data);
    let index = discoveredDrones.findIndex(drone => drone.id === formattedData.id)
    if (index === -1) {
        // Yeni drone ekleniyor
        discoveredDrones.push(formattedData);
        // console.log("Yeni drone keşfedildi:", formattedData);
    } else {
        // Mevcut drone güncelleniyor
        discoveredDrones[index] = formattedData;
    }
}