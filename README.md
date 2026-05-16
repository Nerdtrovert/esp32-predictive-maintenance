# Edge AI Predictive Maintenance System using ESP32 & TinyML

A complete **standalone Edge AI IoT device** that monitors environmental conditions and vibration, predicts trends, detects anomalies using TinyML, and enables intelligent actuation with cloud visualization.

## 🎯 Objective
Built an intelligent Edge AI system on a **single ESP32** that performs real-time monitoring, predictive analytics, and anomaly detection without relying on a gateway (Raspberry Pi).

## ✨ Features
- Real-time Temperature & Humidity monitoring (DHT11)
- Vibration & Motion analysis (MPU6050)
- **Moving Average** filtering for noise reduction
- **Linear Regression** for temperature trend prediction
- **TinyML Anomaly Detection** using Edge Impulse
- Intelligent Relay control (predictive + threshold)
- Secure MQTT communication to ThingsBoard
- Bidirectional control from web dashboard
- Low-power optimized firmware

## 🛠️ Tech Stack
- **Microcontroller**: ESP32 DevKit
- **Sensors**: DHT11, MPU6050
- **Edge AI**: Edge Impulse (TinyML)
- **Communication**: Wi-Fi + MQTT
- **Cloud/Dashboard**: ThingsBoard
- **Libraries**: Adafruit MPU6050, DHT, PubSubClient

## 📊 Architecture
Sensors (DHT11 + MPU6050)
↓
ESP32 (Edge AI Node)
├── Moving Average + Linear Regression
├── TinyML Anomaly Detection
├── Decision Logic (Hybrid)
└── MQTT → ThingsBoard Dashboard
↓
Bidirectional Control (Relay)
🚀 How to Run
1. Clone the repository
2. Update WiFi credentials and ThingsBoard token
3. Install required libraries
4. Upload the code
5. Open ThingsBoard dashboard
![Architecture Diagram](docs/Architecture-Diagram.png)

## 📸 Demo
[Watch Demo Video](docs/demo-video.mp4)

## 📚 What I Learned
- End-to-End Edge AI development
- TinyML model training and deployment
- Sensor fusion and real-time processing
- IoT architecture and cloud integration

## 🔧 Hardware Used
- ESP32 DevKit
- DHT11
- MPU6050
- 5V Relay Module
- LEDs
![Circuit Diagram](docs/circuit-diagram.png)
![Circuit Connections](docs/circuit-connections.jpg)
---

**Made with ❤️ for learning Edge AI & IoT**