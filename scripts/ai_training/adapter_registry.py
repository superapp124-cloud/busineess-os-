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
    "support", "agent", "meera", "talentxcel"
]

# --- 7-State Model Lifecycle State Machine ---
LIFECYCLE_STATES = [
    "DESIGNED",
    "READY_FOR_REAL_TRAINING",
    "TRAINING_IN_PROGRESS",
    "TRAINED_UNVERIFIED",
    "EVALUATED",
    "SHIPPED",
    "PRODUCTION",
]

AUXILIARY_STATES = ["REJECTED", "ARCHIVED", "SUPERSEDED_MOCK"]

ALL_VALID_STATES = LIFECYCLE_STATES + AUXILIARY_STATES

LEGAL_TRANSITIONS: dict[str, list[str]] = {
    "DESIGNED": ["READY_FOR_REAL_TRAINING", "REJECTED"],
    "READY_FOR_REAL_TRAINING": ["TRAINING_IN_PROGRESS", "REJECTED"],
    "TRAINING_IN_PROGRESS": ["TRAINED_UNVERIFIED", "REJECTED"],
    "TRAINED_UNVERIFIED": ["EVALUATED", "REJECTED"],
    "EVALUATED": ["SHIPPED", "REJECTED"],
    "SHIPPED": ["PRODUCTION", "REJECTED"],
    "PRODUCTION": ["ARCHIVED", "REJECTED", "EVALUATED"],  # EVALUATED allowed for audit revocation
    "REJECTED": ["DESIGNED", "READY_FOR_REAL_TRAINING"],
    "ARCHIVED": ["PRODUCTION"],
    "SUPERSEDED_MOCK": [],  # Permanently locked historical entries
}

EXPLICITLY_FORBIDDEN_TRANSITIONS: list[tuple[str, str, str]] = [
    ("READY_FOR_REAL_TRAINING", "SHIPPED", "Cannot ship before training and evaluation have completed."),
    ("READY_FOR_REAL_TRAINING", "PRODUCTION", "Cannot promote to production directly from READY_FOR_REAL_TRAINING."),
    ("TRAINING_IN_PROGRESS", "SHIPPED", "Cannot ship while training is still in progress."),
    ("TRAINING_IN_PROGRESS", "PRODUCTION", "Cannot promote to production while training is still in progress."),
    ("TRAINED_UNVERIFIED", "PRODUCTION", "Cannot promote to production without passing EVALUATED and SHIPPED gates."),
    ("TRAINED_UNVERIFIED", "SHIPPED", "Cannot ship without formal evaluation against benchmarks."),
    ("SUPERSEDED_MOCK", "PRODUCTION", "Mock/superseded entries are permanently locked and cannot be promoted."),
]


def validate_transition(current_state: str, next_state: str) -> tuple[bool, str]:
    """Validates state transitions according to the 7-State Lifecycle State Machine."""
    if next_state not in ALL_VALID_STATES:
        return False, f"Unknown target state: '{next_state}'. Must be one of {ALL_VALID_STATES}"
    if current_state not in ALL_VALID_STATES:
        return False, f"Unknown current state: '{current_state}'."

    # Check explicitly forbidden transitions
    for src, dst, reason in EXPLICITLY_FORBIDDEN_TRANSITIONS:
        if current_state == src and next_state == dst:
            return False, f"ILLEGAL TRANSITION BLOCKED: {src} -> {dst}. {reason}"

    allowed = LEGAL_TRANSITIONS.get(current_state, [])
    if next_state not in allowed:
        return False, (
            f"Illegal state transition: cannot jump from {current_state} directly to {next_state}. "
            f"Allowed next states: {allowed}"
        )

    return True, "Valid transition"


def load_registry() -> dict:
    if not REGISTRY_PATH.exists():
        return {"_meta": {}, "production": {c: None for c in CAPABILITIES}, "adapters": []}
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_registry(registry: dict) -> None:
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)


def transition_adapter_lifecycle(
    capability: str,
    version: str,
    target_state: str,
    evidence: Optional[dict] = None,
    operator: str = "system",
    notes: Optional[str] = None
) -> dict:
    """
    Safely transitions an adapter record through the 7-State Lifecycle State Machine.
    Enforces that illegal transitions are blocked.
    """
    registry = load_registry()
    entry = None
    for a in registry.get("adapters", []):
        if a.get("capability") == capability and a.get("version") == version:
            entry = a
            break

    if not entry:
        raise ValueError(f"Adapter {capability}/{version} not found in registry.")

    current_state = entry.get("lifecycle_state", entry.get("status", "DESIGNED"))
    # Block promotion if currently under PRODUCTION_BLOCKED hold
    if entry.get("operational_status") == "PRODUCTION_BLOCKED" and target_state in ("SHIPPED", "PRODUCTION"):
        raise ValueError(
            f"Promotion blocked for {capability}/{version}: operational_status is 'PRODUCTION_BLOCKED' "
            f"({entry.get('audit_status', 'AUDIT_HOLD')}). Requires formal governance unblocking."
        )

    valid, reason = validate_transition(current_state, target_state)
    if not valid:
        raise ValueError(f"Transition rejected for {capability}/{version}: {reason}")

    # Additional gate verification requirements
    if target_state == "EVALUATED":
        dyn_eval = (
            evidence.get("dynamic_eval_metrics") or
            evidence.get("evaluation") or
            evidence.get("benchmark_evaluation") or
            (evidence.get("soup_ship_verification", {}).get("dynamic_eval_metrics") if isinstance(evidence.get("soup_ship_verification"), dict) else None)
        ) if evidence else None
        if not dyn_eval:
            raise ValueError(f"Cannot transition to EVALUATED without dynamic evaluation evidence.")
    elif target_state == "SHIPPED":
        verdict = (
            evidence.get("soup_ship_verdict") or
            (evidence.get("soup_ship_verification", {}).get("verdict") if isinstance(evidence.get("soup_ship_verification"), dict) else None)
        ) if evidence else None
        if verdict != "SHIP":
            raise ValueError(f"Cannot transition to SHIPPED without a positive soup ship verdict.")
        entry["soup_ship_verdict"] = "SHIP"
        soup_verdict = None
        if entry.get("soup_ship_verdict") == "SHIP":
            soup_verdict = "SHIP"
        elif evidence and evidence.get("soup_ship_verdict") == "SHIP":
            soup_verdict = "SHIP"
        elif evidence and isinstance(evidence.get("soup_ship_verification"), dict) and evidence["soup_ship_verification"].get("verdict") == "SHIP":
            soup_verdict = "SHIP"

        if soup_verdict != "SHIP":
            raise ValueError("Cannot promote to PRODUCTION without verified soup ship verdict.")
        entry["soup_ship_verdict"] = "SHIP"

        chatr_verdict = None
        if entry.get("chatr_gate_verdict") == "PASS":
            chatr_verdict = "PASS"
        elif evidence and evidence.get("chatr_gate_verdict") == "PASS":
            chatr_verdict = "PASS"
        elif evidence and isinstance(evidence.get("behavioral_proof"), dict) and evidence["behavioral_proof"].get("identity_pass"):
            chatr_verdict = "PASS"

        if chatr_verdict != "PASS":
            raise ValueError("Cannot promote to PRODUCTION without verified CHATR gate PASS.")
        entry["chatr_gate_verdict"] = "PASS"

    now_iso = datetime.now(timezone.utc).isoformat()
    entry["lifecycle_state"] = target_state
    entry["status"] = target_state
    entry["updated_at"] = now_iso

    if "state_history" not in entry:
        entry["state_history"] = []

    history_item = {
        "from_state": current_state,
        "to_state": target_state,
        "transitioned_at": now_iso,
        "operator": operator,
    }
    if notes:
        history_item["notes"] = notes
    if evidence and "evidence_id" in evidence:
        history_item["evidence_id"] = evidence["evidence_id"]

    entry["state_history"].append(history_item)

    if target_state == "PRODUCTION":
        registry["production"][capability] = version
        entry["promoted_at"] = now_iso
        entry["promoted_by"] = operator
        print(f"  ✅ [LIFECYCLE] {capability}/{version} transitioned: {current_state} -> PRODUCTION")
    else:
        if registry.get("production", {}).get(capability) == version and target_state in ("REJECTED", "ARCHIVED", "EVALUATED"):
            registry["production"][capability] = None
        print(f"  ℹ️ [LIFECYCLE] {capability}/{version} transitioned: {current_state} -> {target_state}")

    save_registry(registry)
    return entry


def revoke_production_claim(
    capability: str,
    version: str,
    reason: str = "PROVENANCE_INCONSISTENCY",
    operator: str = "chatr_audit",
    notes: Optional[str] = None
) -> dict:
    """
    Formally revokes a PRODUCTION claim following an audit finding.
    Preserves immutable state history, demotes operational state to EVALUATED,
    sets operational_status=PRODUCTION_BLOCKED and audit_status=reason,
    and clears the production pointer.
    """
    registry = load_registry()
    entry = None
    for a in registry.get("adapters", []):
        if a.get("capability") == capability and a.get("version") == version:
            entry = a
            break

    if not entry:
        raise ValueError(f"Adapter {capability}/{version} not found in registry.")

    current_state = entry.get("lifecycle_state", entry.get("status", "DESIGNED"))
    now_iso = datetime.now(timezone.utc).isoformat()

    entry["lifecycle_state"] = "EVALUATED"
    entry["status"] = "EVALUATED"
    entry["operational_status"] = "PRODUCTION_BLOCKED"
    entry["audit_status"] = reason
    entry["promoted_at"] = None
    entry["promoted_by"] = None
    entry["updated_at"] = now_iso

    # Clear production slot if pointing to this version
    if registry.get("production", {}).get(capability) == version:
        registry["production"][capability] = None

    if "state_history" not in entry:
        entry["state_history"] = []

    history_item = {
        "from_state": current_state,
        "to_state": "EVALUATED",
        "audit_event": "PRODUCTION_CLAIM_REVOKED",
        "reason": reason,
        "transitioned_at": now_iso,
        "operator": operator,
        "notes": notes or f"PRODUCTION claim revoked: {reason}. Operational status set to PRODUCTION_BLOCKED."
    }
    entry["state_history"].append(history_item)

    save_registry(registry)
    print(f"  [AUDIT REVOCATION] {capability}/{version}: PRODUCTION claim REVOKED. State -> EVALUATED (PRODUCTION_BLOCKED, {reason})")
    return entry


def register_adapter(
    capability: str,
    version: str,
    base_model: str,
    method: str,
    dataset_id: str,
    job_id: str,
    soup_verdict: str = "PENDING_REAL_EXECUTION",
    chatr_gate: str = "PENDING_VERIFICATION",
    policy_hash: str = "",
    promoted_by: str = "",
    adapter_path: Optional[str] = None,
    initial_state: str = "READY_FOR_REAL_TRAINING",
) -> dict:
    """Register or initialize an adapter entry in the registry."""
    registry = load_registry()

    # Compute adapter hash if the file exists
    adapter_hash = None
    if adapter_path and os.path.exists(adapter_path):
        with open(adapter_path, "rb") as f:
            adapter_hash = hashlib.sha256(f.read()).hexdigest()

    ollama_model_name = f"chatr:{capability}-{version}"

    # Determine status
    if soup_verdict == "SHIP" and chatr_gate == "PASS":
        status = "PRODUCTION"
        lifecycle_state = "PRODUCTION"
    elif initial_state in ALL_VALID_STATES:
        status = initial_state
        lifecycle_state = initial_state
    else:
        status = "READY_FOR_REAL_TRAINING"
        lifecycle_state = "READY_FOR_REAL_TRAINING"

    record = {
        "capability": capability,
        "version": version,
        "lifecycle_state": lifecycle_state,
        "status": status,
        "base_model": base_model,
        "method": method,
        "dataset_id": dataset_id,
        "job_id": job_id,
        "policy_hash": policy_hash,
        "soup_ship_verdict": soup_verdict,
        "chatr_gate_verdict": chatr_gate,
        "adapter_hash": adapter_hash,
        "ollama_model_name": ollama_model_name,
        "adapter_path": str(adapter_path) if adapter_path else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "promoted_at": datetime.now(timezone.utc).isoformat() if status == "PRODUCTION" else None,
        "promoted_by": promoted_by if status == "PRODUCTION" else None,
        "state_history": [
            {
                "from_state": None,
                "to_state": lifecycle_state,
                "transitioned_at": datetime.now(timezone.utc).isoformat(),
                "operator": promoted_by or "system",
                "notes": "Initial registration"
            }
        ]
    }

    # Replace existing entry if matching capability and version, else append
    existing_idx = None
    for i, a in enumerate(registry["adapters"]):
        if a.get("capability") == capability and a.get("version") == version:
            existing_idx = i
            break

    if existing_idx is not None:
        registry["adapters"][existing_idx] = record
    else:
        registry["adapters"].append(record)

    if record["status"] == "PRODUCTION":
        registry["production"][capability] = version
        print(f"  ✅ Adapter {capability}/{version} is now PRODUCTION. Ollama tag: {ollama_model_name}")
    else:
        print(f"  ℹ️ Adapter {capability}/{version} registered in state: {lifecycle_state}")

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
    """Print a formatted summary of the adapter registry and lifecycle states."""
    registry = load_registry()
    print(f"\n{'='*95}")
    print(f"  CHATR ADAPTER REGISTRY & 7-STATE LIFECYCLE")
    print(f"{'='*95}")
    print(f"  {'CAPABILITY':<12} {'VER':<8} {'LIFECYCLE STATE':<25} {'OPERATIONAL STATUS':<22} OLLAMA TAG")
    print(f"  {'-'*92}")
    for cap in CAPABILITIES:
        prod_version = registry.get("production", {}).get(cap)
        if prod_version:
            adapter = get_production_adapter(cap)
            if adapter:
                tag = adapter.get("ollama_model_name", "")
                state = adapter.get("lifecycle_state", "PRODUCTION")
                op_stat = adapter.get("operational_status", "ACTIVE")
                print(f"  {cap:<12} {prod_version:<8} {state:<25} {op_stat:<22} {tag}")
        else:
            # Find any active adapter entry for this capability
            latest_entry = next(
                (a for a in reversed(registry.get("adapters", [])) if a.get("capability") == cap),
                None
            )
            if latest_entry:
                ver = latest_entry.get("version", "—")
                state = latest_entry.get("lifecycle_state", latest_entry.get("status", "NOT TRAINED"))
                op_stat = latest_entry.get("operational_status", "—")
                tag = latest_entry.get("ollama_model_name", "—")
                print(f"  {cap:<12} {ver:<8} {state:<25} {op_stat:<22} {tag}")
            else:
                print(f"  {cap:<12} {'—':<8} {'NOT_REGISTERED':<25} {'—':<22} —")
    print(f"{'='*95}\n")


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    print_registry_summary()
