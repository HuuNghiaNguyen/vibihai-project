//#include <ArduinoWiFiServer.h>
//#include <BearSSLHelpers.h>
//#include <CertStoreBearSSL.h>
#include <ESP8266WiFi.h>
//#include <ESP8266WiFiAP.h>
//#include <ESP8266WiFiGeneric.h>
//#include <ESP8266WiFiGratuitous.h>
//#include <ESP8266WiFiMulti.h>
//#include <ESP8266WiFiScan.h>
//#include <ESP8266WiFiSTA.h>
//#include <ESP8266WiFiType.h>
//#include <WiFiClient.h>
//#include <WiFiClientSecure.h>
//#include <WiFiClientSecureBearSSL.h>
//#include <WiFiServer.h>
//#include <WiFiServerSecure.h>
//#include <WiFiServerSecureBearSSL.h>
//#include <WiFiUdp.h>

//#include <WiFi101.h>
#define PubNub_BASE_CLIENT WiFiClient
#include <PubNub.h>

//char publishKey[] = "pub-c-a3d37452-ad21-4fa0-93a1-de4900faa04e";
//char subscribeKey[] = "sub-c-ad92f4ea-c08c-11eb-8415-662615fc053c";
//char channel[] = "ADRUINO";

const static char ssid[] = "Redmi Note 7";
const static char pass[] = "1234567899";
const static char channel[] = "ADRUINO";
const int LED = 2;


void setup() {
  const static char publishKey[] = "pub-c-a3d37452-ad21-4fa0-93a1-de4900faa04e";
  const static char subscribeKey[] = "sub-c-ad92f4ea-c08c-11eb-8415-662615fc053c";
  
    Serial.begin(9600);
    WiFi.begin(ssid, pass);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    pinMode(LED, OUTPUT);
    pinMode(16, OUTPUT);
  
    PubNub.begin(publishKey, subscribeKey);
    
}

void loop() {


//    Serial.println("publishing a message");
//    PubNonSubClient *client = PubNub.publish(channel, "\"\\\"Hello world!\\\" from Arduino.\"",5000);
//    if (!client) {
//        Serial.println("publishing error");
//        delay(1000);
//       return;
//    }
//    while (client->connected()) {
//        while (client->connected() && !client->available());
//        char c = client->read();
//        Serial.print(c);
//    }
//    client->stop();
//    Serial.println();


    Serial.println("waiting for a message (subscribe)");
    PubSubClient *pclient = PubNub.subscribe(channel, 5000);
    if (!pclient) {
        Serial.println("subscription error");
        delay(1000);
        return;
    }
//    if (PubNub.get_last_http_status_code_class() !=PubNub::http_scc_success) { 
//      Serial.print("Got HTTP status code error fromPubNub, class: ");
//      Serial.print((int)PubNub.get_last_http_status_code_class(), DEC);
//    }
         
    while (pclient->wait_for_data()) {
        char c = pclient->read();
        Serial.println(c);
        if (c == '1') {
           Serial.println("aaaaa");
          digitalWrite(LED, 0);
          tone(16, 1000);
          delay(3000);
        }
        digitalWrite(LED, 1);
        noTone(16); 
    }
    pclient->stop();
    Serial.println();
}
