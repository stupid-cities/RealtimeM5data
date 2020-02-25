# RealtimeM5data
Collecting and processing real time IMU data from M5StickC over websockets for use in creative visualisation and audio

There are four components for this project.
* A known wifi network with fixed/reserved IP address for the *server*
* A device running node as the server/host on a fixed IP address, running webSocketServer\index.js
* A device running a browser (can be the same as the server, or not), running a webpage with a websocket connection to the server.
  Test with websocketP5test. This code assumes the websocket server is on a hard coded fixed IP.
* One or more M5StickC running the code in the M5StickIMUWebsockets.IMO

The M5 has the wifi SSID, passcode and IPaddress of the websocket host hard coded.

Start the router.

Connect the server device to the wifi and run the Node server.

power on the M5stciks running the M5StickIMUWebsockets code.

You should see data in the console where you ran the node server.

Connect the web client device to wifi and run the test or whatever client code.

### Visualisations
Added Visualisations folder
SC_IMUwebsocketsP5dataMover is a test visual to show relationship between IMU data and integrated motion
SC_IMUPlasmaBall is the first creative visualisation
