from __future__ import annotations

from typing import Any, Dict, List


def build_recommendations(machines: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    recommendations: List[Dict[str, Any]] = []
    rec_id = 1

    for machine in machines:
        if machine["temperature"] >= 28.0:
            recommendations.append(
                {
                    "id": rec_id,
                    "title": "Adjust Temperature Setpoint",
                    "description": (
                        f"{machine['name']} is running at {machine['temperature']}°C. "
                        "Lower setpoint to reduce thermal stress."
                    ),
                    "priority": "high",
                    "icon": "trending-up",
                    "category": "Quality",
                }
            )
            rec_id += 1

        if machine["vibration"] >= 4.5:
            recommendations.append(
                {
                    "id": rec_id,
                    "title": "Inspect Bearing and Mounting",
                    "description": (
                        f"{machine['name']} vibration is {machine['vibration']}. "
                        "Inspect alignment, couplings, and bearing wear within 24 hours."
                    ),
                    "priority": "high",
                    "icon": "check-circle",
                    "category": "Maintenance",
                }
            )
            rec_id += 1

        if machine["anomaly"] or machine["anomaly_score"] >= 30:
            status = "Severe Anomaly" if machine["anomaly_score"] >= 70 else "Anomaly"
            recommendations.append(
                {
                    "id": rec_id,
                    "title": "Run Immediate Diagnostic",
                    "description": (
                        f"{status} detected on {machine['name']}. "
                        "Run manual inspection and compare with baseline telemetry."
                    ),
                    "priority": "high",
                    "icon": "shield-check",
                    "category": "Safety",
                }
            )
            rec_id += 1

    if not recommendations:
        recommendations.append(
            {
                "id": 1,
                "title": "Maintain Current Operating Profile",
                "description": "No high-risk indicators detected. Continue routine preventive maintenance.",
                "priority": "low",
                "icon": "clock",
                "category": "Efficiency",
            }
        )

    return recommendations[:6]


def build_ai_analysis(machines: List[Dict[str, Any]]) -> Dict[str, str]:
    highest_risk = max(machines, key=lambda m: (m["anomaly_score"], -m["health"]))
    avg_temp = sum(m["temperature"] for m in machines) / len(machines)
    avg_health = sum(m["health"] for m in machines) / len(machines)

    return {
        "production_efficiency": (
            f"Fleet health is {avg_health:.1f}%. Rebalancing workload away from {highest_risk['name']} "
            "for one shift can improve line stability."
        ),
        "quality_prediction": (
            f"Average operating temperature is {avg_temp:.1f}°C. "
            "Tight temperature control on high-variance machines can reduce defect probability."
        ),
        "energy_optimization": (
            "Move high-load cycles to off-peak windows and align maintenance to idle windows "
            "to reduce avoidable start-stop losses."
        ),
        "maintenance_forecast": (
            f"{highest_risk['name']} has the highest anomaly signal ({'Severe Anomaly' if highest_risk['anomaly_score'] >= 70 else 'Anomaly' if highest_risk['anomaly_score'] >= 30 else 'Normal'}). "
            "Plan predictive inspection in the next maintenance window."
        ),
        "overall_trend": (
            "Telemetry trend shows stable fleet behavior with localized risk pockets; "
            "targeted maintenance is preferable to full-line intervention."
        ),
    }


def build_maintenance_recommendations(machines: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    recs: List[Dict[str, Any]] = []
    rec_id = 1

    for machine in sorted(machines, key=lambda m: (m["health"], -m["anomaly_score"]))[:4]:
        recs.append(
            {
                "id": rec_id,
                "title": f"Service {machine['name']}",
                "description": (
                    f"Health score {machine['health']} with {'Severe Anomaly' if machine['anomaly_score'] >= 70 else 'Anomaly' if machine['anomaly_score'] >= 30 else 'Normal'} status. "
                    "Perform lubrication, alignment check, and thermal calibration."
                ),
                "priority": "high" if machine["health"] < 70 else "medium",
                "dueDate": "2026-07-28" if machine["health"] < 70 else "2026-07-30",
                "category": "Preventive Maintenance",
                "icon": "wrench",
            }
        )
        rec_id += 1

    return recs