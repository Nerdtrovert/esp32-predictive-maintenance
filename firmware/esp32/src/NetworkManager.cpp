#include "NetworkManager.h"
#include "Config.h"
#include <cstring>

NetworkManager* NetworkManager::instance = nullptr;

NetworkManager::NetworkManager() : mqttClient(espClient), lastWiFiAttempt(0), wifiConnectInProgress(false), lastMqttAttempt(0) {
    instance = this;
}

void NetworkManager::begin(MessageCallback callback) {
    onMessageReceived = callback;
    // Ensure WiFi is started but not connected yet
    WiFi.mode(WIFI_STA);
    // Start connection attempt
    connectWiFi();

    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
}

void NetworkManager::connectWiFi() {
    // If already connected, do nothing
    if (WiFi.status() == WL_CONNECTED) {
        wifiConnectInProgress = false;
        return;
    }

    // If we are not currently trying to connect, or if it's been too long since last attempt, try again
    unsigned long now = millis();
    if (!wifiConnectInProgress && (now - lastWiFiAttempt > 10000)) { // 10 second interval between attempts
        wifiConnectInProgress = true;
        lastWiFiAttempt = now;
        Serial.print("Connecting to Wi-Fi: ");
        Serial.println(WIFI_SSID);
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        // Note: WiFi.begin is non-blocking. We will check connection status in loop via isConnected() or by checking WiFi.status()
    }
    // If we are already in the process of connecting, do nothing and let the WiFi stack continue
}

void NetworkManager::reconnectMQTT() {
    // Only attempt MQTT connection if WiFi is connected
    if (WiFi.status() == WL_CONNECTED) {
        // If enough time has passed since last attempt, try to connect
        unsigned long now = millis();
        if (now - lastMqttAttempt > 10000) { // 10 second interval between attempts
            lastMqttAttempt = now;

            // Generate unique client ID based on MAC address
            String clientIdBase = "Machine_Hawk_";
            String mac = WiFi.macAddress();
            mac.replace(":", "");
            String clientId = clientIdBase + mac;

            Serial.print("Attempting MQTT connection with client ID: ");
            Serial.println(clientId);
            bool connected = false;
            if (std::strlen(MQTT_USERNAME) > 0) {
                const char* passwordPtr = std::strlen(MQTT_PASSWORD) > 0 ? MQTT_PASSWORD : nullptr;
                connected = mqttClient.connect(clientId.c_str(), MQTT_USERNAME, passwordPtr);
            } else {
                connected = mqttClient.connect(clientId.c_str());
            }

            if (connected) {
                Serial.println("connected");
                mqttClient.subscribe(MQTT_RPC_TOPIC);
                // Reset the attempt timer on success? We'll let the timer continue; next attempt will be in 10s anyway.
                // But we might want to reset to avoid immediate re-attempt? Actually we want to keep the connection alive;
                // the MQTT client's internal keepalive will handle that. We don't need to call connect again if already connected.
                // However, we will still check every loop; but since mqttClient.connected() will be true, we won't call reconnectMQTT.
                // So it's fine.
            } else {
                Serial.print("failed, rc=");
                Serial.print(mqttClient.state());
                Serial.println(" will retry later");
            }
        }
        // If not enough time has passed, do nothing (wait for next interval)
    }
    // If WiFi is not connected, do nothing; will try again later when WiFi is up
}

void NetworkManager::loop() {
    // Always try to maintain WiFi connection
    connectWiFi();

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