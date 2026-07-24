#include "ClassifierManager.h"
#include <machine-hawk-inferencing.h>

ClassifierManager::ClassifierManager() {}

float ClassifierManager::runInference(DHT& dht, Adafruit_MPU6050& mpu) {
    float buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE] = {0};
    Serial.println("Sampling for TinyML...");

    for (size_t i = 0; i < EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE; i += EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME) {
        sensors_event_t a2, g2, temp2;
        mpu.getEvent(&a2, &g2, &temp2);
        
        float t2 = dht.readTemperature();
        float h2 = dht.readHumidity();
        
        if (isnan(t2)) t2 = 25.0f;
        if (isnan(h2)) h2 = 50.0f;

        float rms = sqrt((a2.acceleration.x * a2.acceleration.x + 
                          a2.acceleration.y * a2.acceleration.y + 
                          a2.acceleration.z * a2.acceleration.z) / 3.0f);

        buffer[i]   = t2;
        buffer[i+1] = h2;
        buffer[i+2] = a2.acceleration.x;
        buffer[i+3] = a2.acceleration.y;
        buffer[i+4] = a2.acceleration.z;
        buffer[i+5] = rms;

        delayMicroseconds(100000 / EI_CLASSIFIER_FREQUENCY);
    }

    signal_t signal;
    numpy::signal_from_buffer(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);
    ei_impulse_result_t result = {0};
    run_classifier(&signal, &result, false);

    return result.anomaly;
}
