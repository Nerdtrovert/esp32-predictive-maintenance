from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass, asdict
from datetime import datetime
import json
from typing import Any, Deque, Dict, List, Optional

import paho.mqtt.client as mqtt


@dataclass
class TelemetrySample:
    machine_id: int
    temperature: float
    predicted_temp: float
    anomaly_score: float
    anomaly: bool
    timestamp: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class TelemetryStore:
    def __init__(self, max_samples_per_machine: int = 500) -> None:
        self._samples: Dict[int, Deque[TelemetrySample]] = defaultdict(
            lambda: deque(maxlen=max_samples_per_machine)
        )

    def add_sample(self, sample: TelemetrySample) -> None:
        self._samples[sample.machine_id].append(sample)

    @staticmethod
    def _parse_bool(value: Any) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return bool(value)
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"true", "1", "yes", "y", "on"}:
                return True
            if normalized in {"false", "0", "no", "n", "off"}:
                return False
        raise ValueError(f"Invalid boolean value for anomaly: {value!r}")

    def ingest(self, machine_id: int, payload: Dict[str, Any]) -> TelemetrySample:
        sample = TelemetrySample(
            machine_id=machine_id,
            temperature=float(payload["temperature"]),
            predicted_temp=float(payload["predicted_temp"]),
            anomaly_score=float(payload["anomaly_score"]),
            anomaly=self._parse_bool(payload["anomaly"]),
            timestamp=datetime.now().isoformat(),
        )
        self.add_sample(sample)
        return sample

    def latest(self, machine_id: int) -> Optional[TelemetrySample]:
        machine_samples = self._samples.get(machine_id)
        if not machine_samples:
            return None
        return machine_samples[-1]

    def recent(self, machine_id: int, limit: int = 50) -> List[TelemetrySample]:
        machine_samples = self._samples.get(machine_id)
        if not machine_samples:
            return []
        return list(machine_samples)[-limit:]


class MQTTIngestBridge:
    def __init__(
        self,
        store: TelemetryStore,
        machine_catalog: Dict[int, str],
        broker_host: str,
        broker_port: int,
        topic_filter: str,
        default_machine_id: int = 1,
        username: str = "",
        password: str = "",
        client_id: str = "machine-hawk-backend",
    ) -> None:
        self._store = store
        self._machine_catalog = machine_catalog
        self._topic_filter = topic_filter
        self._default_machine_id = default_machine_id

        self._client = mqtt.Client(client_id=client_id, protocol=mqtt.MQTTv311)
        if username:
            self._client.username_pw_set(username=username, password=password or None)

        self._client.on_connect = self._on_connect
        self._client.on_disconnect = self._on_disconnect
        self._client.on_message = self._on_message

        self._broker_host = broker_host
        self._broker_port = broker_port
        self._connected = False
        self._received_count = 0
        self._last_message_at: Optional[str] = None
        self._last_error: Optional[str] = None

    def start(self) -> None:
        self._client.connect_async(self._broker_host, self._broker_port, keepalive=60)
        self._client.loop_start()

    def stop(self) -> None:
        self._client.loop_stop()
        self._client.disconnect()

    def status(self) -> Dict[str, Any]:
        return {
            "connected": self._connected,
            "broker_host": self._broker_host,
            "broker_port": self._broker_port,
            "topic_filter": self._topic_filter,
            "messages_received": self._received_count,
            "last_message_at": self._last_message_at,
            "last_error": self._last_error,
        }

    def _on_connect(self, client: mqtt.Client, _userdata: Any, _flags: Any, reason_code: int, _properties: Any = None) -> None:
        if reason_code == 0:
            self._connected = True
            self._last_error = None
            client.subscribe(self._topic_filter, qos=1)
            return

        self._connected = False
        self._last_error = f"MQTT connect failed with code {reason_code}"

    def _on_disconnect(self, _client: mqtt.Client, _userdata: Any, reason_code: int, _properties: Any = None) -> None:
        self._connected = False
        if reason_code != 0:
            self._last_error = f"MQTT disconnected unexpectedly with code {reason_code}"

    def _resolve_machine_id(self, topic: str, payload: Dict[str, Any]) -> int:
        if "machine_id" in payload:
            machine_id = int(payload["machine_id"])
        else:
            topic_tail = topic.rsplit("/", 1)[-1]
            machine_id = int(topic_tail) if topic_tail.isdigit() else self._default_machine_id

        if machine_id not in self._machine_catalog:
            raise ValueError(f"Unknown machine_id {machine_id}")

        return machine_id

    def _on_message(self, _client: mqtt.Client, _userdata: Any, message: mqtt.MQTTMessage) -> None:
        try:
            payload_text = message.payload.decode("utf-8")
            payload = json.loads(payload_text)
            machine_id = self._resolve_machine_id(message.topic, payload)
            self._store.ingest(machine_id, payload)
            self._received_count += 1
            self._last_message_at = datetime.now().isoformat()
            self._last_error = None
        except json.JSONDecodeError as exc:
            self._last_error = f"Invalid JSON payload on topic {message.topic}: {exc}"
        except (KeyError, TypeError, ValueError) as exc:
            self._last_error = f"Invalid telemetry payload on topic {message.topic}: {exc}"