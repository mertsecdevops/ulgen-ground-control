# ÜLGEN - Ground Control Interface

<table>
  <tr>
    <td align="center" width="50%">
      <img width="1640" height="720" alt="New Project (1)" src="https://github.com/user-attachments/assets/e2502a40-086c-4354-8ba2-4eabb4133ad5" />
    </td>
    <td align="center" width="50%">
      <figure>
        <video src="https://github.com/user-attachments/assets/c7b3f3f1-60f4-4cf8-9870-510879be3055" width="100%" controls></video>
        <figcaption>Showcase</figcaption>
      </figure>
    </td>
  </tr>
</table>

This ground control software was used by ÜLGEN team, who won 6th place in TEKNOFEST Swarm UAV Comptetion in 2025. Built fully on Svelte, along with Python for XBee communication.

> [!IMPORTANT]
> I should mention: I coded both [drone-core](https://github.com/yussufbiyik/ulgen-drone-core) and the GCS alone in ~2 months, including a 2.5 week period with one eye swollen shut. Code quality declines towards the end, but it was field-tested and brought us 6th place.

## Cloning the Code to Your Computer
To clone the interface, you first need to be a part of the organization on GitHub. Message me to join, and I will send an invitation to your username.

If you have access, open a terminal in your desired folder and:
1. Clone the code
	```shell
	git clone [https://github.com/ULGEN-Suru-IHA-Takimi/ground-control.git](https://github.com/ULGEN-Suru-IHA-Takimi/ground-control.git)
	```
2. Navigate to the code directory
	```shell
	cd ground-control
	```
3. Install the dependencies
	```shell
	npm install && pip install digi.xbee websockets
	```
4. Run the code
	```shell
	npm run dev
	```
	This line runs the interface.
	```shell
	python xbee_handler/main.py
	```
	This runs the XBee communication, and active drones will appear on the screen.
