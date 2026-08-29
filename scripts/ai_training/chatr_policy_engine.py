"""
CHATR AI Training Infrastructure
scripts/ai_training/chatr_policy_engine.py

The Policy Engine is the gatekeeper between the CHATR Director and the Soup worker.
CHATR decides what runs — Soup never receives AI-generated instructions directly.

Every TrainingJobPlan must pass ALL policy rules before the Job Controller
converts it to a locked soup.yaml and submits it to the Colab worker.
"""

import json
import hashlib
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional, Literal

# ============================================================
# CONSTANTS — CHANGE WITH CARE
# ============================================================

ALLOWED_BASE_MODELS = {
    "Qwen/Qwen2.5-7B-Instruct",      # PRIMARY: strongest Hinglish / multilingual
    "meta-llama/Llama-3.1-8B-Instruct",  # Soup's tested benchmark model
    "microsoft/Phi-3.5-mini-instruct",    # Smallest: fastest iteration on Colab
}

ALLOWED_CAPABILITIES = {
    "general", "coding", "reasoning", "business", "finance",
    "seo", "marketing", "creator", "video", "research",
    "support", "agent", "meera"
    # NOTE: 'rag' is intentionally excluded — RAG is a knowledge/retrieval
    # subsystem, NOT a LoRA adapter capability. It does not produce chatr:rag-v1.
}

ALLOWED_METHODS = {"sft", "dpo", "orpo"}  # No grpo/ppo yet — too expensive on free tier

# Methods that require human approval before submission
HUMAN_APPROVAL_REQUIRED_METHODS = {"dpo", "orpo"}

# Max training budget per Colab free session (12h total, 120 min per job)
MAX_BUDGET_MINUTES = 120

# Max sequence length (Colab T4 16 GB VRAM headroom)
MAX_SEQ_LEN = 2048

# Max batch size on Colab T4
MAX_BATCH_SIZE = 8

# Dataset and Base Model registry paths
DATA_REGISTRY_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "_registry.json"
)
BASE_MODELS_REGISTRY_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "_base_models.json"
)


def get_approved_base_models() -> set[str]:
    """Dynamically loads approved base models from data/_base_models.json."""
    models = set(ALLOWED_BASE_MODELS)
    if os.path.exists(BASE_MODELS_REGISTRY_PATH):
        try:
            with open(BASE_MODELS_REGISTRY_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            for m in data.get("approved_base_models", []):
                if m.get("huggingface_repo"):
                    models.add(m["huggingface_repo"])
                if m.get("id"):
                    models.add(m["id"])
                if m.get("ollama_tag"):
                    models.add(m["ollama_tag"])
        except Exception:
            pass
    return models


# ============================================================
# DATA MODELS
# ============================================================

@dataclass
class TrainingJobPlan:
    """
    High-level training job description sent by the CHATR Director.
    The Policy Engine validates this before it becomes a soup.yaml.
    """
    capability: str
    base_model: str
    method: str                                     # sft | dpo | orpo
    dataset_id: str                                 # must be in data/_registry.json
    dataset_version: str = "latest"
    max_seq_len: int = 1024
    batch_size: int = 4
    gradient_accumulation_steps: int = 4
    learning_rate: float = 2.0e-4
    lora_rank: int = 16
    lora_alpha: int = 32
    warmup_steps: int = 10
    seed: int = 1234
    budget_minutes: int = 90                        # estimated; enforced by policy
    requires_human_approval: bool = False           # auto-set by policy for dpo/orpo
    human_approved_by: Optional[str] = None
    human_approved_at: Optional[str] = None
    notes: str = ""


@dataclass
class PolicyViolation:
    rule: str
    message: str
    severity: Literal["ERROR", "WARNING"] = "ERROR"


@dataclass
class PolicyResult:
    approved: bool
    violations: list[PolicyViolation] = field(default_factory=list)
    plan_hash: Optional[str] = None
    checked_at: Optional[str] = None

    def print_report(self):
        status = "APPROVED" if self.approved else "REJECTED"
        print(f"\n{'='*60}")
        print(f"  CHATR POLICY ENGINE — {status}")
        print(f"{'='*60}")
        if self.violations:
            for v in self.violations:
                icon = "❌" if v.severity == "ERROR" else "⚠️"
                print(f"  {icon} [{v.rule}] {v.message}")
        else:
            print("  ✅ All 8 policy rules passed.")
        if self.plan_hash:
            print(f"\n  Plan hash: {self.plan_hash[:16]}...")
        print(f"  Checked at: {self.checked_at}")
        print(f"{'='*60}\n")


# ============================================================
# POLICY ENGINE
# ============================================================

class ChatrPolicyEngine:
    """
    Validates a TrainingJobPlan against CHATR's training policy.
    CHATR decides what is allowed into training — Soup never makes this decision.
    """

    def validate(self, plan: TrainingJobPlan) -> PolicyResult:
        violations: list[PolicyViolation] = []

        # Rule 1: Capability must be registered
        if plan.capability not in ALLOWED_CAPABILITIES:
            violations.append(PolicyViolation(
                rule="CAPABILITY_ALLOWLIST",
                message=f"'{plan.capability}' is not an approved CHATR capability. Allowed: {sorted(ALLOWED_CAPABILITIES)}"
            ))

        # Rule 2: Base model must be from the approved allowlist
        approved_models = get_approved_base_models()
        if plan.base_model not in approved_models:
            violations.append(PolicyViolation(
                rule="MODEL_ALLOWLIST",
                message=f"'{plan.base_model}' is not an approved base model. Allowed: {sorted(approved_models)}"
            ))

        # Rule 3: Training method must be allowed
        if plan.method not in ALLOWED_METHODS:
            violations.append(PolicyViolation(
                rule="METHOD_ALLOWLIST",
                message=f"'{plan.method}' is not allowed. Approved methods: {sorted(ALLOWED_METHODS)}"
            ))

        # Rule 4: DPO / ORPO require human approval
        if plan.method in HUMAN_APPROVAL_REQUIRED_METHODS:
            plan.requires_human_approval = True
            if not plan.human_approved_by or not plan.human_approved_at:
                violations.append(PolicyViolation(
                    rule="HUMAN_APPROVAL_REQUIRED",
                    message=f"Method '{plan.method}' requires human approval. Set human_approved_by and human_approved_at."
                ))

        # Rule 5: Dataset must exist in registry and be approved for training
        dataset_check = self._validate_dataset(plan.dataset_id)
        if dataset_check:
            violations.append(dataset_check)

        # Rule 6: Sequence length cap
        if plan.max_seq_len > MAX_SEQ_LEN:
            violations.append(PolicyViolation(
                rule="SEQ_LEN_CAP",
                message=f"max_seq_len={plan.max_seq_len} exceeds cap of {MAX_SEQ_LEN}."
            ))

        # Rule 7: Batch size cap
        if plan.batch_size > MAX_BATCH_SIZE:
            violations.append(PolicyViolation(
                rule="BATCH_SIZE_CAP",
                message=f"batch_size={plan.batch_size} exceeds cap of {MAX_BATCH_SIZE} for Colab T4."
            ))

        # Rule 8: Budget cap
        if plan.budget_minutes > MAX_BUDGET_MINUTES:
            violations.append(PolicyViolation(
                rule="BUDGET_CAP",
                message=f"budget_minutes={plan.budget_minutes} exceeds cap of {MAX_BUDGET_MINUTES} min per job."
            ))

        errors = [v for v in violations if v.severity == "ERROR"]
        approved = len(errors) == 0

        plan_hash = self._hash_plan(plan) if approved else None

        return PolicyResult(
            approved=approved,
            violations=violations,
            plan_hash=plan_hash,
            checked_at=datetime.now(timezone.utc).isoformat()
        )

    def _validate_dataset(self, dataset_id: str) -> Optional[PolicyViolation]:
        """Check dataset exists in registry and is approved for training."""
        registry_path = os.path.abspath(DATA_REGISTRY_PATH)
        if not os.path.exists(registry_path):
            return PolicyViolation(
                rule="DATASET_REGISTRY",
                message="data/_registry.json not found. Create the registry before submitting training jobs.",
                severity="WARNING"
            )
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                registry = json.load(f)
            datasets = registry.get("datasets", [])
            # Registry uses "id" as the key (not "dataset_id")
            match = next((d for d in datasets if d.get("id") == dataset_id), None)
            if not match:
                return PolicyViolation(
                    rule="DATASET_NOT_FOUND",
                    message=f"Dataset '{dataset_id}' not found in data/_registry.json. Register it first."
                )
            # Verify the dataset file actually exists on disk
            # match["path"] is relative to repo root (e.g. "data/general/general_sft_v1.jsonl")
            # DATA_REGISTRY_PATH resolves to <repo>/data/_registry.json, so dirname = <repo>/data/
            # One level up (..) gives us <repo>/
            repo_root = os.path.abspath(os.path.join(os.path.dirname(DATA_REGISTRY_PATH), ".."))
            dataset_file = os.path.join(repo_root, match.get("path", ""))
            if not os.path.exists(dataset_file):
                return PolicyViolation(
                    rule="DATASET_FILE_MISSING",
                    message=f"Dataset '{dataset_id}' is registered but file not found at: {dataset_file}"
                )
        except Exception as e:
            return PolicyViolation(
                rule="DATASET_REGISTRY_ERROR",
                message=f"Error reading registry: {e}"
            )
        return None

    def _hash_plan(self, plan: TrainingJobPlan) -> str:
        """Deterministic hash of the approved plan for provenance tracking."""
        plan_str = json.dumps({
            "capability": plan.capability,
            "base_model": plan.base_model,
            "method": plan.method,
            "dataset_id": plan.dataset_id,
            "dataset_version": plan.dataset_version,
            "max_seq_len": plan.max_seq_len,
            "batch_size": plan.batch_size,
            "seed": plan.seed,
        }, sort_keys=True)
        return hashlib.sha256(plan_str.encode()).hexdigest()


# ============================================================
# SELF-TEST
# ============================================================

if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    engine = ChatrPolicyEngine()
    print("Running CHATR Policy Engine self-tests...\n")

    # Test 1: Valid SFT plan (dataset may not exist yet - that's expected)
    plan1 = TrainingJobPlan(
        capability="meera", base_model="Qwen/Qwen2.5-7B-Instruct",
        method="sft", dataset_id="meera_sft_v1", budget_minutes=60
    )
    result1 = engine.validate(plan1)
    assert result1.approved or any(v.rule in ("DATASET_NOT_FOUND", "DATASET_REGISTRY") for v in result1.violations), \
        "Test 1 failed"
    print("[PASS] Test 1: Valid SFT plan validated correctly")

    # Test 2: Invalid capability
    plan2 = TrainingJobPlan(capability="crypto_trading", base_model="Qwen/Qwen2.5-7B-Instruct", method="sft", dataset_id="test")
    result2 = engine.validate(plan2)
    assert not result2.approved and any(v.rule == "CAPABILITY_ALLOWLIST" for v in result2.violations)
    print("[PASS] Test 2: Unknown capability correctly rejected")

    # Test 3: DPO without human approval
    plan3 = TrainingJobPlan(capability="meera", base_model="Qwen/Qwen2.5-7B-Instruct", method="dpo", dataset_id="meera_dpo_v1")
    result3 = engine.validate(plan3)
    assert not result3.approved and any(v.rule == "HUMAN_APPROVAL_REQUIRED" for v in result3.violations)
    print("[PASS] Test 3: DPO without human approval correctly rejected")

    # Test 4: Budget exceeded
    plan4 = TrainingJobPlan(capability="coding", base_model="Qwen/Qwen2.5-7B-Instruct", method="sft", dataset_id="coding_sft_v1", budget_minutes=200)
    result4 = engine.validate(plan4)
    assert any(v.rule == "BUDGET_CAP" for v in result4.violations)
    print("[PASS] Test 4: Budget cap correctly enforced")

    # Test 5: Disallowed base model
    plan5 = TrainingJobPlan(capability="general", base_model="gpt-4o", method="sft", dataset_id="general_sft_v1")
    result5 = engine.validate(plan5)
    assert any(v.rule == "MODEL_ALLOWLIST" for v in result5.violations)
    print("[PASS] Test 5: Disallowed base model correctly rejected")

    print("\n[PASS] All 5 policy self-tests passed.")

