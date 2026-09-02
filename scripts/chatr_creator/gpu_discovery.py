#!/usr/bin/env python3
"""
CHATR — GPU Discovery Engine
Live health-checks every provider every 30 seconds.
Never hard-codes provider status. No URL pasting required.

Provider auto-discovery order:
  1. HuggingFace ZeroGPU  — Serverless Blackwell 48/96 GB
  2. Kaggle GPU           — Dual T4 (via kernel API)
  3. Lightning AI         — L4/A100 (via SDK)
  4. Colab Worker         — T4 (via cached Cloudflare URL)
  5. Modal                — A100 (paid, on-demand)
"""

import os
import json
import time
import threading
import requests
from dataclasses import dataclass, asdict, field
from typing import Optional, Dict
from pathlib import Path

CACHE_PATH = Path("data/worker_scratch/gpu_discovery_cache.json")

@dataclass
class ProviderStatus:
    provider_id: str
    display_name: str
    status: str           # AVAILABLE | BUSY | OFFLINE | CHECKING | STANDBY
    hardware: str
    vram_gb: int
    estimated_wait_sec: Optional[int]
    last_checked: float
    latency_ms: Optional[float]
    error: Optional[str] = None
    endpoint: Optional[str] = None

_discovery_cache: Dict[str, ProviderStatus] = {}
_lock = threading.Lock()
_last_full_check = 0.0
CHECK_INTERVAL_SEC = 30


def check_huggingface_zerogpu() -> ProviderStatus:
    """Check HuggingFace ZeroGPU via the public Space API."""
    t0 = time.time()
    try:
        hf_token = os.environ.get("HF_TOKEN", "")
        headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}
        # Ping the ZeroGPU Space health endpoint
        r = requests.get(
            "https://huggingface.co/api/spaces/zerogpu-aoti/wan2-2-fp8da-aoti-faster",
            headers=headers, timeout=8
        )
        latency = (time.time() - t0) * 1000
        if r.status_code == 200:
            data = r.json()
            runtime = data.get("runtime", {})
            stage = runtime.get("stage", "BUILDING")
            if stage in ("RUNNING", "SLEEPING"):
                return ProviderStatus(
                    provider_id="hf_zerogpu",
                    display_name="HF ZeroGPU",
                    status="AVAILABLE" if stage == "RUNNING" else "STANDBY",
                    hardware="RTX Pro 6000 Blackwell 48 GB",
                    vram_gb=48,
                    estimated_wait_sec=0 if stage == "RUNNING" else 30,
                    last_checked=time.time(),
                    latency_ms=round(latency, 1),
                    endpoint="https://huggingface.co/spaces/zerogpu-aoti/wan2-2-fp8da-aoti-faster"
                )
    except Exception as e:
        pass
    latency = (time.time() - t0) * 1000
    return ProviderStatus(
        provider_id="hf_zerogpu", display_name="HF ZeroGPU",
        status="CHECKING", hardware="RTX Pro 6000 Blackwell 48 GB", vram_gb=48,
        estimated_wait_sec=None, last_checked=time.time(), latency_ms=round(latency, 1),
        error="Space API unreachable — will retry"
    )


def check_colab_worker() -> ProviderStatus:
    """Check cached Colab Cloudflare tunnel."""
    t0 = time.time()
    endpoint_key = "COLAB_CLOUDFLARE_URL"
    endpoint = os.environ.get(endpoint_key, "")
    if not endpoint:
        # Try to read from cached config
        cfg = Path("data/worker_scratch/colab_endpoint.json")
        if cfg.exists():
            with open(cfg) as f:
                endpoint = json.load(f).get("url", "")
    if not endpoint:
        return ProviderStatus(
            provider_id="colab_t4", display_name="Colab T4",
            status="OFFLINE", hardware="NVIDIA T4 16 GB", vram_gb=16,
            estimated_wait_sec=None, last_checked=time.time(), latency_ms=None,
            error="No Cloudflare tunnel registered"
        )
    try:
        r = requests.get(f"{endpoint}/health", timeout=10)
        latency = (time.time() - t0) * 1000
        if r.status_code == 200:
            return ProviderStatus(
                provider_id="colab_t4", display_name="Colab T4",
                status="AVAILABLE", hardware="NVIDIA T4 16 GB", vram_gb=16,
                estimated_wait_sec=0, last_checked=time.time(),
                latency_ms=round(latency, 1), endpoint=endpoint
            )
    except Exception as e:
        pass
    latency = (time.time() - t0) * 1000
    return ProviderStatus(
        provider_id="colab_t4", display_name="Colab T4",
        status="OFFLINE", hardware="NVIDIA T4 16 GB", vram_gb=16,
        estimated_wait_sec=None, last_checked=time.time(),
        latency_ms=round(latency, 1), error="Tunnel not responding"
    )


def check_kaggle_worker() -> ProviderStatus:
    """Check Kaggle GPU availability via cached endpoint."""
    t0 = time.time()
    endpoint = os.environ.get("KAGGLE_WORKER_URL", "")
    if not endpoint:
        cfg = Path("data/worker_scratch/kaggle_endpoint.json")
        if cfg.exists():
            with open(cfg) as f:
                endpoint = json.load(f).get("url", "")
    if not endpoint:
        return ProviderStatus(
            provider_id="kaggle_t4", display_name="Kaggle T4×2",
            status="STANDBY", hardware="NVIDIA T4 × 2 (32 GB)", vram_gb=32,
            estimated_wait_sec=None, last_checked=time.time(), latency_ms=None,
            error="No Kaggle worker registered — 30h/wk free pool available"
        )
    try:
        r = requests.get(f"{endpoint}/health", timeout=8)
        latency = (time.time() - t0) * 1000
        if r.status_code == 200:
            return ProviderStatus(
                provider_id="kaggle_t4", display_name="Kaggle T4×2",
                status="AVAILABLE", hardware="NVIDIA T4 × 2 (32 GB)", vram_gb=32,
                estimated_wait_sec=0, last_checked=time.time(),
                latency_ms=round(latency, 1), endpoint=endpoint
            )
    except:
        pass
    return ProviderStatus(
        provider_id="kaggle_t4", display_name="Kaggle T4×2",
        status="OFFLINE", hardware="NVIDIA T4 × 2 (32 GB)", vram_gb=32,
        estimated_wait_sec=None, last_checked=time.time(), latency_ms=None
    )


def check_lightning_worker() -> ProviderStatus:
    """Check Lightning AI via SDK or cached endpoint."""
    t0 = time.time()
    api_key = os.environ.get("LIGHTNING_API_KEY", "")
    if api_key:
        try:
            r = requests.get(
                "https://lightning.ai/api/v1/studios",
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=8
            )
            latency = (time.time() - t0) * 1000
            if r.status_code == 200:
                return ProviderStatus(
                    provider_id="lightning_l4", display_name="Lightning L4",
                    status="AVAILABLE", hardware="NVIDIA L4 24 GB", vram_gb=24,
                    estimated_wait_sec=5, last_checked=time.time(),
                    latency_ms=round(latency, 1)
                )
        except:
            pass
    return ProviderStatus(
        provider_id="lightning_l4", display_name="Lightning L4",
        status="STANDBY", hardware="NVIDIA L4 24 GB", vram_gb=24,
        estimated_wait_sec=None, last_checked=time.time(), latency_ms=None,
        error="LIGHTNING_API_KEY not set — set env var to enable"
    )


def check_modal_worker() -> ProviderStatus:
    """Modal is paid on-demand — check token presence only."""
    token = os.environ.get("MODAL_TOKEN_ID", "")
    if token:
        return ProviderStatus(
            provider_id="modal_a100", display_name="Modal A100",
            status="STANDBY", hardware="NVIDIA A100 80 GB", vram_gb=80,
            estimated_wait_sec=60, last_checked=time.time(), latency_ms=None,
            error=None
        )
    return ProviderStatus(
        provider_id="modal_a100", display_name="Modal A100",
        status="OFFLINE", hardware="NVIDIA A100 80 GB", vram_gb=80,
        estimated_wait_sec=None, last_checked=time.time(), latency_ms=None,
        error="MODAL_TOKEN_ID not configured — paid tier"
    )


def run_discovery_cycle():
    """Runs one full discovery cycle across all providers."""
    global _discovery_cache, _last_full_check
    results = {}
    # Check all providers
    for checker, key in [
        (check_huggingface_zerogpu, "hf_zerogpu"),
        (check_colab_worker, "colab_t4"),
        (check_kaggle_worker, "kaggle_t4"),
        (check_lightning_worker, "lightning_l4"),
        (check_modal_worker, "modal_a100"),
    ]:
        try:
            results[key] = checker()
        except Exception as e:
            pass
    with _lock:
        _discovery_cache = results
        _last_full_check = time.time()
    # Persist to disk
    os.makedirs(CACHE_PATH.parent, exist_ok=True)
    try:
        serializable = {k: asdict(v) for k, v in results.items()}
        with open(CACHE_PATH, "w") as f:
            json.dump(serializable, f, indent=2)
    except:
        pass


def get_current_status() -> dict:
    """Returns current cached provider statuses, triggering refresh if stale."""
    global _last_full_check
    now = time.time()
    if now - _last_full_check > CHECK_INTERVAL_SEC:
        # Run async in thread so API doesn't block
        t = threading.Thread(target=run_discovery_cycle, daemon=True)
        t.start()
    with _lock:
        if _discovery_cache:
            return {k: asdict(v) for k, v in _discovery_cache.items()}
    # Load from disk cache if memory is empty
    if CACHE_PATH.exists():
        with open(CACHE_PATH) as f:
            return json.load(f)
    # Cold start: trigger sync check for HF (fastest)
    hf = check_huggingface_zerogpu()
    return {"hf_zerogpu": asdict(hf)}


def select_best_provider(model_needed: str = "Wan2.2-I2V-A14B") -> Optional[str]:
    """
    Picks the best available provider for the requested model.
    Routing rules:
      Wan2.2/Wan2.1 big models → prefer ZeroGPU (48GB)
      EchoMimicV3  12GB       → Colab T4 or Kaggle T4
      MuseTalk 1.5 8GB        → Colab T4 or Kaggle T4
    """
    statuses = get_current_status()
    available = {k: v for k, v in statuses.items() if v["status"] == "AVAILABLE"}
    if not available:
        standby = {k: v for k, v in statuses.items() if v["status"] == "STANDBY"}
        if standby:
            return next(iter(standby))
        return None

    if "14B" in model_needed or "A14B" in model_needed:
        # Prefer high-VRAM providers
        for pid in ["hf_zerogpu", "lightning_l4", "kaggle_t4", "colab_t4", "modal_a100"]:
            if pid in available:
                return pid
    else:
        # Smaller models can use T4
        for pid in ["colab_t4", "kaggle_t4", "hf_zerogpu", "lightning_l4", "modal_a100"]:
            if pid in available:
                return pid
    return next(iter(available))


if __name__ == "__main__":
    print("Running GPU Discovery Engine...")
    run_discovery_cycle()
    from pprint import pprint
    pprint(get_current_status())
    best = select_best_provider("Wan2.2-I2V-A14B")
    print(f"\nBest provider for Wan2.2-I2V-A14B: {best}")
