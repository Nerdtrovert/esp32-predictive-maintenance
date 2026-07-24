#include <Arduino.h>
#include "Config.h"
#include "SensorManager.h"
#include "ClassifierManager.h"
#include "ActuatorManager.h"
#include "NetworkManager.h"

// Instantiate Managers
SensorManager sensorMgr;
ClassifierManager classifierMgr;
ActuatorManager actuatorMgr;
NetworkManager networkMgr;

unsigned long lastTelemetryTime = 0;

// Callback to handle remote control RPCs from ThingsBoard
void handleCloudCommand(const String& topic, const String& payload) {
    Serial.printf("Cloud RPC Received. Topic: %s | Payload: %s\n", topic.c_str(), payload.c_str());
    
    // Toggle relay based on RPC payload containing "true" or "false"
    if (payload.indexOf("true") != -1) {
        actuatorMgr.setRelayState(true); // Close relay / activate device
        Serial.println("Relay CLOSED (activated) via remote RPC.");
    } else {
        actuatorMgr.setRelayState(false); // Open relay / deactivate device
        Serial.println("Relay OPENED (deactivated) via remote RPC.");
    }
}

void setup() {
    Serial.begin(SERIAL_BAUD_RATE);
    delay(1000);
    Serial.println("=== Machine Hawk Predictive Maintenance System Starting ===");

    // Initialize physical actuators
    actuatorMgr.begin();

    // Initialize sensors
    if (!sensorMgr.begin()) {
        Serial.println("CRITICAL ERROR: Failed to initialize sensors! System halting.");
        while (1) {
            actuatorMgr.setAlarmState(true);
            delay(200);
            actuatorMgr.setAlarmState(false);
            delay(200);
        }
    }

    // Initialize Wi-Fi and MQTT Cloud integration
    networkMgr.begin(handleCloudCommand);

    Serial.println("=== Machine Hawk System Initialization Complete. Ready! ===\n");
}

void loop() {
    // Process network tasks and keep connection alive
    networkMgr.loop();

    // Perform periodic diagnostics and telemetry reporting
    if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
        lastTelemetryTime = millis();

        // 1. Sample latest environmental & motion metrics
        sensorMgr.sample();
        float currentTemp = sensorMgr.getTemperature();
        float predictedTemp = sensorMgr.getPredictedTemperature();

        // 2. Run Edge AI / TinyML anomaly detection
        float anomalyScore = classifierMgr.runInference(sensorMgr.getDHT(), sensorMgr.getMPU());

        // 3. Evaluate safety rules & ML decision
        bool anomalyML = (anomalyScore > ML_ANOMALY_THRESHOLD);
        bool finalAnomaly = anomalyML || (currentTemp > TEMP_THRESHOLD || predictedTemp > PRED_TEMP_THRESHOLD);

        // 4. Actuate alerts & protection mechanisms
        actuatorMgr.setAlarmState(finalAnomaly);
        
        // If an anomaly is locally triggered, trip the safety isolation relay.
        // Otherwise, it can remain controlled by remote RPC or default to safe state.
        if (finalAnomaly) {
            actuatorMgr.setRelayState(true); // Active-low pin goes LOW, safety trip
        } else {
            actuatorMgr.setRelayState(false); // Default safe status
        }

        // 5. Console diagnostics
        Serial.printf("Temp: %.1f°C | Forecast: %.1f°C | ML Anomaly Score: %.2f | State: %s\n", 
                      currentTemp, predictedTemp, anomalyScore, finalAnomaly ? "ANOMALY DETECTED" : "NORMAL");

        // 6. Synchronize diagnostics with ThingsBoard
        networkMgr.publishTelemetry(currentTemp, predictedTemp, anomalyScore, finalAnomaly);
    }
}