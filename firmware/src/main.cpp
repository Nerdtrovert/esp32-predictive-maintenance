#include <Prajwal_Navada-project-1_inferencing.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>

// ================== PINS ==================
#define DHTPIN 4
#define DHTTYPE DHT11

const int LED_PIN = 2;
const int RELAY_PIN = 5;

// ================== WiFi & MQTT ==================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "thingsboard.cloud";
const int mqtt_port = 1883;
const char* mqtt_token = "lwcqr7074prjvkukkudr";

WiFiClient espClient;
PubSubClient client(espClient);

DHT dht(DHTPIN, DHTTYPE);
Adafruit_MPU6050 mpu;

// Moving Average
const int WINDOW_SIZE = 10;
float tempHistory[WINDOW_SIZE];
int historyIndex = 0;

unsigned long lastMsg = 0;

void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  if (msg.indexOf("true") != -1) digitalWrite(RELAY_PIN, LOW);
  else digitalWrite(RELAY_PIN, HIGH);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  Wire.begin(21, 22);
  dht.begin();
  mpu.begin();

  float initTemp = dht.readTemperature();
  for(int i=0; i<WINDOW_SIZE; i++) tempHistory[i] = initTemp;

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  client.subscribe("v1/devices/me/rpc/request/+");

  Serial.println("=== Full Predictive Edge AI System Ready ===\n");
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32_Predictive", mqtt_token, NULL)) {
      client.subscribe("v1/devices/me/rpc/request/+");
    } else delay(2000);
  }
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  if (millis() - lastMsg > 2500) {
    lastMsg = millis();

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    // Moving Average + Prediction
    tempHistory[historyIndex] = t;
    historyIndex = (historyIndex + 1) % WINDOW_SIZE;
    float avgTemp = 0;
    for(int i=0; i<WINDOW_SIZE; i++) avgTemp += tempHistory[i];
    avgTemp /= WINDOW_SIZE;

    float predictedTemp = t + (t - avgTemp) * 2.0;

    // ================== TinyML - SAME LOGIC AS YOUR WORKING CODE ==================
    float buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE] = {0};
    Serial.println("Sampling for TinyML...");

    for (size_t i = 0; i < EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE; i += EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME) {
      
      sensors_event_t a2, g2, temp2;
      mpu.getEvent(&a2, &g2, &temp2);
      
      float t2 = dht.readTemperature();
      float h2 = dht.readHumidity();
      float rms = sqrt((a2.acceleration.x*a2.acceleration.x + 
                        a2.acceleration.y*a2.acceleration.y + 
                        a2.acceleration.z*a2.acceleration.z) / 3.0);

      buffer[i]   = t2;
      buffer[i+1] = h2;
      buffer[i+2] = a2.acceleration.x;
      buffer[i+3] = a2.acceleration.y;
      buffer[i+4] = a2.acceleration.z;
      buffer[i+5] = rms;

      delayMicroseconds(100000 / EI_CLASSIFIER_FREQUENCY);
    }

    signal_t signal;
    numpy::signal_from_buffer(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);
    ei_impulse_result_t result = {0};
    run_classifier(&signal, &result, false);

    // Decision
    bool anomaly_ml = (result.anomaly > 75);

    bool final_anomaly = anomaly_ml || (t > 32.5 || predictedTemp > 34.0);

    digitalWrite(RELAY_PIN, final_anomaly ? LOW : HIGH);
    digitalWrite(LED_PIN, final_anomaly);

    Serial.printf("Temp: %.1f | Pred: %.1f | AnomalyScore: %.2f | %s\n", 
                  t, predictedTemp, result.anomaly, final_anomaly ? "ANOMALY" : "Normal");

    // Send to Cloud
    char msg[400];
    snprintf(msg, sizeof(msg),
      "{\"temperature\":%.1f,\"predicted_temp\":%.1f,\"anomaly_score\":%.2f,\"anomaly\":%s}",
      t, predictedTemp, result.anomaly, final_anomaly ? "true" : "false");

    client.publish("v1/devices/me/telemetry", msg);
  }
}