#include "NetworkManager.h"
#include "Config.h"

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
        
        Serial.print("Attempting MQTT connection to ThingsBoard...");
        if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_TOKEN, nullptr)) {
            Serial.println("connected");
            mqttClient.subscribe("v1/devices/me/rpc/request/+");
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
    
    return mqttClient.publish("v1/devices/me/telemetry", payload);
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
