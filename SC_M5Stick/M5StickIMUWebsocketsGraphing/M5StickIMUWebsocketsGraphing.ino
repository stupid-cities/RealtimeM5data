/* M5StickIMUWebsockets
 *
 *  Created on: 18.02.20 by Dave Webb @crispysmokedweb
 *  Based on https://github.com/Links2004/arduinoWebSockets
 *  and the M5Stick IMU example
 *  
 *  Created for Stupid Cities, a Little Lost Robot production
 *
 */

#include <M5StickC.h>


#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>

#include <WebSocketsClient.h>


WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

float accX = 0.0F;
float accY = 0.0F;
float accZ = 0.0F;

float gyroX = 0.0F;
float gyroY = 0.0F;
float gyroZ = 0.0F;

float pitch = 0.0F;
float roll  = 0.0F;
float yaw   = 0.0F;

boolean connected=false;
byte mac[6];                     // the MAC address of your Wifi shield
int myID = -1;
String myIDs = "--";

#define USE_SERIAL Serial

void hexdump(const void *mem, uint32_t len, uint8_t cols = 16) {
  const uint8_t* src = (const uint8_t*) mem;
  USE_SERIAL.printf("\n[HEXDUMP] Address: 0x%08X len: 0x%X (%d)", (ptrdiff_t)src, len, len);
  for(uint32_t i = 0; i < len; i++) {
    if(i % cols == 0) {
      USE_SERIAL.printf("\n[0x%08X] 0x%08X: ", (ptrdiff_t)src, i);
    }
    USE_SERIAL.printf("%02X ", *src);
    src++;
  }
  USE_SERIAL.printf("\n");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

  switch(type) {
    case WStype_DISCONNECTED:
      USE_SERIAL.printf("[WSc] Disconnected!\n");
      connected=false;
      myIDs = "--";
      updateM5();
      break;
    case WStype_CONNECTED:
      USE_SERIAL.printf("[WSc] Connected to url: %s\n", payload);
      connected=true;
      // send message to server when Connected
      webSocket.sendTXT("Connected");
      updateM5();
      break;
    case WStype_TEXT:
      USE_SERIAL.printf("[WSc] get text: %s\n", payload);
      checkForID((char*)payload);
      // send message to server
      // webSocket.sendTXT("message here");
      break;
    case WStype_BIN:
      USE_SERIAL.printf("[WSc] get binary length: %u\n", length);
      hexdump(payload, length);

      // send data to server
      // webSocket.sendBIN(payload, length);
      break;
    case WStype_ERROR:      
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      break;
  }

}

void setup() {
  M5.begin();
  // USE_SERIAL.begin(921600);
  USE_SERIAL.begin(115200);

  //Serial.setDebugOutput(true);
  USE_SERIAL.setDebugOutput(true);

  USE_SERIAL.println();
  USE_SERIAL.println();
  USE_SERIAL.println();

  for(uint8_t t = 4; t > 0; t--) {
    USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextColor(0x00, 0x51d);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setTextSize(1);
  M5.Lcd.setCursor(0, 0);
  M5.Lcd.println("Stupid Cities Motion Viz");
  M5.Lcd.setCursor(0, 10);
  M5.Lcd.setTextColor(0xFF, 0x00);
  M5.Lcd.println("Waiting for WiFi ...");
  WiFiMulti.addAP("Crispy", "peppersalt");

  //WiFi.disconnect();
  while(WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }
  WiFi.macAddress(mac);

  // server address, port and URL
  webSocket.begin("192.168.0.102", 8011, "/");

  // event handler
  webSocket.onEvent(webSocketEvent);

  // use HTTP Basic Authorization this is optional remove if not needed
  //webSocket.setAuthorization("user", "Password");

  // try ever 5000 again if connection has failed
  webSocket.setReconnectInterval(5000);
  M5.IMU.Init();
  updateM5();
//  M5.Lcd.setRotation(3);
//  M5.Lcd.fillScreen(BLACK);
//  M5.Lcd.setTextSize(1);
//  M5.Lcd.setCursor(40, 0);
//  M5.Lcd.println("IMU TEST");
//  M5.Lcd.setCursor(0, 10);
//  M5.Lcd.println(connected?"Connected":"disconnected");
//  M5.Lcd.setCursor(0, 20);
//  M5.Lcd.print("MAC: ");
//  M5.Lcd.print(mac[5],HEX);
//  M5.Lcd.print(":");
//  M5.Lcd.print(mac[4],HEX);
//  M5.Lcd.print(":");
//  M5.Lcd.print(mac[3],HEX);
//  M5.Lcd.print(":");
//  M5.Lcd.print(mac[2],HEX);
//  M5.Lcd.print(":");
//  M5.Lcd.print(mac[1],HEX);
//  M5.Lcd.print(":");
//  M5.Lcd.println(mac[0],HEX);
//  M5.Lcd.println("  X       Y       Z");
//  M5.Lcd.setCursor(0, 50);
//  M5.Lcd.println("  Pitch   Roll    Yaw");
  Serial.print("gRes:");
  Serial.println(M5.IMU.gRes);
  Serial.print("aRes:");
  Serial.println(M5.IMU.aRes);
}

float temp = 0;

void loop() {
  M5.IMU.getGyroData(&gyroX,&gyroY,&gyroZ);
  M5.IMU.getAccelData(&accX,&accY,&accZ);
  M5.IMU.getAhrsData(&pitch,&roll,&yaw);
  M5.IMU.getTempData(&temp);
  Serial.print("gRes:");
  Serial.println(M5.IMU.gRes*1000);
  Serial.print("aRes:");
  Serial.println(M5.IMU.aRes*1000);
//  M5.Lcd.setCursor(0, 20);
//  M5.Lcd.printf("%6.2f  %6.2f  %6.2f      ", gyroX, gyroY, gyroZ);
//  M5.Lcd.setCursor(140, 20);
//  M5.Lcd.print("o/s");
//  M5.Lcd.setCursor(0, 30);
//  M5.Lcd.printf(" %5.2f   %5.2f   %5.2f   ", accX, accY, accZ);
//  M5.Lcd.setCursor(140, 30);
//  M5.Lcd.print("G");
//  M5.Lcd.setCursor(0, 60);
//  M5.Lcd.printf(" %5.2f   %5.2f   %5.2f   ", pitch, roll, yaw);
//
//  M5.Lcd.setCursor(0, 70);
//  M5.Lcd.printf("Temperature : %.2f C", temp);
//  delay(1000);
  webSocket.loop();
//  int mr=random(1000);
//  float mf=float(mr)/100.0;
//  String sf=String(mf,3);
//  webSocket.sendTXT("message here"+sf);
  webSocket.sendTXT("GYRX"+String(gyroX,5));
  webSocket.sendTXT("GYRY"+String(gyroY,5));
  webSocket.sendTXT("GYRZ"+String(gyroZ,5));
  webSocket.sendTXT("ACCX"+String(accX,5));
  webSocket.sendTXT("ACCY"+String(accY,5));
  webSocket.sendTXT("ACCZ"+String(accZ,5));
  webSocket.sendTXT("PITC"+String(pitch,5));
  webSocket.sendTXT("ROLL"+String(roll,5));
  webSocket.sendTXT("YAWW"+String(yaw,5));
  delay(20);
}

void checkForID(String data){
  String ids;
  if(data.substring(0,3)=="WID"){
    ids=data.substring(3);
    myIDs=ids;
  }
  USE_SERIAL.printf("[WSc] myID: %s\n", ids);
  updateM5();
}

void updateM5(){
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextColor(0x00, 0x51d);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setTextSize(1);
  M5.Lcd.setCursor(0, 0);
  M5.Lcd.println("Stupid Cities Motion Viz");
  M5.Lcd.setCursor(0, 10);
  M5.Lcd.setTextColor(0xFF, 0x00);
  M5.Lcd.println(connected?"Connected":"disconnected");
  M5.Lcd.setCursor(0, 20);
  M5.Lcd.print("MAC: ");
  M5.Lcd.print(mac[0],HEX);
  M5.Lcd.print(":");
  M5.Lcd.print(mac[1],HEX);
  M5.Lcd.print(":");
  M5.Lcd.print(mac[2],HEX);
  M5.Lcd.print(":");
  M5.Lcd.print(mac[3],HEX);
  M5.Lcd.print(":");
  M5.Lcd.print(mac[4],HEX);
  M5.Lcd.print(":");
  M5.Lcd.println(mac[5],HEX);
  M5.Lcd.setCursor(0, 40);
  M5.Lcd.setTextSize(5);
  //M5.Lcd.setTextColor(0x00, 0xfbe4);
  M5.Lcd.setTextColor(0x00, 0x2589);
  M5.Lcd.println(myIDs);
}
