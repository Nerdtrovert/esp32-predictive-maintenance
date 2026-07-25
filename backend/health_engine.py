from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List

from mqtt_handler import TelemetrySample


def compute_health_score(sample: TelemetrySample) -> int:
    temp_penalty = max(0.0, sample.temperature - 28.0) * 1.6
    pred_temp_penalty = max(0.0, sample.predicted_temp - 30.0) * 1.3
    anomaly_penalty = min(sample.anomaly_score, 100.0) * 0.22
    hard_penalty = 15.0 if sample.anomaly else 0.0

    score = 100.0 - temp_penalty - pred_temp_penalty - anomaly_penalty - hard_penalty
    return int(max(0, min(100, round(score))))


def derive_status(score: int) -> str:
    if score >= 85:
        return "online"
    if score >= 65:
        return "warning"
    return "offline"


def estimate_vibration(sample: TelemetrySample) -> float:
    base = 1.4 + (sample.anomaly_score / 100.0) * 6.8
    if sample.anomaly:
        base += 0.8
    return round(base, 2)


def machine_health_label(score: int) -> str:
    if score >= 85:
        return "Good"
    if score >= 70:
        return "Needs Attention"
    return "Critical"


def build_machine_view(machine_id: int, name: str, sample: TelemetrySample) -> Dict[str, Any]:
    score = compute_health_score(sample)
    return {
        "id": machine_id,
        "name": name,
        "status": derive_status(score),
        "health": score,
        "temperature": round(sample.temperature, 1),
        "vibration": estimate_vibration(sample),
        "predicted_temp": round(sample.predicted_temp, 1),
        "anomaly_score": round(sample.anomaly_score, 2),
        "anomaly": sample.anomaly,
        "updated_at": sample.timestamp,
    }


def build_sensor_series(sample: TelemetrySample) -> Dict[str, List[float]]:
    hours = list(range(24))
    temp_series = [
        round(sample.temperature + ((hour - 12) / 18.0) + ((hour % 5) - 2) * 0.2, 2)
        for hour in hours
    ]
    vibration_base = estimate_vibration(sample)
    vibration_series = [
        round(vibration_base + ((hour % 6) - 3) * 0.1, 2) for hour in hours
    ]
    pressure_series = [
        round(118.0 + sample.anomaly_score * 0.08 + ((hour % 4) - 2) * 1.5, 2)
        for hour in hours
    ]
    power_series = [
        round(42.0 + (sample.temperature - 22.0) * 0.8 + ((hour - 12) ** 2) * 0.03, 2)
        for hour in hours
    ]

    return {
        "temperature": temp_series,
        "vibration": vibration_series,
        "pressure": pressure_series,
        "power": power_series,
        "hours": [f"{h:02d}:00" for h in hours],
    }


def build_health_details(machine: Dict[str, Any]) -> Dict[str, Any]:
    score = int(machine["health"])
    hours = list(range(24))
    trend = [
        max(0, min(100, score + int(((hour - 12) / 3.0))))
        for hour in hours
    ]

    return {
        "current_health": score,
        "health_trend": trend,
        "hours": [f"{h:02d}:00" for h in hours],
        "indicators": {
            "temperature_stability": "Good" if machine["temperature"] < 30 else "Warning",
            "vibration_levels": (
                "Good"
                if machine["vibration"] < 3
                else "Warning"
                if machine["vibration"] < 6
                else "Critical"
            ),
            "power_efficiency": "Optimal" if machine["temperature"] < 30 else "Suboptimal",
            "maintenance_status": machine_health_label(score),
        },
        "updated_at": datetime.now().isoformat(),
    }


def build_factory_stats(machines: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    avg_health = round(sum(m["health"] for m in machines) / len(machines), 1) if machines else 0.0
    online_count = len([m for m in machines if m["status"] == "online"])
    warning_count = len([m for m in machines if m["status"] == "warning"])
    critical_count = len([m for m in machines if m["status"] == "offline"])
    anomalies = len([m for m in machines if m["anomaly"]])

    return [
        {
            "title": "Overall Health Score",
            "value": f"{avg_health}%",
            "trend": "up" if avg_health >= 80 else "down",
            "change": f"{'+' if avg_health >= 80 else '-'}1.8%",
            "icon": "heart",
            "color": "success" if avg_health >= 80 else "warning",
        },
        {
            "title": "Machine Status",
            "value": f"{online_count}/{len(machines)} Online",
            "trend": "neutral",
            "change": f"{warning_count} Warning / {critical_count} Critical",
            "icon": "gauge",
            "color": "primary",
        },
        {
            "title": "Failure Risk",
            "value": "Low" if anomalies == 0 else "Medium" if anomalies < 2 else "High",
            "trend": "down" if anomalies == 0 else "up",
            "change": f"{anomalies} active anomaly signals",
            "icon": "shield",
            "color": "success" if anomalies == 0 else "warning",
        },
        {
            "title": "Active Alerts",
            "value": str(warning_count + critical_count),
            "trend": "up" if (warning_count + critical_count) > 0 else "neutral",
            "change": f"{critical_count} critical",
            "icon": "alert-triangle",
            "color": "warning",
        },
        {
            "title": "Next Maintenance",
            "value": "In 1 day" if critical_count > 0 else "In 2 days",
            "trend": "neutral",
            "change": "",
            "icon": "wrench",
            "color": "accent",
        },
    ]