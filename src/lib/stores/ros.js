// src/lib/stores/ros.js
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

const drones = [
    new DroneStatus(),
    new DroneStatus(),
    new DroneStatus(),
    new DroneStatus()
]

const topics = [
    {
        name: 'state',
        messageType: 'mavros_msgs/State'
    },
    {
        name: 'battery',
        messageType: 'sensor_msgs/BatteryState'
    },
    {
        name: 'global_position/global',
        messageType: 'sensor_msgs/NavSatFix'
    },
    {
        name: 'local_position/pose',
        messageType: 'geometry_msgs/PoseStamped'
    },
]

function updateDrones(ros) {
    drones.forEach((drone, i) => {
        console.log(`🚁 drone${i+1} durumu güncelleniyor...`);
        topics.forEach((topic) => {
            const activeTopic = new ROSLIB.Topic({
                ros: ros,
                name: `drone${i+1}/mavros/${topic.name}`,
                messageType: topic.messageType
            });
            console.log(`Abone olunuyor: ${activeTopic.name}`);
            activeTopic.subscribe((message) => {
                try {
                    switch (topic.name) {
                        case 'state':
                            drone.status.state.connected = message.connected;
                            drone.status.state.armed = message.armed;
                            drone.status.state.guided = message.guided;
                            drone.status.state.mode = message.mode;
                            drone.status.state.system_status = message.system_status;
                            break;
                        case 'battery':
                            drone.status.battery = message.percentage;
                            break;
                        case 'global_position/global':
                            drone.status.position.global.latitude = message.latitude;
                            drone.status.position.global.longitude = message.longitude;
                            drone.status.position.global.altitude = message.altitude;
                            break;
                        case 'local_position/pose':
                            drone.status.position.local.x = message.pose.position.x;
                            drone.status.position.local.y = message.pose.position.y;
                            drone.status.position.local.z = message.pose.position.z;
                            drone.status.orientation.x = message.pose.orientation.x;
                            drone.status.orientation.y = message.pose.orientation.y;
                            drone.status.orientation.z = message.pose.orientation.z;
                            drone.status.orientation.w = message.pose.orientation.w;
                            break;
                        default:
                            console.warn(`Unknown topic: ${topic.name}`);
                    }
                    } catch (error) {
                        console.error(`Error parsing ${topic.name} message for Drone ${i+1}:`, error);
                    }
                }
            );
        });
    });
}

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