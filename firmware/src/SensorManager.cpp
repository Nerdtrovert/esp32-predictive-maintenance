#include "SensorManager.h"
#include <Wire.h>

SensorManager::SensorManager() 
    : dht(DHTPIN, DHTTYPE), historyIndex(0), currentTemp(0.0), 
      currentHumidity(0.0), currentAx(0.0), currentAy(0.0), 
      currentAz(0.0), currentRMS(0.0), predictedTemp(0.0) {
    memset(tempHistory, 0, sizeof(tempHistory));
}

bool SensorManager::begin() {
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
    dht.begin();
    if (!mpu.begin()) {
        Serial.println("Failed to find MPU6050 chip!");
        return false;
    }
    
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

    float initTemp = dht.readTemperature();
    if (isnan(initTemp)) {
        initTemp = 25.0f;
    }
    for (int i = 0; i < WINDOW_SIZE; i++) {
        tempHistory[i] = initTemp;
    }
    currentTemp = initTemp;
    predictedTemp = initTemp;

    return true;
}

void SensorManager::sample() {
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    
    if (!isnan(t)) {
        currentTemp = t;
    }
    if (!isnan(h)) {
        currentHumidity = h;
    }

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    currentAx = a.acceleration.x;
    currentAy = a.acceleration.y;
    currentAz = a.acceleration.z;

    currentRMS = sqrt((currentAx * currentAx + 
                       currentAy * currentAy + 
                       currentAz * currentAz) / 3.0f);

    updateMovingAverageAndPrediction(currentTemp);
}

void SensorManager::getAcceleration(float& x, float& y, float& z) const {
    x = currentAx;
    y = currentAy;
    z = currentAz;
}

void SensorManager::updateMovingAverageAndPrediction(float newTemp) {
    tempHistory[historyIndex] = newTemp;
    historyIndex = (historyIndex + 1) % WINDOW_SIZE;

    float avgTemp = 0;
    for (int i = 0; i < WINDOW_SIZE; i++) {
        avgTemp += tempHistory[i];
    }
    avgTemp /= WINDOW_SIZE;

    predictedTemp = newTemp + (newTemp - avgTemp) * 2.0f;
}
