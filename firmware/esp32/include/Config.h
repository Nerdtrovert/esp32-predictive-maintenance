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

const char* const MQTT_SERVER = "thingsboard.cloud";
const int MQTT_PORT = 1883;
const char* const MQTT_TOKEN = "lwcqr7074prjvkukkudr";
const char* const MQTT_CLIENT_ID = "Machine_Hawk_Predictive";

// Telemetry & Intervals
const unsigned long TELEMETRY_INTERVAL_MS = 2500;
const unsigned long RECONNECT_DELAY_MS = 2000;
const long SERIAL_BAUD_RATE = 115200;

// ================== Anomaly Detection Thresholds ==================
const float TEMP_THRESHOLD = 32.5f;
const float PRED_TEMP_THRESHOLD = 34.0f;
const float ML_ANOMALY_THRESHOLD = 75.0f;

#endif // CONFIG_H
