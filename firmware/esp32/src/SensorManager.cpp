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
    
    // 1. Diagnostic test read for DHT11
    float initTemp = dht.readTemperature();
    bool dhtOk = !isnan(initTemp);
    if (!dhtOk) {
        Serial.println("[SensorManager] WARNING: DHT11 sensor test read returned NaN (check pin 4/pullups)");
        initTemp = 25.0f; // fallback
    } else {
        Serial.printf("[SensorManager] DHT11 initialized successfully. Current Temp: %.1f°C\n", initTemp);
    }
    
    // 2. I2C Bus Scanner to check connection
    Serial.println("[SensorManager] Scanning I2C bus for devices...");
    int nDevices = 0;
    uint8_t detectedAddr = 0;
    for (byte address = 1; address < 127; address++) {
        Wire.beginTransmission(address);
        byte error = Wire.endTransmission();
        if (error == 0) {
            Serial.printf("[SensorManager] -> Found I2C device at address 0x%02X\n", address);
            detectedAddr = address;
            nDevices++;
            
            // Read WHO_AM_I register (0x75) for debugging
            if (address == 0x68 || address == 0x69) {
                Wire.beginTransmission(address);
                Wire.write(0x75);
                Wire.endTransmission(false);
                Wire.requestFrom(address, (byte)1);
                if (Wire.available()) {
                    byte chipID = Wire.read();
                    Serial.printf("[SensorManager] -> MPU6050 WHO_AM_I register (0x75) returned chip ID: 0x%02X\n", chipID);
                }
            }
        } else if (error == 4) {
            Serial.printf("[SensorManager] -> Unknown error at address 0x%02X\n", address);
        }
    }
    if (nDevices == 0) {
        Serial.println("[SensorManager] -> No I2C devices found! Check your SDA (21) and SCL (22) wiring.");
    }
    
    // 3. Initialize MPU6050
    uint8_t mpuAddr = (detectedAddr == 0x69) ? 0x69 : 0x68;
    Serial.printf("[SensorManager] Initializing MPU6050 (checking address 0x%02X)...\n", mpuAddr);
    bool mpuOk = mpu.begin(mpuAddr);
    
    if (!mpuOk && nDevices > 0 && (detectedAddr == 0x68 || detectedAddr == 0x69)) {
        // If it was found on the bus but mpu.begin failed (likely due to WHO_AM_I mismatch on clone chips)
        Serial.printf("[SensorManager] MPU6050 found on bus at 0x%02X but rejected by library (WHO_AM_I mismatch).\n", detectedAddr);
        Serial.println("[SensorManager] Applying manual clone sensor wake-up configuration...");
        
        // Wake up device (clear sleep mode in PWR_MGMT_1 register 0x6B)
        Wire.beginTransmission(detectedAddr);
        Wire.write(0x6B); 
        Wire.write(0x00); 
        if (Wire.endTransmission() == 0) {
            // Configure accelerometer range to 8G (Register 0x1C = 0x10)
            Wire.beginTransmission(detectedAddr);
            Wire.write(0x1C); 
            Wire.write(0x10); 
            Wire.endTransmission();

            // Configure gyro range to 500 deg/s (Register 0x1B = 0x08)
            Wire.beginTransmission(detectedAddr);
            Wire.write(0x1B); 
            Wire.write(0x08); 
            Wire.endTransmission();

            // Configure DLPF filter (Register 0x1A = 0x03)
            Wire.beginTransmission(detectedAddr);
            Wire.write(0x1A); 
            Wire.write(0x03); 
            Wire.endTransmission();

            Serial.println("[SensorManager] Clone sensor manually initialized and running!");
            mpuOk = true; // Override to allow boot to continue
        }
    }
    
    if (!mpuOk) {
        Serial.println("[SensorManager] CRITICAL: MPU6050 not detected or failed to initialize! Check SDA/SCL wiring.");
        return false;
    }
    
    Serial.println("[SensorManager] MPU6050 initialized successfully.");
    
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

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
