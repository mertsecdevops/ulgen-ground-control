import ROSLIB from 'roslib';
import { readable, writable } from 'svelte/store';

const ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'
});

class DroneStatus {
    constructor() {
        this.status = {
            state: {
                connected: false,
                armed: false,
                guided: false,
                mode: null,
                system_status: null,
            },
            battery: null,
            position: {
                global: {
                    latitude: null,
                    longitude: null,
                    altitude: null
                },
                local: {
                    x: null,
                    y: null,
                    z: null,
                    w: null
                }
            },
            orientation: {
                x: null,
                y: null,
                z: null,
                w: null
            },
            velocity: null, // /local_position/accel ???
            altitude: null, // /local_position/pose ???
        };
    }
}

const _droneStats = writable([
    new DroneStatus(),
    new DroneStatus(),
    new DroneStatus(),
    new DroneStatus()
]);

// DroneStats writeable olarak tanımlanıp dışarı sadece okunabilir olarak export ediliyor
// Bu sayede droneStats store'u sadece subscribe edilebilir, dışarı componentler tarafından güncellenemez.
// Bu da store'un dışarıdan yanlışlıkla güncellenmesini engeller ve sadece içindeki fonksiyonlar aracılığıyla güncellenmesini sağlar.
export const droneStats = {
    subscribe: _droneStats.subscribe
};

const topics = [
    {name: 'state', messageType: 'mavros_msgs/State' },
    {name: 'battery', messageType: 'sensor_msgs/BatteryState' },
    {name: 'global_position/global', messageType: 'sensor_msgs/NavSatFix' },
    {name: 'local_position/pose', messageType: 'geometry_msgs/PoseStamped' },
    {name: 'local_position/velocity_local', messageType: 'geometry_msgs/TwistStamped'},
    // {name: 'global_position/rel_alt', messageType: 'std_msgs/Float64'}
]

function updateDrones(ros) {
    _droneStats.update(drones => {
    return drones.map((drone, i) => {
        const newDrone = new DroneStatus();
        topics.forEach((topic) => {
            const activeTopic = new ROSLIB.Topic({
                ros,
                name: `drone${i+1}/mavros/${topic.name}`,
                messageType: topic.messageType
            });

            activeTopic.subscribe((message) => {
                _droneStats.update(ds => {
                    const updated = [...ds];
                    const current = updated[i];

                    switch (topic.name) {
                        case 'state':
                            current.status.state = {
                                connected: message.connected,
                                armed: message.armed,
                                guided: message.guided,
                                mode: message.mode,
                                system_status: message.system_status
                            };
                            break;
                        case 'battery':
                            current.status.battery = message.percentage;
                            break;
                        case 'global_position/global':
                            current.status.position.global = {
                                latitude: message.latitude,
                                longitude: message.longitude,
                                altitude: message.altitude
                            };
                            break;
                        case 'local_position/pose':
                            current.status.position.local = {
                                x: message.pose.position.x,
                                y: message.pose.position.y,
                                z: message.pose.position.z,
                                w: null
                            };
                            current.status.orientation = {
                                x: message.pose.orientation.x,
                                y: message.pose.orientation.y,
                                z: message.pose.orientation.z,
                                w: message.pose.orientation.w
                            };
                            break;
                        case 'local_position/velocity_local':
                            const vx = message.twist.linear.x;
                            const vy = message.twist.linear.y;
                            const vz = message.twist.linear.z;
                            const speed = Math.sqrt(vx*vx + vy*vy + vz*vz).toFixed(2);
                            current.status.velocity = {vx,vy,vz,speed};
                    }

                    return updated;
                });
            });
        });

        return newDrone;
    });
});
}

// ROS bağlantısı için gerekli komutları çalıştırın:
// roslaunch rosbridge_server rosbridge_websocket.launch
ros.on('connection', () => {
    console.log('Connected to ROS');
    updateDrones(ros)
});

ros.on('error', (err) => {
    console.error('ROS connection error:', err);
});

ros.on('close', () => {
    console.warn('ROS connection closed');

});

export const rosStore = writable(ros);