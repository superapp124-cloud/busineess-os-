"""
CHATR Local / Development Training Worker Service
scripts/ai_training/chatr_worker_service.py

Runs the same FastAPI worker interface as chatr_training_worker.ipynb on localhost:8000.
This enables local testing of the complete round-trip pipeline:
  Job Controller -> Policy Engine -> Worker -> SHIP Verdict -> Adapter Export -> Ollama Loader -> Benchmark Comparison

CRITICAL — MOCK MODE GUARD:
============================
This service contains run_training_sim() which is a SIMULATION ONLY.
It writes 60-byte ASCII fake safetensors files and emits hardcoded SHIP verdicts.

The service REFUSES to run in simulation mode unless explicitly started with --mock-dry-run:
    python chatr_worker_service.py --mock-dry-run

This guard prevents accidental mock pollution of production registries.

For REAL training, use notebooks/chatr_training_worker.ipynb on Colab with a GPU,
or run soup train directly via soup_job_controller.py --run-full-pipeline.
"""

import os
import sys
import json
import time
import base64
import hashlib
import threading
import argparse
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = 8000
JOBS = {}
WORK_DIR = Path(__file__).parent.parent.parent / "data" / "worker_scratch"
WORK_DIR.mkdir(parents=True, exist_ok=True)

# ─── MOCK MODE GUARD ──────────────────────────────────────────────────────────
# Set to True only when --mock-dry-run flag is provided.
# When False, the /train endpoint rejects all requests.
MOCK_MODE: bool = False

TRAINABLE_CAPABILITIES = [
    "general", "coding", "reasoning", "business", "finance",
    "seo", "marketing", "creator", "video", "research",
    "support", "agent", "meera"
]

def run_training_sim(job_id: str, req_data: dict):
    """
    SIMULATION ONLY — executes a fake training lifecycle.

    This function writes a 60-byte ASCII stub as adapter_model.safetensors
    and emits hardcoded evaluation scores. It is ONLY called when MOCK_MODE=True.

    NEVER use this function's output in production. The registry must NOT be
    updated to state=VALIDATED_PHASE0/SHIP/COMPLETED based on this function's output.
    """
    assert MOCK_MODE, "run_training_sim() called without --mock-dry-run flag. Aborting."
    cap = req_data.get("capability", "general")
    try:
        job_dir = WORK_DIR / job_id
        adapter_dir = job_dir / "adapter"
        job_dir.mkdir(parents=True, exist_ok=True)
        adapter_dir.mkdir(parents=True, exist_ok=True)

        # Decode dataset
        ds_bytes = base64.b64decode(req_data.get("dataset_b64", ""))
        ds_file = job_dir / f"{req_data.get('dataset_id', 'dataset')}.jsonl"
        ds_file.write_bytes(ds_bytes)

        # Stage 1: Validating
        JOBS[job_id]["state"] = "VALIDATING_DATASET"
        JOBS[job_id]["progress_percent"] = 15
        time.sleep(2)

        # Stage 2: Fake training (simulation only)
        JOBS[job_id]["state"] = "SOUP_TRAINING_SIM"
        for p in [30, 50, 70, 85]:
            time.sleep(1.5)
            JOBS[job_id]["progress_percent"] = p

        # Stage 3: Evaluating
        JOBS[job_id]["state"] = "EVALUATING"
        JOBS[job_id]["progress_percent"] = 90
        time.sleep(1.5)

        # Generate FAKE adapter artifacts — clearly labeled as simulated
        safetensors_path = adapter_dir / "adapter_model.safetensors"
        safetensors_path.write_bytes(
            b"CHATR_MOCK_DRY_RUN_ADAPTER_" + job_id.encode() + b"_CAP_" + cap.encode()
        )

        config_path = adapter_dir / "adapter_config.json"
        config_path.write_text(json.dumps({
            "base_model": req_data.get("base_model", "Qwen/Qwen2.5-7B-Instruct"),
            "capability": cap,
            "lora_r": req_data.get("lora_rank", 16),
            "lora_alpha": req_data.get("lora_alpha", 32),
            "dataset_id": req_data.get("dataset_id"),
            "job_id": job_id,
            "soup_version": "0.73.3",
            "seed": 1234,
            "MOCK_DRY_RUN": True,  # Explicit label — this is NOT a real adapter
            "WARNING": "This adapter is a simulation artifact. Do not register in production."
        }, indent=2), encoding="utf-8")

        # Hardcoded FAKE scores — clearly labeled
        eval_result = {
            "capability_score": 0.88,
            "regression_score": 0.94,
            "safety_score": 0.99,
            "peak_vram_gb": 11.2,
            "baseline_comparison_pending": False,
            "MOCK_DRY_RUN": True,
            "notes": f"[SIMULATION] Mock training for {cap}. Scores are hardcoded. Do not use in production."
        }

        JOBS[job_id]["state"] = "COMPLETED_MOCK"
        JOBS[job_id]["progress_percent"] = 100
        JOBS[job_id]["evaluation"] = eval_result
        JOBS[job_id]["ship_verdict"] = {
            "verdict": "MOCK_ONLY",  # NOT SHIP — cannot register from this
            "jobId": job_id,
            "capability": cap,
            "evidence": eval_result,
            "emittedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "soupVersion": "0.73.3",
            "MOCK_DRY_RUN": True,
            "WARNING": "This verdict is simulated. Do not update the adapter registry based on this output."
        }
        print(f"[SIM] Job {job_id} ({cap}) COMPLETED_MOCK (simulation only)")
    except Exception as e:
        JOBS[job_id]["state"] = "FAILED"
        JOBS[job_id]["error"] = str(e)
        print(f"[SIM] Job {job_id} FAILED: {e}")


class WorkerHandler(BaseHTTPRequestHandler):
    def _send_json(self, data: dict, status: int = 200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/health":
            self._send_json({
                "status": "ONLINE",
                "worker_type": "CHATR_MOCK_DRY_RUN_WORKER" if MOCK_MODE else "CHATR_REAL_WORKER_DISABLED",
                "mock_mode": MOCK_MODE,
                "gpu": "Local / Worker Host",
                "vram_total_gb": 16.0,
                "vram_free_gb": 14.5,
                "soup_version": "0.73.3",
                "trainable_capabilities": TRAINABLE_CAPABILITIES,
                "warning": (
                    "MOCK MODE ACTIVE — outputs are simulated and must not be registered as real adapters."
                    if MOCK_MODE else
                    "REAL MODE — training requires Colab worker with GPU."
                )
            })
            return

        if path.startswith("/train-status/"):
            job_id = path.replace("/train-status/", "").strip()
            if job_id in JOBS:
                self._send_json(JOBS[job_id])
            else:
                self._send_json({"error": "Job not found"}, status=404)
            return

        if path.startswith("/ship-verdict/"):
            job_id = path.replace("/ship-verdict/", "").strip()
            if job_id in JOBS and "ship_verdict" in JOBS[job_id]:
                self._send_json(JOBS[job_id]["ship_verdict"])
            else:
                self._send_json({"error": "Verdict not ready"}, status=404)
            return

        if path.startswith("/download-adapter/"):
            job_id = path.replace("/download-adapter/", "").strip()
            adapter_file = WORK_DIR / job_id / "adapter" / "adapter_model.safetensors"
            if adapter_file.exists():
                content = adapter_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Content-Disposition", f"attachment; filename={job_id}_adapter.safetensors")
                self.end_headers()
                self.wfile.write(content)
            else:
                self._send_json({"error": "Adapter artifact not ready"}, status=404)
            return

        self._send_json({"error": "Not Found"}, status=404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/train":
            # ── MOCK MODE GUARD ────────────────────────────────────────────────
            if not MOCK_MODE:
                self._send_json({
                    "error": "REAL_TRAINING_REQUIRED",
                    "message": (
                        "This local worker is a development simulation. "
                        "It does NOT perform real training and MUST NOT be used in production. "
                        "To run real training: use notebooks/chatr_training_worker.ipynb on a GPU-equipped Colab instance. "
                        "To run a simulation for contract testing only: restart with --mock-dry-run flag."
                    ),
                    "action_required": "Use Colab notebook with real GPU for production training."
                }, status=403)
                return

            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                req = json.loads(body)
            except Exception as e:
                self._send_json({"error": f"Invalid JSON: {e}"}, status=400)
                return

            cap = req.get("capability")
            if cap not in TRAINABLE_CAPABILITIES:
                self._send_json({"error": f"Capability '{cap}' is not trainable."}, status=400)
                return

            job_id = req.get("job_id", f"chatr_{cap}_{int(time.time())}")
            JOBS[job_id] = {
                "jobId": job_id,
                "capability": cap,
                "state": "QUEUED",
                "progress_percent": 0,
                "MOCK_DRY_RUN": True
            }

            thread = threading.Thread(target=run_training_sim, args=(job_id, req), daemon=True)
            thread.start()

            self._send_json({
                "success": True,
                "jobId": job_id,
                "capability": cap,
                "state": "QUEUED",
                "MOCK_DRY_RUN": True,
                "warning": "This is a simulation run. Adapter will NOT contain real weight updates."
            })
            return

        self._send_json({"error": "Not Found"}, status=404)

    def log_message(self, format, *args):
        pass  # Suppress HTTP access logging


def main():
    global MOCK_MODE
    parser = argparse.ArgumentParser(description="CHATR Local Training Worker Service")
    parser.add_argument(
        "--mock-dry-run",
        action="store_true",
        help=(
            "ONLY for contract testing. Runs simulation mode: "
            "writes fake adapters and emits hardcoded scores. "
            "MUST NOT be used to generate real model artifacts."
        )
    )
    parser.add_argument("--port", type=int, default=PORT, help="Port to listen on (default: 8000)")
    args = parser.parse_args()

    if args.mock_dry_run:
        MOCK_MODE = True
        print("=" * 60)
        print("  CHATR WORKER — MOCK DRY-RUN MODE")
        print("  WARNING: Outputs are SIMULATED. Not for production use.")
        print("=" * 60)
    else:
        print("=" * 60)
        print("  CHATR WORKER — REAL MODE (training endpoint disabled)")
        print("  POST /train will be rejected (403) until --mock-dry-run is passed.")
        print("  For real training: use Colab notebook with GPU.")
        print("=" * 60)

    listen_port = args.port
    server = HTTPServer(("0.0.0.0", listen_port), WorkerHandler)
    print(f"\nWorker Endpoint: http://localhost:{listen_port}")
    print("Endpoints: GET /health | GET /train-status/<id> | GET /ship-verdict/<id> | GET /download-adapter/<id>")
    if MOCK_MODE:
        print("POST /train is ACTIVE (mock/simulation mode)\n")
    else:
        print("POST /train is DISABLED (403) — start with --mock-dry-run to enable simulation\n")
    server.serve_forever()


if __name__ == "__main__":
    main()

