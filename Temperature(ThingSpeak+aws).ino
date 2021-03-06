#include <OneWire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DallasTemperature.h>
#include <WiFiClientSecure.h>
#include "wifi_account.h"
#define ONE_WIRE_BUS D7
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);

const char *key="/update?api_key=WA25FHJVSIC7LOVI&field1=";
const char* host = "api.thingspeak.com";
const char* ssid = wifiid;
const char* pass = wifipasswd;
const char* apiKey = "WA25FHJVSIC7LOVI";
const char* resource = "/update?api_key=";
const char* server = "api.thingspeak.com";
char temperatureString[6];
int cnt=1;
void setup(void)  
{  
    Serial.begin(9600);
    WiFi.begin(ssid,pass);

    while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
    }
   
   
}  
    
float getTemperature() {
  float temp;
  DS18B20.requestTemperatures(); 
  temp = DS18B20.getTempCByIndex(0);
  return temp;
}
    
void loop(void)  
{   
    float temperature = getTemperature();
    
    dtostrf(temperature, 2, 2, temperatureString);
    //Serial.println(temperatureString);
    //Serial.println(temperatureString);

    WiFiClient client;
    const int httpPort = 80;
   
    Serial.println(temperatureString);
    if(cnt%2==0){
      if (!client.connect("api.thingspeak.com", httpPort)) {
      Serial.println("connection failed");
       return;
      }
      String url="/update?api_key=WA25FHJVSIC7LOVI&field1=";
      client.print(String("GET ") + url +temperatureString + " HTTP/1.1\r\n" +
                 "Host: " + host + "\r\n" +
                 "User-Agent: BuildFailureDetectorESP8266\r\n" +
                 "Connection: close\r\n\r\n");
    }
    else{
      if(!client.connect("18.223.102.79",9000)){
        Serial.println("aws server is not connected.");
        return;
      }
      String url="http://18.223.102.79:9000/log?value=";
      client.print(String("GET ")+url+temperatureString+" HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" +
               "User-Agent: BuildFailureDetectorESP8266\r\n" +
               "Connection: close\r\n\r\n");
    }
              
    while(!!!client.available()){
      Serial.print("Client is not available now\n");
    }
    cnt++;
    delay(59500);
  
}  
