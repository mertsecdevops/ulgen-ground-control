# ÜLGEN - Ground Control Arayüzü

<img width="1640" height="720" alt="Yeni Proje (1)" src="https://github.com/user-attachments/assets/e2502a40-086c-4354-8ba2-4eabb4133ad5" />


## Kodu Bilgisayarınıza Klonlama
Arayüzü klonlamak için önce GitHub'daki organizasyona dahil olmanız gerekli, dahil olmak için bana yazın, kullanıcı adınıza davet atayım.

Eğer erişiminiz varsa, istediğiniz bir klasörde terminal açın ve,
1.  Kodu klonlayın
	```shell
	git clone https://github.com/ULGEN-Suru-IHA-Takimi/ground-control.git
	```
2. Kodun klasörüne girin
	```shell
	cd ground-control
	```
3. Gereksinimleri kurun
	```shell
	npm install && pip install digi.xbee websockets
	```
4. Kodu çalıştırın
	```shell
	npm run dev
	```
	Bu satır arayüzü çalıştırır.
	```shell
	python xbee_handler/main.py
	```
	Burada ise XBee iletişimi çalışır ve aktif dronlar ekrana gelir.
