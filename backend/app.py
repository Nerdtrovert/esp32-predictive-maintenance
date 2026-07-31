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
MQTT_ENABLE_SEED_DATA = os.getenv("MQTT_ENABLE_SEED_DATA", "true").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}

SEED_TELEMETRY: Dict[int, Dict[str, Any]] = {
    1: {"temperature": 29.1, "predicted_temp": 30.0, "anomaly_score": 21.8, "anomaly": False},
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
        if machine["anomaly"] or machine["anomaly_score"] >= 60:
            status = "Severe Anomaly" if machine["anomaly_score"] >= 75 else "Anomaly"
            alerts.append(
                {
                    "id": alert_id,
                    "type": "error" if status == "Severe Anomaly" else "warning",
                    "message": f"{status} flag raised on {machine['name']}.",
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


@app.post("/api/machine/{machine_id}/diagnostic")
async def run_machine_diagnostic(machine_id: int) -> Dict[str, Any]:
    get_machine_view_or_404(machine_id)
    # Simulate a brief diagnostic computation delay
    import asyncio
    await asyncio.sleep(1.2)
    return {
        "status": "success",
        "message": "Diagnostic scan complete. Calibration baseline verified. All sensors operating within normal limits.",
        "timestamp": datetime.now().isoformat()
    }


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


REPORT_DETAILS = {
    1: {
        "summary": "Today production exceeded targets by 8.5% with improved quality metrics across all lines.",
        "metrics": [
            { "label": "Units Produced", "value": "12,450", "change": "+8.3%", "trend": "up" },
            { "label": "Defect Rate", "value": "0.8%", "change": "-0.2%", "trend": "down" },
            { "label": "Overall Equipment Effectiveness", "value": "87.3%", "change": "+2.1%", "trend": "up" },
            { "label": "Average Cycle Time", "value": "45s", "change": "-2s", "trend": "down" }
        ],
        "production_by_line": [
            { "line": "Press Line Alpha", "units": 4200, "efficiency": 94 },
            { "line": "Conveyor Belt Beta", "units": 3100, "efficiency": 78 },
            { "line": "Hydraulic Press Gamma", "units": 1800, "efficiency": 45 },
            { "line": "Assembly Line Delta", "units": 3350, "efficiency": 91 }
        ],
        "quality_metrics": [
            { "metric": "Surface Finish", "value": "96%", "target": "95%" },
            { "metric": "Dimensional Accuracy", "value": "98%", "target": "97%" },
            { "metric": "Material Consistency", "value": "94%", "target": "92%" }
        ]
    },
    2: {
        "summary": "Equipment utilization shows improvement with preventive maintenance paying off.",
        "overall_oee": 87.3,
        "availability": 92.1,
        "performance": 89.5,
        "quality": 95.2,
        "machine_details": [
            {
                "machine": "Press Line Alpha",
                "availability": 96,
                "performance": 92,
                "quality": 98,
                "oee": 86,
                "status": "Online",
                "runtime_hours": 8.5
            },
            {
                "machine": "Conveyor Belt Beta",
                "availability": 85,
                "performance": 88,
                "quality": 91,
                "oee": 68,
                "status": "Warning",
                "runtime_hours": 6.2
            },
            {
                "machine": "Hydraulic Press Gamma",
                "availability": 60,
                "performance": 75,
                "quality": 85,
                "oee": 38,
                "status": "Offline",
                "runtime_hours": 3.1
            },
            {
                "machine": "Assembly Line Delta",
                "availability": 94,
                "performance": 91,
                "quality": 97,
                "oee": 79,
                "status": "Online",
                "runtime_hours": 7.8
            }
        ],
        "trends": {
            "oee_trend": [82, 84, 86, 85, 87, 88, 87, 89, 91, 88, 90, 87, 89, 90, 88, 87, 89, 91, 90, 88, 87, 89, 90, 87.3],
            "availability_trend": [89, 91, 90, 88, 92, 93, 91, 90, 94, 92, 94, 91, 93, 95, 93, 92, 94, 96, 95, 93, 92, 94, 95, 92.1]
        }
    },
    3: {
        "summary": "Quality performance remains strong with continuous improvement initiatives showing results.",
        "overall_defect_rate": 0.8,
        "defect_trend": [1.2, 1.1, 1.0, 0.9, 0.9, 0.8, 0.8, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.8],
        "defect_categories": [
            { "category": "Surface Defects", "count": 45, "percentage": 56 },
            { "category": "Dimensional Issues", "count": 25, "percentage": 31 },
            { "category": "Material Flaws", "count": 10, "percentage": 13 }
        ],
        "quality_by_line": [
            { "line": "Press Line Alpha", "defects": 12, "rate": 0.3 },
            { "line": "Conveyor Belt Beta", "defects": 28, "rate": 0.9 },
            { "line": "Hydraulic Press Gamma", "defects": 18, "rate": 1.0 },
            { "line": "Assembly Line Delta", "defects": 22, "rate": 0.7 }
        ]
    },
    4: {
        "summary": "Preventive maintenance program showing positive results with reduced emergency interventions.",
        "completed_maintenance": 8,
        "scheduled_maintenance": 3,
        "pending_maintenance": 2,
        "emergency_repairs": 1,
        "maintenance_by_type": [
            { "type": "Preventive", "count": 5 },
            { "type": "Predictive", "count": 3 },
            { "type": "Corrective", "count": 2 }
        ],
        "upcoming_maintenance": [
            { "equipment": "Conveyor Belt Beta", "type": "Lubrication", "date": "2024-01-20", "priority": "High" },
            { "equipment": "Press Line Alpha", "type": "Sensor Calibration", "date": "2024-01-22", "priority": "Medium" },
            { "equipment": "Hydraulic Press Gamma", "type": "Seal Replacement", "date": "2024-01-25", "priority": "Low" },
            { "equipment": "Robotic Arm Epsilon", "type": "Firmware Update", "date": "2024-01-18", "priority": "Medium" }
        ],
        "equipment_health": [
            { "equipment": "Press Line Alpha", "health": 94, "trend": "up" },
            { "equipment": "Conveyor Belt Beta", "health": 78, "trend": "down" },
            { "equipment": "Hydraulic Press Gamma", "health": 45, "trend": "critical" },
            { "equipment": "Assembly Line Delta", "health": 91, "trend": "stable" }
        ]
    },
    5: {
        "summary": "Energy optimization initiatives showing promising results with potential for further savings.",
        "total_consumption_kwh": 12450,
        "cost_savings": 2340,
        "efficiency_percentage": 78,
        "consumption_by_equipment": [
            { "equipment": "Press Line Alpha", "kwh": 4200, "cost": 50 },
            { "equipment": "Conveyor Belt Beta", "kwh": 3100, "cost": 372000 },
            { "equipment": "Hydraulic Press Gamma", "kwh": 1800, "cost": 216000 },
            { "equipment": "Assembly Line Delta", "kwh": 3350, "cost": 402000 }
        ],
        "peak_vs_offpeak": {
            "peak_usage": 68,
            "offpeak_usage": 32,
            "potential_savings": "15-20%"
        },
        "energy_trends": {
            "daily_consumption": [1180, 1210, 1190, 1220, 1250, 1240, 1230, 1260, 1270, 1290, 1300, 1280, 1270, 1260, 1250, 1240, 1230, 1220, 1210, 1200, 1190, 1180, 1170, 1245],
            "cost_trend": [1120, 1150, 1130, 1160, 1190, 1180, 1170, 1200, 1210, 1230, 1240, 1220, 1210, 1200, 1190, 1180, 1170, 1150, 1140, 1130, 1120, 1110, 1100, 2340]
        }
    }
}

@app.get("/api/reports/{report_id}")
async def get_report(report_id: int) -> Dict[str, Any]:
    reports = await get_reports()
    report = next((r for r in reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report_details = REPORT_DETAILS.get(
        report_id,
        {
            "summary": f"This is a sample {report['type'].lower()} report showing key metrics and trends.",
            "charts": [],
            "tables": [],
        }
    )

    return {
        "id": report_id,
        "title": report["title"],
        "date": report["date"],
        "type": report["type"],
        "generated_at": datetime.now().isoformat(),
        "data": report_details,
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