#ifndef ACTUATOR_MANAGER_H
#define ACTUATOR_MANAGER_H

class ActuatorManager {
public:
    ActuatorManager();
    void begin();
    
    void setRelayState(bool closed);
    void setAlarmState(bool active);
    
    bool isRelayClosed() const { return relayClosed; }
    bool isAlarmActive() const { return alarmActive; }

private:
    bool relayClosed;
    bool alarmActive;
};

#endif // ACTUATOR_MANAGER_H
