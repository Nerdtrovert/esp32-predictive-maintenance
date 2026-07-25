#include "NetworkManager.h"
#include "Config.h"
#include <cstring>

NetworkManager* NetworkManager::instance = nullptr;

NetworkManager::NetworkManager() : mqttClient(espClient) {
    instance = this;
}

void NetworkManager::begin(MessageCallback callback) {
    onMessageReceived = callback;
    connectWiFi();
    
    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
}

void NetworkManager::connectWiFi() {
    if (WiFi.status() == WL_CONNECTED) return;
    
    Serial.print("Connecting to Wi-Fi: ");
    Serial.println(WIFI_SSID);
    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWi-Fi Connected!");
}

void NetworkManager::reconnectMQTT() {
    while (!mqttClient.connected()) {
        connectWiFi();
        
        Serial.print("Attempting MQTT connection...");
        bool connected = false;
        if (std::strlen(MQTT_USERNAME) > 0) {
            const char* passwordPtr = std::strlen(MQTT_PASSWORD) > 0 ? MQTT_PASSWORD : nullptr;
            connected = mqttClient.connect(MQTT_CLIENT_ID, MQTT_USERNAME, passwordPtr);
        } else {
            connected = mqttClient.connect(MQTT_CLIENT_ID);
        }

        if (connected) {
            Serial.println("connected");
            mqttClient.subscribe(MQTT_RPC_TOPIC);
        } else {
            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" try again in 2 seconds");
            delay(RECONNECT_DELAY_MS);
        }
    }
}

void NetworkManager::loop() {
    if (!mqttClient.connected()) {
        reconnectMQTT();
    }
    mqttClient.loop();
}

bool NetworkManager::isConnected() {
    return WiFi.status() == WL_CONNECTED && mqttClient.connected();
}

bool NetworkManager::publishTelemetry(float temp, float predTemp, float anomalyScore, bool anomaly) {
    if (!mqttClient.connected()) return false;
    
    char payload[256];
    snprintf(payload, sizeof(payload),
             "{\"temperature\":%.1f,\"predicted_temp\":%.1f,\"anomaly_score\":%.2f,\"anomaly\":%s}",
             temp, predTemp, anomalyScore, anomaly ? "true" : "false");
             
    Serial.print("Publishing telemetry: ");
    Serial.println(payload);
    
    return mqttClient.publish(MQTT_TELEMETRY_TOPIC, payload);
}

void NetworkManager::mqttCallback(char* topic, byte* payload, unsigned int length) {
    if (instance && instance->onMessageReceived) {
        String topicStr(topic);
        String payloadStr;
        for (unsigned int i = 0; i < length; i++) {
            payloadStr += (char)payload[i];
        }
        instance->onMessageReceived(topicStr, payloadStr);
    }
}
