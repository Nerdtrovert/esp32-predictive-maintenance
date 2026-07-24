#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include <Adafruit_MPU6050.h>
#include <DHT.h>
#include "Config.h"

class SensorManager {
public:
    SensorManager();
    bool begin();
    void sample();

    float getTemperature() const { return currentTemp; }
    float getHumidity() const { return currentHumidity; }
    float getPredictedTemperature() const { return predictedTemp; }
    void getAcceleration(float& x, float& y, float& z) const;
    float getRMSAcceleration() const { return currentRMS; }

    DHT& getDHT() { return dht; }
    Adafruit_MPU6050& getMPU() { return mpu; }

private:
    DHT dht;
    Adafruit_MPU6050 mpu;

    float tempHistory[WINDOW_SIZE];
    int historyIndex;

    float currentTemp;
    float currentHumidity;
    float currentAx;
    float currentAy;
    float currentAz;
    float currentRMS;
    float predictedTemp;

    void updateMovingAverageAndPrediction(float newTemp);
};

#endif // SENSOR_MANAGER_H
