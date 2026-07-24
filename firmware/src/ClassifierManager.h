#ifndef CLASSIFIER_MANAGER_H
#define CLASSIFIER_MANAGER_H

#include <Adafruit_MPU6050.h>
#include <DHT.h>

class ClassifierManager {
public:
    ClassifierManager();
    float runInference(DHT& dht, Adafruit_MPU6050& mpu);
};

#endif // CLASSIFIER_MANAGER_H
