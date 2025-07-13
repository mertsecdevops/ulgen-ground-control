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
function formatXBeeMessage(data) {
    let _data = data.split(",");
    let formattedData  = {
        id: Number(_data[0]),
        status: {
            armable: Boolean(Number(_data[1])),
            armed: Boolean(Number(_data[2])),
            flight_mode: Number(_data[3]),
            battery: Number(_data[4]),
            position: {
                latitude: Number(_data[5]),
                longitude: Number(_data[6]),
                altitude: Number(_data[7])
            }
        },
        timestamp: Number(_data[8])
    }
    console.log("Formatlanmış veri:", formattedData);
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
        console.log("Yeni drone keşfedildi:", formattedData);
    } else {
        // Mevcut drone güncelleniyor
        discoveredDrones[index] = formattedData;
    }
}