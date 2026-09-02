#!/usr/bin/env python3
"""
CHATR — Quota-Aware Multi-Provider GPU Dispatcher & Health Router
Dynamically calculates worker routing score:
Score = Availability * (Base Suitability + Quota Buffer - Cost Penalty - Queue Latency)
Routes through Free GPU Pool (ZeroGPU -> Lightning -> Kaggle -> Colab) first,
with automated failover and retry, escalating to Paid Fallback (Modal A100)
only when the free pool is completely exhausted or unavailable.
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict

@dataclass
class GPUWorkerNode:
    id: str
    provider: str            # 'huggingface', 'lightning', 'kaggle', 'colab', 'modal'
    model: str               # 'Wan2.2-I2V-A14B', 'Wan2.1-I2V-14B'
    hardware: str            # 'RTX Pro 6000 Blackwell', 'A100-80GB', 'Tesla T4x2', 'Tesla T4'
    vram_gb: int
    base_suitability: int    # 0 - 100
    cost_type: str           # 'free', 'free_credits', 'free_variable', 'paid_fallback'
    cost_per_hour: float
    quota_remaining_min: float
    endpoint_url: str
    enabled: bool = True
    last_health_check: float = 0.0
    is_online: bool = False
    health_latency_ms: float = 0.0
    status_details: Optional[dict] = None

class GPUDispatcher:
    def __init__(self, config_path: str = "config/gpu_workers.json"):
        self.config_path = config_path
        self.workers: List[GPUWorkerNode] = []
        self.load_config()

    def load_config(self):
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.workers = [GPUWorkerNode(**w) for w in data.get("workers", [])]
            except Exception as e:
                print(f"[DISPATCHER] Error loading {self.config_path}: {e}", file=sys.stderr)

    def save_config(self):
        with open(self.config_path, "w", encoding="utf-8") as f:
            json.dump({"workers": [asdict(w) for w in self.workers]}, f, indent=2)

    def check_worker_health(self, worker: GPUWorkerNode) -> Tuple[bool, dict]:
        if not worker.endpoint_url or not worker.enabled:
            worker.is_online = False
            return False, {"error": "Disabled or unconfigured"}

        t0 = time.time()
        if worker.provider == "huggingface":
            # Test ZeroGPU Gradio Space connectivity
            try:
                from gradio_client import Client
                c = Client(worker.endpoint_url)
                worker.health_latency_ms = (time.time() - t0) * 1000.0
                worker.last_health_check = time.time()
                worker.is_online = True
                worker.status_details = {"status": "ONLINE", "type": "SHARED_ZEROGPU_SPACE"}
                return True, worker.status_details
            except Exception as e:
                worker.is_online = False
                return False, {"error": str(e)}

        # Standard FastAPI Health Endpoint check
        health_url = f"{worker.endpoint_url.rstrip('/')}/health"
        try:
            req = urllib.request.Request(health_url, headers={"User-Agent": "chatr-dispatcher/2.0"})
            with urllib.request.urlopen(req, timeout=4) as res:
                data = json.loads(res.read().decode("utf-8"))
                worker.health_latency_ms = (time.time() - t0) * 1000.0
                worker.last_health_check = time.time()
                worker.is_online = (data.get("status") == "ONLINE")
                worker.status_details = data
                return worker.is_online, data
        except Exception as e:
            worker.is_online = False
            return False, {"error": str(e)}

    def calculate_routing_score(self, worker: GPUWorkerNode) -> float:
        """
        Calculates dynamic composite suitability score:
        Score = Availability * (Base Suitability + Quota Score - Cost Penalty - Latency Penalty)
        """
        if not worker.is_online:
            return -100.0

        score = float(worker.base_suitability)

        # Quota Buffer bonus/penalty
        if worker.quota_remaining_min <= 0:
            score -= 80.0
        elif worker.quota_remaining_min > 30.0:
            score += 15.0

        # Cost Penalty (Preserve free compute first)
        if worker.cost_type == "paid_fallback":
            score -= 100.0
        elif worker.cost_type == "free_credits":
            score += 5.0
        elif worker.cost_type == "free":
            score += 10.0

        # Latency Penalty
        if worker.health_latency_ms > 2000:
            score -= 10.0

        return round(score, 2)

    def check_hard_gates(
        self,
        worker: GPUWorkerNode,
        requested_model: str,
        required_vram_gb: int = 14,
        est_duration_min: float = 2.0
    ) -> Tuple[bool, str]:
        """
        Applies 6 strict pre-qualification gates before any scoring is computed:
        1. Worker healthy & online
        2. Model supported by worker backend
        3. Sufficient VRAM available
        4. Quota remaining >= estimated job duration
        5. Worker not busy / job not active
        6. Endpoint configured & enabled
        """
        if not worker.enabled:
            return False, "Worker is disabled"
        if not worker.endpoint_url:
            return False, "Endpoint URL unconfigured"
        if not worker.is_online:
            return False, "Worker is offline"
        if requested_model.lower() not in worker.model.lower() and worker.model != "*":
            return False, f"Model mismatch: requested {requested_model} != worker {worker.model}"
        if worker.vram_gb < required_vram_gb:
            return False, f"Insufficient VRAM: {worker.vram_gb}GB < {required_vram_gb}GB required"
        if worker.quota_remaining_min < est_duration_min:
            return False, f"Insufficient quota: {worker.quota_remaining_min}m < {est_duration_min}m required"
        
        # Check if worker reports active job
        if worker.status_details and worker.status_details.get("job_active", False):
            return False, "Worker is currently busy processing another job"

        return True, "Passed all 6 hard gates"

    def select_best_worker(
        self,
        requested_model: str = "Wan2.1-I2V-14B",
        required_vram_gb: int = 14,
        est_duration_min: float = 2.0
    ) -> Optional[GPUWorkerNode]:
        """
        Filters workers through the 6 hard gates, then selects the highest scoring candidate.
        """
        qualified_candidates = []
        for w in self.workers:
            if not w.enabled or not w.endpoint_url:
                continue
            
            # Refresh live health
            self.check_worker_health(w)
            
            # Apply 6 hard gates
            passed, reason = self.check_hard_gates(w, requested_model, required_vram_gb, est_duration_min)
            if passed:
                score = self.calculate_routing_score(w)
                qualified_candidates.append((score, w))
            else:
                print(f"[DISPATCHER] Gate Rejected {w.id}: {reason}")

        if not qualified_candidates:
            print(f"[DISPATCHER] No workers passed all 6 hard gates for {requested_model}")
            return None

        # Sort descending by score
        qualified_candidates.sort(key=lambda x: x[0], reverse=True)
        best_score, best_worker = qualified_candidates[0]
        print(f"[DISPATCHER] Best Qualified Worker: {best_worker.id} ({best_worker.hardware}) | Dynamic Score: {best_score}")
        return best_worker

    def print_status_table(self):
        print("\n" + "=" * 95)
        print("🌐 CHATR QUOTA-AWARE MULTI-PROVIDER GPU POOL")
        print("=" * 95)
        print(f"{'ID':<12} | {'Provider':<10} | {'Hardware':<24} | {'Model':<16} | {'Cost':<12} | {'Status':<10} | {'Score'}")
        print("-" * 95)
        for w in self.workers:
            if not w.enabled or not w.endpoint_url:
                status = "DISABLED"
                score = "N/A"
            else:
                ok, _ = self.check_worker_health(w)
                status = "ONLINE 🟢" if ok else "OFFLINE 🔴"
                score = str(self.calculate_routing_score(w)) if ok else "0.0"
            print(f"{w.id:<12} | {w.provider:<10} | {w.hardware:<24} | {w.model:<16} | {w.cost_type:<12} | {status:<10} | {score}")
        print("=" * 95 + "\n")

if __name__ == "__main__":
    dispatcher = GPUDispatcher()
    dispatcher.print_status_table()
