"""
CHATR AI Training Infrastructure
scripts/ai_training/chatr_training_loop.py

Autonomous observation loop:
1. Observes production conversation logs / creator evaluations
2. Detects drift or weak capability performance (e.g. Meera tone regression, tool error rates)
3. Gathers negative/positive pairs into candidate DPO datasets
4. Builds a TrainingJobPlan candidate
5. Passes candidate through CHATR Policy Engine
6. Flags for Human Approval (for DPO/ORPO) or triggers training
"""

import json
import os
import sys
import time
import argparse
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from chatr_policy_engine import (
    TrainingJobPlan, ChatrPolicyEngine, PolicyResult
)
from adapter_registry import get_production_adapter

DATA_DIR = Path(__file__).parent.parent.parent / "data"
LOGS_DIR = DATA_DIR / "observation_logs"


class ChatrObservationLoop:
    def __init__(self):
        self.policy_engine = ChatrPolicyEngine()
        LOGS_DIR.mkdir(parents=True, exist_ok=True)

    def record_production_interaction(
        self,
        capability: str,
        user_input: str,
        generated_output: str,
        quality_score: float,  # 0.0 to 1.0 (human rating, automated verifier, or realism gate)
        critique: str = "",
        expected_output: Optional[str] = None
    ) -> None:
        """
        Appends an observation record for continuous dataset synthesis.
        """
        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "capability": capability,
            "user_input": user_input,
            "generated_output": generated_output,
            "quality_score": quality_score,
            "critique": critique,
            "expected_output": expected_output
        }
        log_file = LOGS_DIR / f"{capability}_interactions.jsonl"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    def analyze_drift(self, capability: str, threshold: float = 0.70) -> Dict[str, Any]:
        """
        Reads recent interactions and calculates average quality score.
        If quality drops below threshold, generates a candidate training proposal.
        """
        log_file = LOGS_DIR / f"{capability}_interactions.jsonl"
        if not log_file.exists():
            return {
                "capability": capability,
                "status": "NO_DATA",
                "samples_count": 0,
                "average_score": 1.0,
                "re_training_recommended": False
            }

        records = []
        with open(log_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        records.append(json.loads(line))
                    except Exception:
                        pass

        if not records:
            return {
                "capability": capability,
                "status": "EMPTY",
                "samples_count": 0,
                "average_score": 1.0,
                "re_training_recommended": False
            }

        recent_records = records[-50:]  # last 50 interactions
        avg_score = sum(r.get("quality_score", 0.0) for r in recent_records) / len(recent_records)

        re_training_recommended = avg_score < threshold or len(recent_records) >= 50

        return {
            "capability": capability,
            "status": "ANALYZED",
            "samples_count": len(recent_records),
            "average_score": round(avg_score, 3),
            "re_training_recommended": re_training_recommended,
            "threshold": threshold
        }

    def generate_candidate_dataset(self, capability: str, dataset_id: str) -> Optional[Path]:
        """
        Synthesizes a JSONL dataset from logged observations (both positive for SFT and pairs for DPO).
        """
        log_file = LOGS_DIR / f"{capability}_interactions.jsonl"
        if not log_file.exists():
            return None

        out_path = DATA_DIR / capability / f"{dataset_id}.jsonl"
        out_path.parent.mkdir(parents=True, exist_ok=True)

        count = 0
        with open(log_file, "r", encoding="utf-8") as fin, open(out_path, "w", encoding="utf-8") as fout:
            for line in fin:
                r = json.loads(line)
                target_response = r.get("expected_output") or (r["generated_output"] if r.get("quality_score", 0) >= 0.8 else None)
                if target_response:
                    example = {
                        "messages": [
                            {"role": "user", "content": r["user_input"]},
                            {"role": "assistant", "content": target_response}
                        ]
                    }
                    fout.write(json.dumps(example, ensure_ascii=False) + "\n")
                    count += 1

        print(f"Synthesized {count} training examples to {out_path}")
        return out_path if count > 0 else None


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    loop = ChatrObservationLoop()

    # Self-test: record a mock interaction
    loop.record_production_interaction(
        capability="meera",
        user_input="Meera, tell us what you think of Delhi metro in rush hour!",
        generated_output="As an AI language model, Delhi metro is a public transit network.",
        quality_score=0.2,  # poor robotic response
        critique="Robotic tone, zero Hinglish personality, failed creator persona",
        expected_output="Arre yaar, Rajiv Chowk at 6 PM is not a metro station, it's an Olympic sport! Agar aap bina push kiye train ke andar pahunch gaye, toh samjho swarg ka rasta mil gaya!"
    )

    analysis = loop.analyze_drift("meera")
    print("Observation analysis:", json.dumps(analysis, indent=2))
