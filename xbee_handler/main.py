import threading
import time
import logging
from queue import Queue, Full
import functools
import json

from digi.xbee.devices import XBeeDevice
from digi.xbee.exception import XBeeException, TransmitException, TimeoutException, InvalidOperatingModeException

import asyncio
import websockets

# Global WebSocket bağlantıları
connected_clients = set()
event_loop = None  # <-- asyncio event loop burada tutulur

def check_connected(func):
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        if not self.device.is_open():
            logging.error("XBee cihazı açık değil.")
            return None
        return func(self, *args, **kwargs)
    return wrapper

class XBeeListener:
    def __init__(self, message_received_callback, port="/dev/ttyUSB0", baudrate=57600, max_queue_size=200):
        self.port = port
        self.baudrate = baudrate
        self.device = XBeeDevice(port, baudrate)
        self.device.open()
        self.address = self.device.get_64bit_addr()
        self.message_received_callback = message_received_callback
        self.recent_messages = Queue(maxsize=max_queue_size)
        self.queue_stop_event = threading.Event()

        if self.message_received_callback:
            threading.Thread(target=self.queue_processor, daemon=True).start()
            logging.warning("Mesaj kuyruğu işleme thread'i başlatıldı.")
        else:
            logging.warning("Mesaj alındığında çağrılacak callback fonksiyonu belirtilmemiş.")
    
    def queue_processor(self):
        while not self.queue_stop_event.is_set():
            if self.recent_messages.empty():
                time.sleep(0.1)
                continue
            message = self.recent_messages.get(timeout=0.5)
            logging.info(f"Mesaj işleniyor: {message}")
            self.message_received_callback(message)
            self.recent_messages.task_done()
    
    def default_message_received_callback(self, message):
        """
        Xbee'den gelen mesajları işleyen callback fonksiyonu.
        """
        try:
            message_data = message.data.decode('utf-8')
            sender = int.from_bytes(message.remote_device.get_64bit_addr().address, "big")
            message_full = {
                "sender": f"{sender:016X}",
                "isBroadcast": message.is_broadcast,
                "data": message_data,
                "timestamp": message.timestamp,
            }
            logging.info(f"Mesaj alındı: {message_full}")
            try:
                self.recent_messages.put_nowait(message_full)
                logging.info("Mesaj kuyruğa eklendi")
            except Full:
                logging.error(f"Mesaj kuyruğa eklenemedi, kuyruk dolu.")
                # Kuyruk doluysa en eski mesajı sil ve yeni mesajı ekle
                logging.info("En eski mesaj siliniyor ve yeni mesaj ekleniyor.")
                self.recent_messages.get_nowait()
                self.recent_messages.put_nowait(message_full)
        except Exception as e:
            logging.error(f"Mesaj işlenirken hata oluştu: {e}")

    def listen(self):
        try:
            if not self.device.is_open():
                self.device.open()
                self.address = self.device.get_64bit_addr()
            self.device.add_data_received_callback(self.default_message_received_callback)
            logging.info("XBee dinleniyor...")
        except Exception as e:
            logging.error(f"XBee açılamadı: {e}")
            raise
    
    @check_connected
    def send_broadcast_message(self, data, construct_message=False):
        try:
            message = data
            self.device.send_data_broadcast(message)
            logging.info(f"Broadcast gönderildi: {data}")
            return True
        except (XBeeException, TimeoutException, TransmitException, InvalidOperatingModeException) as e:
            logging.error(f"XBee gönderim hatası: {e}")
            return False

    def close(self):
        if self.device.is_open():
            self.device.close()
            self.queue_stop_event.set()
            logging.info("XBee ve kuyruk thread'i kapatıldı.")

# WebSocket handler
async def ws_handler(websocket):
    logging.info("Yeni WebSocket bağlantısı kabul edildi.")
    connected_clients.add(websocket)
    try:
        while True:
            message = await websocket.recv()
            logging.info(f"WebSocket mesajı alındı: {message}")
            await websocket.send(f"Mesaj alındı: {message}")
    except websockets.ConnectionClosed:
        logging.info("WebSocket bağlantısı kapatıldı.")
    finally:
        connected_clients.remove(websocket)

# Broadcast fonksiyonu
async def broadcast_message_to_websocket(message: str):
    disconnected = set()
    for websocket in connected_clients:
        try:
            await websocket.send(json.dumps(message))
        except:
            disconnected.add(websocket)
    for ws in disconnected:
        connected_clients.remove(ws)

# XBee'den gelen mesaj callback'i
def message_received_callback(message):
    global event_loop
    if event_loop:
        event_loop.call_soon_threadsafe(
            asyncio.create_task, broadcast_message_to_websocket(message)
        )
        logging.info(f"WebSocket dinleyicilerine mesaj gönderildi: {message}")
    else:
        logging.error("Event loop tanımlı değil!")

# Main async fonksiyonu
async def main():
    global event_loop
    event_loop = asyncio.get_running_loop()

    # XBee başlat
    xbee = XBeeListener(port="/dev/ttyUSB1", message_received_callback=message_received_callback)
    xbee.listen()

    # WebSocket sunucusunu başlat
    await websockets.serve(ws_handler, "localhost", 8765)
    logging.info("WebSocket sunucusu ws://localhost:8765 üzerinden çalışıyor.")

    try:
        while True:
            await asyncio.sleep(15)
            # xbee.send_broadcast_message("pattes")
    except KeyboardInterrupt:
        logging.info("Kapatılıyor...")
        xbee.close()

# Giriş noktası
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
