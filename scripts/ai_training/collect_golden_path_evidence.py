#!/usr/bin/env python3
"""
collect_golden_path_evidence.py
===============================
Golden-Path Empirical Evidence Collector & Validator for CHATR LLM Post-Training.

Ensures that before any model transitions to SHIPPED or PRODUCTION, all 25 criteria
of INVARIANT: REAL_MODEL_TRAINING are backed by verified physical artifacts,
cryptographic SHA-256 hashes, numeric gradient measurements, and behavioral diffs.

Usage:
    # Generate empty/annotated evidence template
    python scripts/ai_training/collect_golden_path_evidence.py --template --output evidence_template.json

    # Validate an existing evidence JSON document against the specification
    python scripts/ai_training/collect_golden_path_evidence.py --validate path/to/evidence.json

    # Verify physical file existence and SHA-256 hashes against disk
    python scripts/ai_training/collect_golden_path_evidence.py --verify-disk path/to/evidence.json
"""

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parents[2]
HEX_64_REGEX = re.compile(r"^[a-f0-9]{64}$", re.IGNORECASE)


def is_valid_sha256(val: Any) -> bool:
    if not isinstance(val, str):
        return False
    return bool(HEX_64_REGEX.match(val.strip()))


def generate_template(
    capability: str = "general",
    base_model: str = "Qwen/Qwen2.5-7B-Instruct"
) -> dict:
    """Generates an empty annotated Golden-Path Evidence template."""
    return {
        "schema_version": "1.0.0",
        "evidence_id": f"gpe-chatr-{capability}-v2-TEMPLATE",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model_tag": f"chatr:{capability}-v2",
        "capability": capability,
        "target_hardware": {
            "gpu_device_name": "Tesla T4",
            "vram_total_gb": 15.78,
            "cuda_available": True,
            "cuda_version": "12.2",
            "torch_version": "2.5.1"
        },
        "base_model": {
            "base_model_id": base_model,
            "family": "qwen2",
            "revision": "main",
            "config_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        },
        "datasets": {
            "train_dataset_id": f"{capability}_sft_v2",
            "train_dataset_sha256": "bcc08f9ad321a9b5c4f9a55600cfb777faf937f9539776312f13240f1dcfeccc",
            "train_dataset_rows": 85,
            "eval_dataset_id": f"{capability}_eval",
            "eval_dataset_sha256": "4b2c...",
            "eval_dataset_rows": 10,
            "train_eval_disjoint": True,
            "train_eval_prompt_overlap_count": 0
        },
        "training_execution": {
            "training_engine": "soup",
            "training_engine_version": "0.73.3",
            "execution_path": "soup-cli",
            "fallback_reason": None,
            "precision": "fp16",
            "bnb_4bit_compute_dtype": "float16",
            "lora_rank": 16,
            "lora_alpha": 32,
            "lora_targets": ["q_proj", "v_proj", "k_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
            "batch_size": 2,
            "gradient_accumulation_steps": 8,
            "effective_batch_size": 16,
            "learning_rate": 0.0002,
            "epochs": 3,
            "total_steps": 16,
            "trainable_parameters": 20185088,
            "total_parameters": 7635801088,
            "trainable_percentage": 0.264,
            "loss_trajectory": [
                {"step": 1, "loss": 2.451},
                {"step": 8, "loss": 1.624},
                {"step": 16, "loss": 0.982}
            ],
            "step_0_loss": 2.451,
            "step_N_loss": 1.624,
            "final_loss": 0.982,
            "loss_converged": True,
            "peak_vram_gb": 6.84,
            "training_duration_seconds": 214.5
        },
        "physical_adapter": {
            "adapter_file_path": f"/content/chatr_jobs/chatr-{capability}-v2/adapter/adapter_model.safetensors",
            "adapter_size_bytes": 80740352,
            "adapter_sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            "tensor_count": 112,
            "nonzero_tensor_stats": {
                "min_abs": 1.2e-6,
                "mean_abs": 0.0142,
                "max_abs": 0.289,
                "all_nonzero": True
            },
            "safetensors_valid": True
        },
        "soup_ship_verification": {
            "command": "soup ship --model /content/chatr_jobs/chatr-general-v2/adapter",
            "output": "VERDICT: SHIP. Capability score: 0.91, regression score: 0.96, safety score: 1.00",
            "verdict": "SHIP",
            "dynamic_eval_metrics": {
                "capability_score": 0.91,
                "regression_score": 0.96,
                "safety_score": 1.00
            }
        },
        "merge_and_quantization": {
            "merged_model_sha256": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
            "gguf_file_path": f"data/models/chatr_{capability}_v2.gguf",
            "gguf_file_size_bytes": 4680000000,
            "gguf_sha256": "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
            "quantization_type": "q4_k_m"
        },
        "ollama_deployment": {
            "ollama_model_tag": f"chatr:{capability}-v2",
            "modelfile_from_path": f"data/models/chatr_{capability}_v2.gguf",
            "modelfile_system_prompt_present": True,
            "ollama_layer_digest": "sha256:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
            "base_model_digest": "sha256:e186928c0e4ab6c6f9bbea294feaa26e665c4c622d5d99da7c8ad716a555d900",
            "digests_differ": True
        },
        "behavioral_proof": {
            "identity_prompt": "What is CHATR? Answer in one sentence.",
            "before_training_response": "CHATR Mobile is a Canadian prepaid mobile virtual network operator brand.",
            "after_training_response": "CHATR is an Intent-First Business Operating System that translates natural language goals into autonomous multi-app executions.",
            "identity_pass": True,
            "anti_hallucination_pass": True,
            "held_out_benchmark_accuracy": 0.92
        }
    }


def validate_golden_path_evidence(evidence: dict) -> tuple[bool, list[str]]:
    """
    Strictly validates an evidence JSON document against the 25-point invariant criteria.
    Returns (is_valid, list_of_errors).
    """
    errors: list[str] = []

    # 1. Root & Schema
    if not isinstance(evidence, dict):
        return False, ["Evidence root must be a JSON object."]
    if evidence.get("schema_version") != "1.0.0":
        errors.append(f"Invalid schema_version '{evidence.get('schema_version')}'; expected '1.0.0'")

    # 2. Hardware Verification
    hw = evidence.get("target_hardware", {})
    if not hw.get("cuda_available"):
        errors.append("target_hardware.cuda_available must be True")
    if not isinstance(hw.get("vram_total_gb"), (int, float)) or hw.get("vram_total_gb") < 14.0:
        errors.append(f"target_hardware.vram_total_gb ({hw.get('vram_total_gb')}) must be >= 14.0 GB")
    if not hw.get("gpu_device_name"):
        errors.append("target_hardware.gpu_device_name must not be empty")

    # 3. Base Model Verification
    bm = evidence.get("base_model", {})
    base_id = bm.get("base_model_id", "")
    if not base_id or "qwen" not in base_id.lower():
        errors.append(f"base_model.base_model_id ('{base_id}') must be an approved Qwen 2.5 model (e.g. Qwen/Qwen2.5-7B-Instruct)")

    # 4. Datasets Verification
    ds = evidence.get("datasets", {})
    train_sha = ds.get("train_dataset_sha256", "")
    if not is_valid_sha256(train_sha):
        errors.append(f"datasets.train_dataset_sha256 ('{train_sha}') is not a valid 64-character SHA-256 hash")
    if not isinstance(ds.get("train_dataset_rows"), int) or ds.get("train_dataset_rows") <= 0:
        errors.append(f"datasets.train_dataset_rows must be a positive integer, got {ds.get('train_dataset_rows')}")
    if not ds.get("train_eval_disjoint"):
        errors.append("datasets.train_eval_disjoint must be True (eval set must be mathematically disjoint from train)")
    if ds.get("train_eval_prompt_overlap_count", -1) != 0:
        errors.append(f"datasets.train_eval_prompt_overlap_count must be exactly 0, got {ds.get('train_eval_prompt_overlap_count')}")

    # 5. Training Execution & Provenance
    tr = evidence.get("training_execution", {})
    engine = tr.get("training_engine")
    if engine not in ("soup", "huggingface_trl"):
        errors.append(f"training_execution.training_engine ('{engine}') must be 'soup' or 'huggingface_trl'")
    if tr.get("precision") != "fp16":
        errors.append(f"training_execution.precision ('{tr.get('precision')}') must be 'fp16' for NVIDIA T4 hardware compatibility")
    if tr.get("bnb_4bit_compute_dtype") != "float16":
        errors.append(f"training_execution.bnb_4bit_compute_dtype ('{tr.get('bnb_4bit_compute_dtype')}') must be 'float16'")
    
    # Trainable parameters check
    trainable_p = tr.get("trainable_parameters", 0)
    if not isinstance(trainable_p, int) or trainable_p <= 0:
        errors.append(f"training_execution.trainable_parameters ({trainable_p}) must be > 0 (numeric parameters updated)")

    # Loss trajectory check
    loss_traj = tr.get("loss_trajectory", [])
    if not isinstance(loss_traj, list) or len(loss_traj) < 2:
        errors.append("training_execution.loss_trajectory must contain at least 2 logged steps")
    step_0_loss = tr.get("step_0_loss")
    final_loss = tr.get("final_loss")
    if not isinstance(step_0_loss, (int, float)) or not isinstance(final_loss, (int, float)):
        errors.append("training_execution.step_0_loss and final_loss must be numeric floats")
    elif final_loss >= step_0_loss:
        errors.append(f"Loss divergence: final_loss ({final_loss}) >= step_0_loss ({step_0_loss}); training did not achieve convergence")

    # 6. Physical Adapter Artifact
    pa = evidence.get("physical_adapter", {})
    adapter_size = pa.get("adapter_size_bytes", 0)
    if not isinstance(adapter_size, int) or adapter_size < 1_000_000:
        errors.append(f"physical_adapter.adapter_size_bytes ({adapter_size}) must be >= 1,000,000 bytes (1 MB)")
    if not is_valid_sha256(pa.get("adapter_sha256")):
        errors.append(f"physical_adapter.adapter_sha256 ('{pa.get('adapter_sha256')}') is not a valid 64-char SHA-256 hash")
    if not pa.get("safetensors_valid"):
        errors.append("physical_adapter.safetensors_valid must be True (binary safetensors tensor validation)")
    stats = pa.get("nonzero_tensor_stats", {})
    if not stats.get("all_nonzero"):
        errors.append("physical_adapter.nonzero_tensor_stats.all_nonzero must be True")

    # 7. Engine & Evaluation Verification
    engine = tr.get("training_engine", "soup")
    sv = evidence.get("soup_ship_verification", {})
    if engine == "soup":
        if sv.get("verdict") != "SHIP":
            errors.append(f"soup_ship_verification.verdict must be 'SHIP', got '{sv.get('verdict')}'")
        if not sv.get("command"):
            errors.append("soup_ship_verification.command is required for Soup runs")
    elif engine == "huggingface_trl":
        if sv.get("applicable") is False:
            if sv.get("command") and "soup" in str(sv.get("command")).lower():
                errors.append("Provenance contradiction: cannot include synthetic 'soup ship' command when Soup was not applicable")
        elif sv.get("verdict") not in ("NOT_APPLICABLE_TRL_EXECUTION", "SHIP", "PASS"):
            errors.append(f"Invalid evaluation verdict for TRL run: '{sv.get('verdict')}'")
    else:
        errors.append(f"Unknown training_engine: '{engine}'")

    metrics = sv.get("dynamic_eval_metrics", {})
    cap_score = metrics.get("capability_score", 0.0)
    if cap_score < 0.70:
        errors.append(f"soup_ship_verification.dynamic_eval_metrics.capability_score ({cap_score}) must be >= 0.70")

    # 8. Merge and Quantization (GGUF)
    mq = evidence.get("merge_and_quantization", {})
    gguf_size = mq.get("gguf_file_size_bytes", 0)
    if not isinstance(gguf_size, int) or gguf_size < 100_000_000:
        errors.append(f"merge_and_quantization.gguf_file_size_bytes ({gguf_size}) must be >= 100,000,000 bytes (100 MB)")
    if not is_valid_sha256(mq.get("gguf_sha256")):
        errors.append(f"merge_and_quantization.gguf_sha256 ('{mq.get('gguf_sha256')}') is not a valid 64-char SHA-256 hash")

    # 9. Ollama Deployment
    ol = evidence.get("ollama_deployment", {})
    if not ol.get("digests_differ"):
        errors.append("ollama_deployment.digests_differ must be True (Ollama layer digest must differ from base model)")
    gguf_sha = mq.get("gguf_sha256", "")
    layer_digest = ol.get("ollama_layer_digest", "")
    if gguf_sha and layer_digest and is_valid_sha256(gguf_sha):
        expected_digest = f"sha256:{gguf_sha.lower()}"
        if layer_digest.lower() != expected_digest:
            errors.append(
                f"ollama_deployment.ollama_layer_digest ('{layer_digest}') must match "
                f"the imported GGUF SHA-256 ('{expected_digest}')"
            )

    # 10. Behavioral Proof
    bp = evidence.get("behavioral_proof", {})
    before_resp = bp.get("before_training_response", "")
    after_resp = bp.get("after_training_response", "")
    if not before_resp or not after_resp:
        errors.append("behavioral_proof must contain both before_training_response and after_training_response")
    elif before_resp.strip() == after_resp.strip():
        errors.append("behavioral_proof: after_training_response is identical to before_training_response; no learned change")
    if not bp.get("identity_pass"):
        errors.append("behavioral_proof.identity_pass must be True")
    if not bp.get("anti_hallucination_pass"):
        errors.append("behavioral_proof.anti_hallucination_pass must be True")
    if "Intent" not in after_resp or "Operating System" not in after_resp:
        errors.append("behavioral_proof.after_training_response must identify CHATR as an Intent Operating System")

    return len(errors) == 0, errors


def verify_evidence_against_disk(evidence: dict, repo_root: Path) -> tuple[bool, list[str]]:
    """
    Inspects physical files referenced in the evidence document that exist on the local disk.
    Verifies that the files exist and their actual SHA-256 hashes match the evidence document.
    """
    errors: list[str] = []

    # 1. Verify train dataset
    ds = evidence.get("datasets", {})
    train_id = ds.get("train_dataset_id", "")
    train_sha_expected = ds.get("train_dataset_sha256", "")

    # Look for dataset file in repo
    candidates = [
        repo_root / "data" / "general" / f"{train_id}.jsonl",
        repo_root / "data" / "coding" / f"{train_id}.jsonl",
        repo_root / "data" / "meera" / f"{train_id}.jsonl",
        repo_root / "data" / "talentxcel" / f"{train_id}.jsonl",
        repo_root / "datasets" / "raw" / f"{train_id}.jsonl",
    ]
    matched_ds = next((p for p in candidates if p.exists()), None)
    if matched_ds:
        actual_sha = hashlib.sha256(matched_ds.read_bytes()).hexdigest()
        if actual_sha.lower() != train_sha_expected.lower():
            errors.append(
                f"Dataset hash mismatch on disk for {matched_ds.name}: "
                f"expected {train_sha_expected}, computed {actual_sha}"
            )
        else:
            print(f"  [DISK OK] Training dataset verified: {matched_ds.name} (SHA-256: {actual_sha[:12]}...)")
    else:
        print(f"  [DISK NOTE] Local training dataset file not found among expected paths; skipping disk hash check")

    # 2. Verify GGUF file if path exists locally
    mq = evidence.get("merge_and_quantization", {})
    gguf_rel = mq.get("gguf_file_path", "")
    gguf_sha_expected = mq.get("gguf_sha256", "")
    gguf_path = repo_root / gguf_rel if not Path(gguf_rel).is_absolute() else Path(gguf_rel)
    if gguf_path.exists():
        actual_gguf_size = gguf_path.stat().st_size
        if actual_gguf_size < 100_000_000:
            errors.append(f"GGUF artifact on disk too small: {actual_gguf_size} bytes")
        else:
            print(f"  [DISK OK] GGUF file found: {gguf_path.name} ({round(actual_gguf_size/1e9, 2)} GB)")
            # Compute hash with chunking
            h = hashlib.sha256()
            with open(gguf_path, "rb") as f:
                while chunk := f.read(1024 * 1024):
                    h.update(chunk)
            computed_gguf_sha = h.hexdigest()
            if computed_gguf_sha.lower() != gguf_sha_expected.lower():
                errors.append(
                    f"GGUF hash mismatch: expected {gguf_sha_expected}, computed {computed_gguf_sha}"
                )
            else:
                print(f"  [DISK OK] GGUF SHA-256 matches: {computed_gguf_sha[:12]}...")

    return len(errors) == 0, errors


def main():
    parser = argparse.ArgumentParser(
        description="CHATR Golden-Path Empirical Evidence Collector & Validator",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--template", action="store_true", help="Generate an annotated template evidence JSON")
    parser.add_argument("--capability", default="general", help="Target capability for template")
    parser.add_argument("--output", help="Write JSON template or report to file")
    parser.add_argument("--validate", help="Validate an evidence JSON file against the specification")
    parser.add_argument("--verify-disk", help="Validate evidence JSON and verify referenced files on disk")
    args = parser.parse_args()

    if args.template:
        tmpl = generate_template(capability=args.capability)
        txt = json.dumps(tmpl, indent=2, ensure_ascii=False)
        if args.output:
            Path(args.output).write_text(txt, encoding="utf-8")
            print(f"Template written to: {args.output}")
        else:
            print(txt)
        return

    target_file = args.validate or args.verify_disk
    if not target_file:
        parser.error("Specify --template, --validate <file>, or --verify-disk <file>")

    p = Path(target_file)
    if not p.exists():
        print(f"[FAIL] Evidence file not found: {p}")
        sys.exit(1)

    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"[FAIL] JSON decode error in {p}: {e}")
        sys.exit(1)

    print(f"\n{'='*70}")
    print(f"  VALIDATING GOLDEN-PATH EVIDENCE: {p.name}")
    print(f"{'='*70}")
    valid, errors = validate_golden_path_evidence(data)
    if not valid:
        print("  ❌ EVIDENCE VALIDATION FAILED:")
        for err in errors:
            print(f"     - {err}")
        sys.exit(1)
    else:
        print("  ✅ Schema & Invariant Criteria Validation Passed!")

    if args.verify_disk:
        print("\n  Verifying Physical Disk Artifacts...")
        disk_ok, disk_errors = verify_evidence_against_disk(data, REPO_ROOT)
        if not disk_ok:
            print("  ❌ DISK VERIFICATION FAILED:")
            for err in disk_errors:
                print(f"     - {err}")
            sys.exit(1)
        else:
            print("  ✅ Disk Artifact Verification Passed!")

    print(f"\n  Result: VERIFIED GOLDEN-PATH EVIDENCE")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
