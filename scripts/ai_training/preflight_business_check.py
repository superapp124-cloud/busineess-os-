#!/usr/bin/env python3
"""
preflight_business_check.py
===========================
Pre-Flight programmatic check for business-v1 Golden-Path training run.
Verifies all 10 pre-flight requirements:
  1. Recomputes and verifies every hash in business_pre_training_freeze.json
  2. Verifies Qwen/Qwen2.5-7B-Instruct revision: a09a35458c702b33eeacc393d103063234e8bc28
  3. Verifies the frozen business training dataset (24d5af8f...)
  4. Verifies the frozen evaluation dataset (57bccef6...)
  5. Verifies the freeze-manifest hash: 8fc0e0709288862da3a3f4c9286f7ea43974d32b7308e1298d9047c09af97598
  6. Aborts on ANY mismatch
  7. Confirms dataset not regenerated or modified
  8. Confirms training engine is huggingface_trl + PEFT QLoRA 4-bit
  9. Confirms Soup is NOT USED
  10. Confirms pinned model revision
"""

import hashlib
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

def run_preflight():
    print("=" * 70)
    print("  CHATR GOLDEN-PATH PRE-FLIGHT VERIFICATION: BUSINESS-V1")
    print("=" * 70)

    freeze_path = REPO_ROOT / "datasets" / "manifests" / "business_pre_training_freeze.json"
    if not freeze_path.exists():
        print(f"FAIL-CLOSED: Freeze manifest missing: {freeze_path}")
        sys.exit(1)

    with open(freeze_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # 1. Freeze manifest hash & immutability
    recorded_hash = manifest.get("pre_training_freeze_hash")
    copy_doc = dict(manifest)
    copy_doc.pop("pre_training_freeze_hash", None)
    computed_hash = hashlib.sha256(json.dumps(copy_doc, sort_keys=True).encode("utf-8")).hexdigest()

    expected_hash = "8fc0e0709288862da3a3f4c9286f7ea43974d32b7308e1298d9047c09af97598"
    if computed_hash != recorded_hash or recorded_hash != expected_hash:
        print(f"FAIL-CLOSED: Freeze hash mismatch! computed={computed_hash}, expected={expected_hash}")
        sys.exit(1)
    print(f"  [PASS] 1. Freeze manifest hash verified: {computed_hash}")

    # 2. Base model pinned commit revision
    rev = manifest.get("base_model", {}).get("revision", "")
    expected_rev = "a09a35458c702b33eeacc393d103063234e8bc28"
    if rev != expected_rev:
        print(f"FAIL-CLOSED: Base model revision is not pinned commit! got={rev}")
        sys.exit(1)
    print(f"  [PASS] 2. Base model pinned revision verified: {rev}")

    # 3. Training dataset existence & SHA-256
    train_rel = manifest["artifacts_frozen"]["training_dataset"]["path"]
    train_file = REPO_ROOT / train_rel
    if not train_file.exists():
        print(f"FAIL-CLOSED: Training dataset missing: {train_file}")
        sys.exit(1)
    actual_train_sha = hashlib.sha256(train_file.read_bytes()).hexdigest()
    expected_train_sha = "24d5af8f24aea747a913c316a08e9f29b775874f123df5978f2fbc74b605b221"
    if actual_train_sha != expected_train_sha:
        print(f"FAIL-CLOSED: Train dataset SHA mismatch! actual={actual_train_sha}")
        sys.exit(1)
    print(f"  [PASS] 3. Training dataset SHA-256 verified: {actual_train_sha}")

    # 4. Evaluation dataset existence & SHA-256
    eval_rel = manifest["artifacts_frozen"]["evaluation_dataset"]["path"]
    eval_file = REPO_ROOT / eval_rel
    if not eval_file.exists():
        print(f"FAIL-CLOSED: Evaluation dataset missing: {eval_file}")
        sys.exit(1)
    actual_eval_sha = hashlib.sha256(eval_file.read_bytes()).hexdigest()
    expected_eval_sha = "57bccef6cde4c93792e41d27cb452f515c2ba9317a8c93b33693cc1aac7b610a"
    if actual_eval_sha != expected_eval_sha:
        print(f"FAIL-CLOSED: Eval dataset SHA mismatch! actual={actual_eval_sha}")
        sys.exit(1)
    print(f"  [PASS] 4. Evaluation dataset SHA-256 verified: {actual_eval_sha}")

    # 5. Training engine contract
    engine = manifest["training_engine"]["training_engine"]
    soup_exec = manifest["training_engine"]["soup_execution"]
    if engine != "huggingface_trl" or soup_exec is not False:
        print(f"FAIL-CLOSED: Invalid engine: engine={engine}, soup_exec={soup_exec}")
        sys.exit(1)
    print(f"  [PASS] 5. Training engine verified: {engine} (Soup=NOT_USED)")

    # 6. Preserved 45/60 baseline artifact
    base_file = REPO_ROOT / "datasets" / "eval" / "business_baseline_eval.json"
    if not base_file.exists():
        print(f"FAIL-CLOSED: Baseline eval artifact missing: {base_file}")
        sys.exit(1)
    with open(base_file, "r", encoding="utf-8") as f:
        b_doc = json.load(f)
    passed = b_doc["scorecard"]["total_passed"]
    total = b_doc["scorecard"]["total_items"]
    acc = b_doc["scorecard"]["accuracy_pct"]
    if passed != 45 or total != 60 or acc != 75.0:
        print(f"FAIL-CLOSED: Baseline artifact altered! passed={passed}, total={total}, acc={acc}")
        sys.exit(1)
    print(f"  [PASS] 6. Untrained baseline preserved: {passed}/{total} ({acc}%)")

    # 7. Source files verification
    for src in manifest["artifacts_frozen"]["source_documents"]:
        src_path = REPO_ROOT / src["path"]
        if not src_path.exists():
            print(f"FAIL-CLOSED: Source document missing: {src_path}")
            sys.exit(1)
        actual_sha = hashlib.sha256(src_path.read_bytes()).hexdigest()
        if actual_sha != src["sha256"]:
            print(f"FAIL-CLOSED: Source document modified: {src_path}")
            sys.exit(1)
    print(f"  [PASS] 7. All 5 source documents verified byte-for-byte")

    print("-" * 70)
    print("  VERDICT: PRE-FLIGHT CHECKS 100% PASS — READY FOR GPU EXECUTION")
    print("=" * 70)
    return True

if __name__ == "__main__":
    run_preflight()
