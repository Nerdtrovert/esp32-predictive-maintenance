#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>
#include <DHT.h>

// ================== Hardware Pins ==================
#define DHTPIN 4
const int LED_PIN = 2;
const int RELAY_PIN = 5;

// MPU6050 I2C Pins
const int I2C_SDA_PIN = 21;
const int I2C_SCL_PIN = 22;

// ================== Sensor Config ==================
#define DHTTYPE DHT11
const int WINDOW_SIZE = 10;

// ================== Network Configuration ==================
const char* const WIFI_SSID = "TP-Link_9240";
const char* const WIFI_PASSWORD = "Act@2026";

// Set MQTT_SERVER to your broker host/IP reachable by ESP32 and backend.
const char* const MQTT_SERVER = "broker.hivemq.com";
const int MQTT_PORT = 1883;
const char* const MQTT_USERNAME = "";
const char* const MQTT_PASSWORD = "";
const char* const MQTT_CLIENT_ID = "Machine_Hawk_Predictive";
const char* const MQTT_TELEMETRY_TOPIC = "machine-hawk/telemetry/1";
const char* const MQTT_RPC_TOPIC = "machine-hawk/rpc/1";

// Telemetry & Intervals
const unsigned long TELEMETRY_INTERVAL_MS = 2500;
const unsigned long RECONNECT_DELAY_MS = 2000;
const long SERIAL_BAUD_RATE = 115200;

// ================== Anomaly Detection Thresholds ==================
const float TEMP_THRESHOLD = 28.0f;
const float PRED_TEMP_THRESHOLD = 30.0f;
const float ML_ANOMALY_THRESHOLD = 75.0f;

#endif // CONFIG_H
