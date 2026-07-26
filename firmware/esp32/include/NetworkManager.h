#ifndef NETWORK_MANAGER_H
#define NETWORK_MANAGER_H

#include <WiFi.h>
#include <PubSubClient.h>
#include <functional>

class NetworkManager {
public:
    typedef std::function<void(const String& topic, const String& payload)> MessageCallback;

    NetworkManager();
    void begin(MessageCallback callback);
    void loop();
    bool isConnected();
    bool publishTelemetry(float temp, float predTemp, float anomalyScore, bool anomaly);

private:
    WiFiClient espClient;
    PubSubClient mqttClient;
    MessageCallback onMessageReceived;

    void connectWiFi();
    void reconnectMQTT();
    static void mqttCallback(char* topic, byte* payload, unsigned int length);

    static NetworkManager* instance;

    // WiFi connection tracking
    unsigned long lastWiFiAttempt;
    bool wifiConnectInProgress;

    // MQTT connection tracking
    unsigned long lastMqttAttempt;
    bool mqttConnectInProgress;
};

#endif // NETWORK_MANAGER_H
