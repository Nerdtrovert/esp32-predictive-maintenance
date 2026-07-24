#include "ActuatorManager.h"
#include "Config.h"

ActuatorManager::ActuatorManager() : relayClosed(false), alarmActive(false) {}

void ActuatorManager::begin() {
    pinMode(LED_PIN, OUTPUT);
    pinMode(RELAY_PIN, OUTPUT);
    
    // Deactivate relay initially (active-low)
    digitalWrite(RELAY_PIN, HIGH);
    digitalWrite(LED_PIN, LOW);
}

void ActuatorManager::setRelayState(bool closed) {
    relayClosed = closed;
    // Active-low relay: LOW closed/on, HIGH open/off
    digitalWrite(RELAY_PIN, closed ? LOW : HIGH);
}

void ActuatorManager::setAlarmState(bool active) {
    alarmActive = active;
    digitalWrite(LED_PIN, active ? HIGH : LOW);
}
