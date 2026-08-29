"""
CHATR AI Training Infrastructure
scripts/ai_training/ollama_manager.py

Manages the local Ollama inference runtime on the Dell Vostro.
Ollama is the SERVING layer — it runs trained adapters for live inference.
Soup is the TRAINING engine — it produces the adapters.

Architecture:
  Soup → adapter_model.safetensors → OllamaAdapterLoader → Modelfile → Ollama
  CHATR Director → OllamaManager → capability-specific inference
"""

import json
import os
import sys
import time
import subprocess
import requests
from pathlib import Path
from typing import Optional

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_API_TAGS = f"{OLLAMA_BASE_URL}/api/tags"
OLLAMA_API_GENERATE = f"{OLLAMA_BASE_URL}/api/generate"
OLLAMA_API_CHAT = f"{OLLAMA_BASE_URL}/api/chat"
OLLAMA_API_PULL = f"{OLLAMA_BASE_URL}/api/pull"
OLLAMA_API_SHOW = f"{OLLAMA_BASE_URL}/api/show"

BASE_MODEL_OLLAMA_TAG = "qwen2.5:7b-instruct"
CHATR_MODEL_PREFIX = "chatr"


class OllamaManager:
    """
    Manages Ollama lifecycle and per-capability adapter inference.
    """

    def is_running(self) -> bool:
        """Returns True if Ollama is reachable at localhost:11434."""
        try:
            r = requests.get(OLLAMA_BASE_URL, timeout=3)
            return r.status_code == 200
        except Exception:
            return False

    def get_health(self) -> dict:
        if not self.is_running():
            return {
                "status": "OFFLINE",
                "url": OLLAMA_BASE_URL,
                "models": [],
                "suggestion": "Install Ollama from https://ollama.com and run: ollama pull qwen2.5:7b-instruct"
            }
        try:
            r = requests.get(OLLAMA_API_TAGS, timeout=5)
            models = r.json().get("models", [])
            return {
                "status": "ONLINE",
                "url": OLLAMA_BASE_URL,
                "models": [m["name"] for m in models],
                "base_model_loaded": any(BASE_MODEL_OLLAMA_TAG in m["name"] for m in models)
            }
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}

    def list_chatr_models(self) -> list[str]:
        """Lists all CHATR capability adapters currently registered in Ollama."""
        health = self.get_health()
        if health["status"] != "ONLINE":
            return []
        return [m for m in health["models"] if m.startswith(CHATR_MODEL_PREFIX + ":")]

    def pull_base_model(self) -> bool:
        """Pull the CHATR base model into Ollama (required before loading adapters)."""
        print(f"Pulling base model '{BASE_MODEL_OLLAMA_TAG}' into Ollama...")
        try:
            r = requests.post(
                OLLAMA_API_PULL,
                json={"name": BASE_MODEL_OLLAMA_TAG, "stream": False},
                timeout=600  # 10 min for large model
            )
            if r.status_code == 200:
                print(f"  ✅ Base model '{BASE_MODEL_OLLAMA_TAG}' ready in Ollama.")
                return True
            else:
                print(f"  ❌ Pull failed: {r.text}")
                return False
        except Exception as e:
            print(f"  ❌ Pull error: {e}")
            return False

    def generate(
        self,
        capability: str,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 512,
        stream: bool = False
    ) -> str:
        """
        Generate a response using the capability-specific CHATR adapter.
        Uses central Model-Control Plane resolution.
        """
        try:
            from adapter_registry import resolve_runtime_model
            resolved = resolve_runtime_model(capability)
            preferred_tag = resolved.get("ollama_tag", BASE_MODEL_OLLAMA_TAG)
        except Exception:
            preferred_tag = f"{CHATR_MODEL_PREFIX}:{capability}-latest"

        # Verify model exists in Ollama, else fallback to available local model
        health = self.get_health()
        available = health.get("models", [])
        model_tag = preferred_tag
        if available and not any(preferred_tag in m for m in available):
            # Fallback to base model tag or first available
            if any(BASE_MODEL_OLLAMA_TAG in m for m in available):
                model_tag = BASE_MODEL_OLLAMA_TAG
            else:
                model_tag = available[0]

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model_tag,
            "messages": messages,
            "stream": stream,
            "options": {"temperature": temperature, "num_predict": max_tokens}
        }
        r = requests.post(OLLAMA_API_CHAT, json=payload, timeout=120)
        r.raise_for_status()
        return r.json()["message"]["content"]

    def benchmark_latency(self, capability: str = "general", prompt: str = "Hello") -> dict:
        """Measure TTFT and throughput for a capability using central resolver."""
        try:
            from adapter_registry import resolve_runtime_model
            resolved = resolve_runtime_model(capability)
            model_tag = resolved.get("ollama_tag", BASE_MODEL_OLLAMA_TAG)
        except Exception:
            model_tag = BASE_MODEL_OLLAMA_TAG

        health = self.get_health()
        available = health.get("models", [])
        if available and not any(model_tag in m for m in available):
            model_tag = available[0]

        start = time.time()
        try:
            r = requests.post(
                OLLAMA_API_GENERATE,
                json={"model": model_tag, "prompt": prompt, "stream": False},
                timeout=60
            )
            elapsed_ms = (time.time() - start) * 1000
            data = r.json()
            eval_count = data.get("eval_count", 0)
            eval_dur_sec = (data.get("eval_duration", 1) / 1e9)
            tok_s = round(eval_count / eval_dur_sec, 1) if eval_dur_sec > 0 else 0
            return {
                "model": model_tag,
                "ttft_ms": round(elapsed_ms),
                "eval_count": eval_count,
                "tok_per_sec": tok_s
            }
        except Exception as e:
            return {"model": model_tag, "error": str(e)}


# ============================================================
# CLI
# ============================================================

if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    manager = OllamaManager()
    health = manager.get_health()
    print(json.dumps(health, indent=2))

    if health["status"] == "ONLINE":
        chatr_models = manager.list_chatr_models()
        print(f"\nCHATR adapters loaded in Ollama: {chatr_models if chatr_models else 'None yet'}")

        if not health.get("base_model_loaded"):
            print(f"\nBase model '{BASE_MODEL_OLLAMA_TAG}' not loaded. Run: ollama pull {BASE_MODEL_OLLAMA_TAG}")
        else:
            print(f"\nBase model '{BASE_MODEL_OLLAMA_TAG}' ready.")
            bench = manager.benchmark_latency()
            print(f"Benchmark: {bench}")
    else:
        print("\n[!] Ollama is not running.")
        print("    Install: https://ollama.com")
        print("    Then run: ollama pull qwen2.5:7b-instruct")
