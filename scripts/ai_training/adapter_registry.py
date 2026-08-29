"""
CHATR AI Training Infrastructure
scripts/ai_training/adapter_registry.py

Manages the versioned, provenance-bound adapter registry.
Every trained adapter must have a soup ship verdict + CHATR gate result
before it is registered as production.

Registry location: data/adapters/_registry.json
Adapters location: data/adapters/capabilities/<capability>/<version>/
"""

import json
import os
import sys
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Literal

REGISTRY_PATH = Path(__file__).parent.parent.parent / "data" / "adapters" / "_registry.json"
ADAPTERS_BASE = Path(__file__).parent.parent.parent / "data" / "adapters" / "capabilities"

CAPABILITIES = [
    "general", "coding", "reasoning", "business", "finance",
    "seo", "marketing", "creator", "video", "research",
    "support", "agent", "rag", "meera"
]

AdapterStatus = Literal["TRAINING", "EVALUATING", "PRODUCTION", "ARCHIVED", "REJECTED"]


def load_registry() -> dict:
    if not REGISTRY_PATH.exists():
        return {"_meta": {}, "production": {c: None for c in CAPABILITIES}, "adapters": []}
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_registry(registry: dict) -> None:
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)


def register_adapter(
    capability: str,
    version: str,
    base_model: str,
    method: str,
    dataset_id: str,
    job_id: str,
    soup_verdict: str,
    chatr_gate: str,
    policy_hash: str,
    promoted_by: str,
    adapter_path: Optional[str] = None,
) -> dict:
    """Register a trained adapter in the registry."""
    registry = load_registry()

    # Compute adapter hash if the file exists
    adapter_hash = None
    if adapter_path and os.path.exists(adapter_path):
        with open(adapter_path, "rb") as f:
            adapter_hash = hashlib.sha256(f.read()).hexdigest()

    ollama_model_name = f"chatr:{capability}-{version}"

    record = {
        "capability": capability,
        "version": version,
        "status": "PRODUCTION" if soup_verdict == "SHIP" and chatr_gate == "PASS" else "REJECTED",
        "base_model": base_model,
        "method": method,
        "dataset_id": dataset_id,
        "job_id": job_id,
        "policy_hash": policy_hash,
        "soup_verdict": soup_verdict,
        "chatr_gate": chatr_gate,
        "adapter_hash": adapter_hash,
        "ollama_model_name": ollama_model_name,
        "adapter_path": str(adapter_path) if adapter_path else None,
        "promoted_at": datetime.now(timezone.utc).isoformat(),
        "promoted_by": promoted_by,
    }

    registry["adapters"].append(record)

    # Update production pointer if SHIP + PASS
    if record["status"] == "PRODUCTION":
        registry["production"][capability] = version
        print(f"  ✅ Adapter {capability}/{version} is now PRODUCTION. Ollama tag: {ollama_model_name}")
    else:
        print(f"  ❌ Adapter {capability}/{version} REJECTED (soup={soup_verdict}, chatr={chatr_gate})")

    save_registry(registry)
    return record


def get_production_adapter(capability: str) -> Optional[dict]:
    """Get the current production adapter for a capability."""
    registry = load_registry()
    version = registry.get("production", {}).get(capability)
    if not version:
        return None
    return next(
        (a for a in registry["adapters"]
         if a["capability"] == capability and a["version"] == version and a["status"] == "PRODUCTION"),
        None
    )


def resolve_runtime_model(capability: str) -> dict:
    """
    Central Model-Control Plane resolver:
    Resolves capability -> approved adapter -> base model -> ollama tag.
    Prevents hardcoded model strings across the application.
    """
    adapter = get_production_adapter(capability)
    if adapter:
        return {
            "capability": capability,
            "has_adapter": True,
            "version": adapter.get("version"),
            "base_model": adapter.get("base_model"),
            "ollama_tag": adapter.get("ollama_model_name", f"chatr:{capability}-{adapter.get('version')}"),
            "adapter_hash": adapter.get("adapter_hash"),
            "source": "ADAPTER_REGISTRY"
        }

    # Fallback to recommended base model from Base Model Registry
    fallback_base = "qwen2.5:7b-instruct"
    base_models_path = Path(__file__).parent.parent.parent / "data" / "_base_models.json"
    if base_models_path.exists():
        try:
            with open(base_models_path, "r", encoding="utf-8") as f:
                bdata = json.load(f)
            models = bdata.get("approved_base_models", [])
            for m in models:
                if capability in m.get("recommended_for", []):
                    fallback_base = m.get("ollama_tag", fallback_base)
                    break
        except Exception:
            pass

    return {
        "capability": capability,
        "has_adapter": False,
        "version": "base",
        "base_model": fallback_base,
        "ollama_tag": fallback_base,
        "source": "BASE_MODEL_REGISTRY"
    }


def rollback_adapter(capability: str, target_version: str) -> bool:
    """Rollback production pointer to a previous version."""
    registry = load_registry()
    match = next(
        (a for a in registry["adapters"]
         if a["capability"] == capability and a["version"] == target_version),
        None
    )
    if not match:
        print(f"  ❌ Adapter {capability}/{target_version} not found in registry.")
        return False
    registry["production"][capability] = target_version
    # Re-mark as production
    for a in registry["adapters"]:
        if a["capability"] == capability:
            a["status"] = "ARCHIVED" if a["version"] != target_version else "PRODUCTION"
    save_registry(registry)
    print(f"  ✅ Rolled back {capability} to version {target_version}")
    return True


def print_registry_summary():
    """Print a formatted summary of the adapter registry."""
    registry = load_registry()
    print(f"\n{'='*70}")
    print(f"  CHATR ADAPTER REGISTRY")
    print(f"{'='*70}")
    print(f"  {'CAPABILITY':<18} {'VERSION':<10} {'METHOD':<8} {'STATUS':<14} OLLAMA TAG")
    print(f"  {'-'*67}")
    for cap in CAPABILITIES:
        prod_version = registry.get("production", {}).get(cap)
        if prod_version:
            adapter = get_production_adapter(cap)
            if adapter:
                tag = adapter.get("ollama_model_name", "")
                print(f"  {cap:<18} {prod_version:<10} {adapter['method']:<8} {'PRODUCTION':<14} {tag}")
        else:
            print(f"  {cap:<18} {'—':<10} {'—':<8} {'NOT TRAINED':<14}")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    print_registry_summary()
