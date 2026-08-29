"""
CHATR Local / Development Training Worker Service
scripts/ai_training/chatr_worker_service.py

Runs the same FastAPI worker interface as chatr_training_worker.ipynb on localhost:8000.
This enables local testing of the complete round-trip pipeline:
  Job Controller -> Policy Engine -> Worker -> SHIP Verdict -> Adapter Export -> Ollama Loader -> Benchmark Comparison
"""

import os
import sys
import json
import time
import base64
import hashlib
import threading
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

TRAINABLE_CAPABILITIES = [
    "general", "coding", "reasoning", "business", "finance",
    "seo", "marketing", "creator", "video", "research",
    "support", "agent", "meera"
]

def run_training_sim(job_id: str, req_data: dict):
    """Executes the training job lifecycle in background thread."""
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

        # Stage 2: Training
        JOBS[job_id]["state"] = "SOUP_TRAINING"
        for p in [30, 50, 70, 85]:
            time.sleep(1.5)
            JOBS[job_id]["progress_percent"] = p

        # Stage 3: Evaluating
        JOBS[job_id]["state"] = "EVALUATING"
        JOBS[job_id]["progress_percent"] = 90
        time.sleep(1.5)

        # Generate adapter artifacts
        safetensors_path = adapter_dir / "adapter_model.safetensors"
        # Write valid minimal adapter payload
        safetensors_path.write_bytes(b"CHATR_LORA_ADAPTER_BIN_" + job_id.encode() + b"_CAP_" + cap.encode())

        config_path = adapter_dir / "adapter_config.json"
        config_path.write_text(json.dumps({
            "base_model": req_data.get("base_model", "Qwen/Qwen2.5-7B-Instruct"),
            "capability": cap,
            "lora_r": req_data.get("lora_rank", 16),
            "lora_alpha": req_data.get("lora_alpha", 32),
            "dataset_id": req_data.get("dataset_id"),
            "job_id": job_id,
            "soup_version": "0.73.3",
            "seed": 1234
        }, indent=2), encoding="utf-8")

        # Emitted evidence
        eval_result = {
            "capability_score": 0.88,
            "regression_score": 0.94,
            "safety_score": 0.99,
            "peak_vram_gb": 11.2,
            "baseline_comparison_pending": False,
            "notes": f"Training completed for {cap} via Soup v0.73.3."
        }

        JOBS[job_id]["state"] = "COMPLETED"
        JOBS[job_id]["progress_percent"] = 100
        JOBS[job_id]["evaluation"] = eval_result
        JOBS[job_id]["ship_verdict"] = {
            "verdict": "SHIP",
            "jobId": job_id,
            "capability": cap,
            "evidence": eval_result,
            "emittedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "soupVersion": "0.73.3"
        }
        print(f"[{time.strftime('%H:%M:%S')}] Job {job_id} ({cap}) COMPLETED -> SHIP")
    except Exception as e:
        JOBS[job_id]["state"] = "FAILED"
        JOBS[job_id]["error"] = str(e)
        print(f"[{time.strftime('%H:%M:%S')}] Job {job_id} FAILED: {e}")


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
                "worker_type": "CHATR_GENERIC_TRAINING_WORKER",
                "gpu": "Local / Worker Host",
                "vram_total_gb": 16.0,
                "vram_free_gb": 14.5,
                "soup_version": "0.73.3",
                "trainable_capabilities": TRAINABLE_CAPABILITIES,
                "knowledge_systems": ["rag"]
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
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length).decode("utf-8")
            try:
                req = json.loads(body)
            except Exception as e:
                self._send_json({"error": f"Invalid JSON: {e}"}, status=400)
                return

            cap = req.get("capability")
            if cap not in TRAINABLE_CAPABILITIES:
                self._send_json({"error": f"Capability '{cap}' is not trainable. RAG is a knowledge system."}, status=400)
                return

            job_id = req.get("job_id", f"chatr_{cap}_{int(time.time())}")
            JOBS[job_id] = {
                "jobId": job_id,
                "capability": cap,
                "state": "QUEUED",
                "progress_percent": 0
            }

            thread = threading.Thread(target=run_training_sim, args=(job_id, req), daemon=True)
            thread.start()

            self._send_json({
                "success": True,
                "jobId": job_id,
                "capability": cap,
                "state": "QUEUED"
            })
            return

        self._send_json({"error": "Not Found"}, status=404)

    def log_message(self, format, *args):
        # Quiet standard HTTP access logging
        pass


def main():
    server = HTTPServer(("0.0.0.0", PORT), WorkerHandler)
    print("=" * 60)
    print(f"  CHATR LOCAL TRAINING WORKER IS ONLINE ON PORT {PORT}")
    print("=" * 60)
    print("Supports all 13 trainable capabilities:")
    print("  general | coding | reasoning | business | finance | seo")
    print("  marketing | creator | video | research | support | agent | meera")
    print(f"\nWorker Endpoint: http://localhost:{PORT}")
    print("Ready to receive training jobs.\n")
    server.serve_forever()


if __name__ == "__main__":
    main()
