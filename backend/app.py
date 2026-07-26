from datetime import datetime
import os
import uuid
from typing import Any, Dict, List

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from health_engine import (
    build_factory_stats,
    build_health_details,
    build_machine_view,
    build_sensor_series,
)
from mqtt_handler import MQTTIngestBridge, TelemetryStore
from recommendation_engine import (
    build_ai_analysis,
    build_maintenance_recommendations,
    build_recommendations,
)

MACHINE_CATALOG: Dict[int, str] = {
    1: "Press Line Alpha",
    2: "Conveyor Belt Beta",
    3: "Hydraulic Press Gamma",
    4: "Assembly Line Delta",
}

telemetry_store = TelemetryStore()

MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "broker.hivemq.com")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))
MQTT_TOPIC_FILTER = os.getenv("MQTT_TOPIC_FILTER", "machine-hawk/telemetry/+")
MQTT_DEFAULT_MACHINE_ID = int(os.getenv("MQTT_DEFAULT_MACHINE_ID", "1"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "")
default_client_id = f"machine-hawk-backend-{uuid.uuid4().hex[:8]}"
MQTT_CLIENT_ID = os.getenv("MQTT_CLIENT_ID", default_client_id)
MQTT_ENABLE_SEED_DATA = os.getenv("MQTT_ENABLE_SEED_DATA", "false").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}

SEED_TELEMETRY: Dict[int, Dict[str, Any]] = {
    1: {"temperature": 29.1, "predicted_temp": 30.0, "anomaly_score": 21.8, "anomaly": False},
    2: {"temperature": 31.7, "predicted_temp": 33.2, "anomaly_score": 58.4, "anomaly": False},
    3: {"temperature": 34.6, "predicted_temp": 36.8, "anomaly_score": 84.7, "anomaly": True},
    4: {"temperature": 28.3, "predicted_temp": 29.2, "anomaly_score": 17.3, "anomaly": False},
}

if MQTT_ENABLE_SEED_DATA:
    for machine_id, payload in SEED_TELEMETRY.items():
        telemetry_store.ingest(machine_id, payload)

mqtt_bridge = MQTTIngestBridge(
    store=telemetry_store,
    machine_catalog=MACHINE_CATALOG,
    broker_host=MQTT_BROKER_HOST,
    broker_port=MQTT_BROKER_PORT,
    topic_filter=MQTT_TOPIC_FILTER,
    default_machine_id=MQTT_DEFAULT_MACHINE_ID,
    username=MQTT_USERNAME,
    password=MQTT_PASSWORD,
    client_id=MQTT_CLIENT_ID,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    mqtt_bridge.start()
    yield
    # Shutdown
    mqtt_bridge.stop()

app = FastAPI(title="Machine Hawk API", version="1.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_machine_views() -> List[Dict[str, Any]]:
    machines: List[Dict[str, Any]] = []
    for machine_id, machine_name in MACHINE_CATALOG.items():
        sample = telemetry_store.latest(machine_id)
        if sample is None:
            continue
        machines.append(build_machine_view(machine_id, machine_name, sample))
    return machines


def get_machine_view_or_404(machine_id: int) -> Dict[str, Any]:
    if machine_id not in MACHINE_CATALOG:
        raise HTTPException(status_code=404, detail="Machine not found")

    sample = telemetry_store.latest(machine_id)
    if sample is None:
        raise HTTPException(status_code=404, detail="No telemetry found for machine")

    return build_machine_view(machine_id, MACHINE_CATALOG[machine_id], sample)


def build_recent_alerts(machines: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    alerts: List[Dict[str, Any]] = []
    alert_id = 1

    for machine in machines:
        if machine["anomaly"]:
            alerts.append(
                {
                    "id": alert_id,
                    "type": "error",
                    "message": (
                        f"Anomaly detected on {machine['name']} "
                        f"(score: {machine['anomaly_score']:.2f})."
                    ),
                    "time": "just now",
                }
            )
            alert_id += 1
        elif machine["status"] == "warning":
            alerts.append(
                {
                    "id": alert_id,
                    "type": "warning",
                    "message": f"Machine health warning on {machine['name']}.",
                    "time": "just now",
                }
            )
            alert_id += 1

    if not alerts:
        alerts.append(
            {
                "id": 1,
                "type": "success",
                "message": "All machines are operating within expected thresholds.",
                "time": "just now",
            }
        )

    return alerts


@app.get("/")
async def root() -> Dict[str, str]:
    return {"message": "Machine Hawk API is running"}


@app.get("/api/health")
async def health_check() -> Dict[str, str]:
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/api/mqtt/status")
async def get_mqtt_status() -> Dict[str, Any]:
    return mqtt_bridge.status()


@app.post("/api/telemetry/{machine_id}")
async def ingest_telemetry(machine_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    if machine_id not in MACHINE_CATALOG:
        raise HTTPException(status_code=404, detail="Machine not found")

    required = {"temperature", "predicted_temp", "anomaly_score", "anomaly"}
    missing = sorted(required - set(payload.keys()))
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing telemetry keys: {', '.join(missing)}")

    sample = telemetry_store.ingest(machine_id, payload)
    machine = build_machine_view(machine_id, MACHINE_CATALOG[machine_id], sample)
    return {"message": "Telemetry ingested", "machine": machine}


@app.get("/api/factory/stats")
async def get_factory_stats() -> List[Dict[str, str]]:
    return build_factory_stats(get_machine_views())


@app.get("/api/factory/machines")
async def get_factory_machines() -> List[Dict[str, Any]]:
    return get_machine_views()


@app.get("/api/factory/alerts/recent")
async def get_recent_alerts() -> List[Dict[str, Any]]:
    return build_recent_alerts(get_machine_views())


@app.get("/api/factory/summary")
async def get_quick_summary() -> List[Dict[str, Any]]:
    machines = get_machine_views()
    mqtt_status = mqtt_bridge.status()
    total_count = len(machines)
    online_count = len([m for m in machines if m["status"] == "online"])
    avg_health = round(sum(m["health"] for m in machines) / total_count, 1) if machines else 0.0
    active_alerts = len([m for m in machines if m["status"] in {"warning", "offline"}])
    messages_received = int(mqtt_status["messages_received"])

    return [
        {"label": "Overall Equipment Effectiveness", "value": f"{avg_health}%", "icon": "activity"},
        {"label": "Machines Reporting", "value": f"{total_count}", "icon": "users"},
        {"label": "Machines Online", "value": f"{online_count}", "icon": "clock"},
        {"label": "MQTT Messages Received", "value": f"{messages_received}", "icon": "package"},
        {"label": "Active Alerts", "value": f"{active_alerts}", "icon": "activity"},
    ]


@app.get("/api/machine/{machine_id}")
async def get_machine_details(machine_id: int) -> Dict[str, Any]:
    return get_machine_view_or_404(machine_id)


@app.get("/api/machine/{machine_id}/sensors")
async def get_sensor_data(machine_id: int) -> Dict[str, Any]:
    machine = get_machine_view_or_404(machine_id)
    sample = telemetry_store.latest(machine["id"])
    if sample is None:
        raise HTTPException(status_code=404, detail="No telemetry found for machine")
    return build_sensor_series(sample)


@app.get("/api/machine/{machine_id}/health")
async def get_machine_health(machine_id: int) -> Dict[str, Any]:
    return build_health_details(get_machine_view_or_404(machine_id))


@app.get("/api/ai/analysis")
async def get_ai_analysis() -> Dict[str, str]:
    return build_ai_analysis(get_machine_views())


@app.get("/api/ai/recommendations")
async def get_ai_recommendations() -> List[Dict[str, Any]]:
    return build_recommendations(get_machine_views())


@app.get("/api/alerts")
async def get_alerts(limit: int = 50) -> List[Dict[str, Any]]:
    return build_recent_alerts(get_machine_views())[:limit]


@app.get("/api/reports")
async def get_reports() -> List[Dict[str, Any]]:
    return [
        {"id": 1, "title": "Daily Production Report", "date": "2026-07-25", "type": "Production"},
        {"id": 2, "title": "Equipment Utilization Report", "date": "2026-07-24", "type": "Efficiency"},
        {"id": 3, "title": "Quality Control Report", "date": "2026-07-23", "type": "Quality"},
        {"id": 4, "title": "Maintenance Summary Report", "date": "2026-07-22", "type": "Maintenance"},
        {"id": 5, "title": "Energy Consumption Report", "date": "2026-07-21", "type": "Energy"},
    ]


@app.get("/api/reports/{report_id}")
async def get_report(report_id: int) -> Dict[str, Any]:
    reports = await get_reports()
    report = next((r for r in reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "id": report_id,
        "title": report["title"],
        "date": report["date"],
        "type": report["type"],
        "generated_at": datetime.now().isoformat(),
        "data": {
            "summary": f"This is a sample {report['type'].lower()} report showing key metrics and trends.",
            "charts": [],
            "tables": [],
        },
    }


@app.get("/api/maintenance/history")
async def get_maintenance_history(limit: int = 50) -> List[Dict[str, Any]]:
    return [
        {
            "id": 1,
            "date": "2026-07-25",
            "equipment": "Press Line Alpha",
            "type": "Preventive",
            "status": "Completed",
            "technician": "John Smith",
            "hours": 1240,
        },
        {
            "id": 2,
            "date": "2026-07-24",
            "equipment": "Conveyor Belt Beta",
            "type": "Corrective",
            "status": "Completed",
            "technician": "Sarah Johnson",
            "hours": 890,
        },
        {
            "id": 3,
            "date": "2026-07-23",
            "equipment": "Hydraulic Press Gamma",
            "type": "Predictive",
            "status": "In Progress",
            "technician": "Mike Wilson",
            "hours": 2100,
        },
    ][:limit]


@app.get("/api/maintenance/recommendations")
async def get_maintenance_recommendations() -> List[Dict[str, Any]]:
    return build_maintenance_recommendations(get_machine_views())


@app.get("/api/settings")
async def get_settings() -> Dict[str, Any]:
    return {
        "general": {
            "factoryName": "Machine Hawk Factory",
            "location": "Detroit, MI",
            "timezone": "America/Detroit",
            "language": "English",
            "dateFormat": "MM/DD/YYYY",
            "timeFormat": "12-hour",
        },
        "notifications": {
            "emailAlerts": True,
            "smsAlerts": False,
            "pushNotifications": True,
            "criticalAlerts": True,
            "warningAlerts": True,
            "infoAlerts": False,
        },
        "maintenance": {
            "autoSchedule": True,
            "preventiveMaintenance": True,
            "notificationLeadTime": 24,
            "maxWorkOrders": 5,
        },
        "integrations": {
            "erpSystem": "SAP",
            "scadaSystem": "Ignition",
            "historians": ["OSIsoft PI", "Wonderware Historian"],
            "apiEnabled": True,
        },
    }


@app.put("/api/settings")
async def update_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    return {"message": "Settings updated successfully", "settings": settings}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)