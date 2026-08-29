"""
CHATR AI Training Infrastructure
scripts/ai_training/soup_job_controller.py

Translates an approved TrainingJobPlan into a locked soup.yaml,
uploads dataset to the Colab worker, submits the job, and polls for results.

The soup.yaml is auto-generated and locked — AI agents cannot modify it.
"""

import os
import sys
import json
import time
import base64
import hashlib
import datetime
import requests
import tempfile
import argparse
from pathlib import Path
from typing import Optional

from chatr_policy_engine import (
    TrainingJobPlan, ChatrPolicyEngine, PolicyResult
)

DATA_DIR = Path(__file__).parent.parent.parent / "data"
ADAPTERS_DIR = DATA_DIR / "adapters" / "capabilities"
DEFAULT_WORKER_URL = "http://localhost:8000"


# ============================================================
# SOUP YAML GENERATOR
# ============================================================

def build_soup_yaml(plan: TrainingJobPlan, policy_hash: str, dataset_path: str) -> str:
    """
    Generates a locked soup.yaml from an approved TrainingJobPlan.
    This YAML is the only thing Soup ever receives.
    No AI agent can modify it after policy approval.
    """
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    job_id = f"chatr_{plan.capability}_{plan.method}_{int(time.time())}"

    return f"""# CHATR AUTO-GENERATED TRAINING CONFIGURATION
# job_id: {job_id}
# capability: {plan.capability}
# policy_hash: {policy_hash}
# dataset_id: {plan.dataset_id}
# generated_at: {timestamp}
# DO NOT EDIT MANUALLY

model: {plan.base_model}

training:
  method: {plan.method}
  stream_layers: true
  quantization: 4bit
  batch_size: {plan.batch_size}
  gradient_accumulation_steps: {plan.gradient_accumulation_steps}
  max_seq_len: {plan.max_seq_len}
  learning_rate: {plan.learning_rate}
  warmup_steps: {plan.warmup_steps}
  seed: {plan.seed}

adapter:
  type: lora
  rank: {plan.lora_rank}
  alpha: {plan.lora_alpha}
  target_modules: [q_proj, v_proj, k_proj, o_proj, gate_proj, up_proj, down_proj]

dataset:
  path: /content/chatr_datasets/{plan.dataset_id}.jsonl
  format: chat

eval:
  ship: true
  task_eval: /content/chatr_datasets/{plan.capability}_eval.jsonl

output:
  dir: /content/adapters/{plan.capability}_{plan.method}_v1
  push_to_hub: false
"""


# ============================================================
# JOB CONTROLLER
# ============================================================

class SoupJobController:
    """
    Submits approved training jobs to the Colab/Kaggle Soup worker.
    """

    def __init__(self, worker_url: str = DEFAULT_WORKER_URL):
        self.worker_url = worker_url.rstrip("/")
        self.policy_engine = ChatrPolicyEngine()

    def health_check(self) -> dict:
        try:
            r = requests.get(f"{self.worker_url}/health", timeout=5)
            return r.json() if r.status_code == 200 else {"status": "OFFLINE"}
        except Exception as e:
            return {"status": "OFFLINE", "error": str(e)}

    def submit_job(
        self,
        plan: TrainingJobPlan,
        dry_run: bool = False
    ) -> dict:
        """
        Full pipeline: validate → generate soup.yaml → upload dataset → submit.
        Payload is aligned with chatr_training_worker.ipynb TrainingRequest schema.
        """
        print(f"\n{'='*60}")
        print(f"  CHATR SOUP JOB CONTROLLER")
        print(f"  Capability: {plan.capability} | Method: {plan.method}")
        print(f"{'='*60}\n")

        # Step 1: Policy validation
        print("Step 1/5: Running CHATR Policy Engine...")
        result = self.policy_engine.validate(plan)
        result.print_report()

        if not result.approved:
            return {"success": False, "error": "Policy validation failed", "violations": [v.rule for v in result.violations]}

        # Step 2: Locate dataset
        print("Step 2/5: Locating dataset...")
        dataset_path = DATA_DIR / plan.capability / f"{plan.dataset_id}.jsonl"
        eval_path = DATA_DIR / plan.capability / "eval.jsonl"

        if not dataset_path.exists():
            return {"success": False, "error": f"Dataset not found: {dataset_path}. Build it first."}
        print(f"  Dataset: {dataset_path} ({dataset_path.stat().st_size} bytes)")

        # Step 3: Generate locked soup.yaml
        print("Step 3/5: Generating locked soup.yaml...")
        soup_yaml = build_soup_yaml(plan, result.plan_hash, str(dataset_path))
        print(f"  Configuration locked (policy_hash: {result.plan_hash[:16]}...)")

        if dry_run:
            print("\n--- DRY RUN: soup.yaml would be ---")
            print(soup_yaml)
            print("--- END DRY RUN ---\n")
            return {"success": True, "dry_run": True, "soup_yaml": soup_yaml}

        # Step 4: Encode datasets as base64
        print("Step 4/5: Encoding datasets...")
        dataset_b64 = base64.b64encode(dataset_path.read_bytes()).decode()
        eval_b64 = base64.b64encode(eval_path.read_bytes()).decode() if eval_path.exists() else ""

        # Step 5: Submit to generic CHATR Training Worker
        # Payload matches TrainingRequest in chatr_training_worker.ipynb exactly.
        print(f"Step 5/5: Submitting to generic CHATR Training Worker at {self.worker_url}...")
        job_id = f"chatr_{plan.capability}_{plan.method}_{int(time.time())}"

        payload = {
            "job_id":           job_id,
            "capability":       plan.capability,
            "base_model":       plan.base_model,
            "method":           plan.method,
            "dataset_id":       plan.dataset_id,
            "dataset_b64":      dataset_b64,
            "eval_b64":         eval_b64,
            "max_seq_len":      plan.max_seq_len,
            "batch_size":       plan.batch_size,
            "gradient_steps":   plan.gradient_accumulation_steps,
            "num_epochs":       1,
            "budget_minutes":   plan.budget_minutes,
            "lora_rank":        plan.lora_rank,
            "lora_alpha":       plan.lora_alpha,
            "lora_targets":     "q_proj,v_proj,k_proj,o_proj,gate_proj,up_proj,down_proj",
            "seed":             plan.seed,
            "policy_hash":      result.plan_hash,
            "human_approved_by": plan.human_approved_by or "",
            "human_approved_at": plan.human_approved_at or "",
        }

        try:
            r = requests.post(f"{self.worker_url}/train", json=payload, timeout=30)
            r.raise_for_status()
            response = r.json()
            print(f"  Job submitted: {job_id}")
            return {"success": True, "job_id": job_id, "response": response}
        except Exception as e:
            print(f"  Submission failed: {e}")
            return {"success": False, "error": str(e)}

    def poll_until_complete(
        self,
        job_id: str,
        poll_interval: int = 15,
        timeout_minutes: int = 120
    ) -> dict:
        """Poll training status until COMPLETED or FAILED."""
        print(f"\nPolling job {job_id}...")
        start = time.time()
        timeout = timeout_minutes * 60

        while time.time() - start < timeout:
            try:
                r = requests.get(f"{self.worker_url}/train-status/{job_id}", timeout=10)
                status = r.json()
                state = status.get("state", "UNKNOWN")
                progress = status.get("progress_percent", 0)
                print(f"  [{time.strftime('%H:%M:%S')}] {state} ({progress}%)")
                if state == "COMPLETED":
                    print(f"  ✅ Training completed!")
                    return status
                elif state == "FAILED":
                    print(f"  ❌ Training failed: {status.get('error')}")
                    return status
            except Exception as e:
                print(f"  ⚠️  Poll error: {e}")
            time.sleep(poll_interval)

        return {"state": "TIMEOUT", "error": f"Job timed out after {timeout_minutes} minutes"}

    def get_ship_verdict(self, job_id: str) -> dict:
        """Get Soup's ship verdict for a completed training job."""
        try:
            r = requests.get(f"{self.worker_url}/ship-verdict/{job_id}", timeout=10)
            return r.json()
        except Exception as e:
            return {"verdict": "UNKNOWN", "error": str(e)}

    def download_adapter(self, job_id: str, capability: str, version: str = "v1") -> Optional[str]:
        """Download trained adapter to local registry."""
        out_dir = ADAPTERS_DIR / capability / version
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "adapter_model.safetensors"

        try:
            r = requests.get(f"{self.worker_url}/download-adapter/{job_id}", stream=True, timeout=60)
            r.raise_for_status()
            with open(out_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"  ✅ Adapter downloaded: {out_path}")
            return str(out_path)
        except Exception as e:
            print(f"  ❌ Download failed: {e}")
            return None


# ============================================================
# CLI
# ============================================================

TRAINABLE_CAPABILITIES = sorted([
    "general", "coding", "reasoning", "business", "finance",
    "seo", "marketing", "creator", "video", "research",
    "support", "agent", "meera"
    # rag is excluded — knowledge system, not a trainable adapter
])

if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

    parser = argparse.ArgumentParser(
        description="CHATR Soup Job Controller — submits training jobs to chatr_training_worker.ipynb"
    )
    parser.add_argument("--capability",     required=True, choices=TRAINABLE_CAPABILITIES)
    parser.add_argument("--method",         default="sft", choices=["sft", "dpo", "orpo"])
    parser.add_argument("--dataset-id",     required=True)
    parser.add_argument("--base-model",     default="Qwen/Qwen2.5-7B-Instruct")
    parser.add_argument("--worker-url",     default=DEFAULT_WORKER_URL,
                        help="Cloudflare tunnel URL from chatr_training_worker.ipynb")
    parser.add_argument("--budget-minutes", type=int, default=90)
    parser.add_argument("--dry-run",        action="store_true",
                        help="Generate soup.yaml without submitting to worker")
    parser.add_argument("--submit",         action="store_true",
                        help="Submit job to worker (required unless --dry-run)")
    parser.add_argument("--run-full-pipeline", action="store_true",
                        help="Submit → poll → download adapter → print next command for ollama_adapter_loader")
    parser.add_argument("--human-approved-by", default=None,
                        help="Required for dpo/orpo methods")
    args = parser.parse_args()

    plan = TrainingJobPlan(
        capability=args.capability,
        base_model=args.base_model,
        method=args.method,
        dataset_id=args.dataset_id,
        budget_minutes=args.budget_minutes,
        human_approved_by=args.human_approved_by,
        human_approved_at=datetime.datetime.now(datetime.timezone.utc).isoformat() if args.human_approved_by else None
    )

    controller = SoupJobController(worker_url=args.worker_url)

    # Dry-run: generate config locally without needing the worker online
    if args.dry_run:
        result = controller.submit_job(plan, dry_run=True)
        print(json.dumps(result, indent=2, default=str))
        sys.exit(0)

    # Health check — required for actual submission
    print(f"Checking worker health at {args.worker_url}...")
    health = controller.health_check()
    print(f"  Worker: {health.get('status')} | GPU: {health.get('gpu', 'unknown')} | VRAM: {health.get('vram_total_gb', '?')} GB")
    if health.get("status") != "ONLINE":
        print("  Worker offline.")
        print("  1. Open notebooks/chatr_training_worker.ipynb on Colab (T4 GPU)")
        print("  2. Run all cells")
        print("  3. Copy the Cloudflare tunnel URL and pass it via --worker-url")
        sys.exit(1)

    if not args.submit and not args.run_full_pipeline:
        print("\nNothing submitted. Add --submit to submit or --dry-run to preview config.")
        sys.exit(0)

    # Submit the job
    submit_result = controller.submit_job(plan, dry_run=False)
    print(json.dumps(submit_result, indent=2, default=str))

    if not submit_result.get("success"):
        sys.exit(1)

    job_id = submit_result["job_id"]

    if args.run_full_pipeline:
        # Poll until complete
        print(f"\nPolling job {job_id} (this may take 20-90 min on Colab T4)...")
        status = controller.poll_until_complete(job_id, poll_interval=20, timeout_minutes=args.budget_minutes + 30)
        print(json.dumps(status, indent=2, default=str))

        if status.get("state") != "COMPLETED":
            print("Job did not complete successfully. Check Colab logs.")
            sys.exit(1)

        # Get ship verdict
        verdict = controller.get_ship_verdict(job_id)
        print(f"\nSoup ship verdict: {verdict.get('verdict')}")
        print(json.dumps(verdict, indent=2, default=str))

        if verdict.get("verdict") != "SHIP":
            print("Soup emitted DONT_SHIP. Not downloading adapter. Review evaluation scores.")
            sys.exit(1)

        # Download adapter
        print(f"\nDownloading adapter for {args.capability}...")
        adapter_path = controller.download_adapter(job_id, args.capability, version="v1")

        if adapter_path:
            print(f"\nPhase 0 Round-Trip Step Complete for '{args.capability}'")
            print(f"Adapter saved to: {adapter_path}")
            print(f"\nNext — load into Ollama and run quality comparison:")
            print(f"  python scripts\\ai_training\\ollama_adapter_loader.py \\")
            print(f"    --capability {args.capability} \\")
            print(f"    --adapter-path \"{adapter_path}\" \\")
            print(f"    --version v1")
            print(f"\nThen run baseline vs adapter evaluation:")
            print(f"  python scripts\\ai_training\\chatr_evaluation_gate.py \\")
            print(f"    --capability {args.capability} \\")
            print(f"    --compare-baseline")
        else:
            print("Adapter download failed.")
            sys.exit(1)
