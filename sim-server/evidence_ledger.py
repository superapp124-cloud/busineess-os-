"""
Evidence Ledger — Gate 8.5
Generates structured provenance records for every simulation run.
is_simulation_evidence_only: True ALWAYS until physical hardware is attached.
"""

import hashlib
import json
import time
from pathlib import Path
from typing import Any


class EvidenceLedger:
    EVIDENCE_DIR = Path(__file__).parent / "evidence"

    @staticmethod
    def compute_profile_hash(profile_dir: Path) -> str:
        """SHA-256 over all JSON files in the profile directory."""
        h = hashlib.sha256()
        for f in sorted(profile_dir.glob("*.json")):
            h.update(f.name.encode())
            h.update(f.read_bytes())
        return h.hexdigest()

    def create_record(
        self,
        sim_id: str,
        robot_profile_hash: str,
        physics_version: str,
        env_hash: str,
        seed: int,
        task_id: str,
        start_state: dict | None = None,
        end_state: dict | None = None,
        failure_events: list | None = None,
        recovery_events: list | None = None,
        joint_telemetry: list | None = None,
        contact_telemetry: list | None = None,
        is_task_complete: bool = False,
    ) -> dict:
        """
        Creates a structured evidence record.
        is_simulation_evidence_only is ALWAYS True — this prevents simulation
        evidence from being miscategorised as physical-hardware evidence.
        """
        record = {
            "sim_id":                    sim_id,
            "robot_profile_hash":        robot_profile_hash,
            "physics_version":           physics_version,
            "env_hash":                  env_hash,
            "seed":                      seed,
            "task_id":                   task_id,
            "timestamp_utc":             time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "start_state":               start_state or {},
            "end_state":                 end_state or {},
            "failure_events":            failure_events or [],
            "recovery_events":           recovery_events or [],
            "joint_telemetry":           joint_telemetry or [],
            "contact_telemetry":         contact_telemetry or [],
            "sensor_provenance":         "MUJOCO_PHYSICS",
            "is_task_complete":          is_task_complete,
            # CRITICAL: must ALWAYS be True until physical hardware is attached
            "is_simulation_evidence_only": True,
        }
        return record

    def write_record(self, record: dict) -> Path:
        """Write evidence record to disk as JSON."""
        self.EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
        output_path = self.EVIDENCE_DIR / f"{record['sim_id']}.json"
        output_path.write_text(
            json.dumps(record, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )
        return output_path
