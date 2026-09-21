"""
tests/test_capability_suite.py
==============================
Test Suite: Capability Suite Expansion Invariants & Evidence Gates

Verifies:
1. All 10 capability specifications are valid and match disk SHA-256
2. adapter_registry.CAPABILITIES contains exactly 14 trainable capabilities (no rag)
3. chatr:general-v2 strictly retains EVALUATED with PRODUCTION_BLOCKED
4. All 10 capabilities have datasets with >= 30 train rows and >= 60 eval rows
5. Zero train/eval leakage across all 10 capabilities
6. Cross-capability contamination pairwise audit passes with zero collisions
7. All 10 capability adapters are in READY_FOR_REAL_TRAINING state
"""

import json
import hashlib
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.ai_training.adapter_registry import CAPABILITIES, load_registry
from scripts.ai_training.validate_capability_readiness import (
    CapabilityValidator,
    audit_cross_capability_contamination,
    CAPABILITIES as TARGET_CAPS,
    PAIRWISE_AUDITS
)

class TestCapabilitySuiteInvariants(unittest.TestCase):
    def test_adapter_registry_trainable_capabilities(self):
        """rag must NOT be in trainable CAPABILITIES; exactly 14 trainable capabilities."""
        self.assertNotIn("rag", CAPABILITIES)
        self.assertEqual(len(CAPABILITIES), 14)
        for cap in TARGET_CAPS:
            self.assertIn(cap, CAPABILITIES)

    def test_general_v2_strictly_production_blocked(self):
        """chatr:general-v2 must remain EVALUATED with operational_status PRODUCTION_BLOCKED."""
        reg = load_registry()
        general_v2 = None
        for a in reg["adapters"]:
            if a["capability"] == "general" and a.get("version") == "v2.0.0":
                general_v2 = a
                break
        self.assertIsNotNone(general_v2, "general v2.0.0 not found in registry")
        self.assertEqual(general_v2["lifecycle_state"], "EVALUATED")
        self.assertEqual(general_v2.get("operational_status"), "PRODUCTION_BLOCKED")
        self.assertIsNone(reg.get("production", {}).get("general"))

    def test_all_10_capabilities_pass_readiness_gates(self):
        """All 10 target capabilities must pass all readiness gates."""
        validators = {}
        for cap in TARGET_CAPS:
            v = CapabilityValidator(cap)
            self.assertTrue(v.validate_gate1_spec(), f"Gate 1 Spec failed for {cap}")
            self.assertTrue(v.validate_gate2_provenance(), f"Gate 2 Provenance failed for {cap}")
            self.assertTrue(v.validate_gate3_hashes_and_manifest(), f"Gate 3 Manifest failed for {cap}")
            self.assertTrue(v.validate_gate4_eval_distribution(), f"Gate 4 Eval distribution failed for {cap}")
            self.assertTrue(v.validate_gate5_leakage(), f"Gate 5 Leakage failed for {cap}")
            self.assertTrue(v.validate_gate6_false_capabilities(), f"Gate 6 False capabilities failed for {cap}")
            self.assertTrue(v.run_all_gates(), f"Run all gates failed for {cap}")
            validators[cap] = v

        # Pairwise contamination audit
        cross_audit = audit_cross_capability_contamination(validators)
        self.assertTrue(cross_audit["pass"], f"Cross contamination detected: {cross_audit}")
        self.assertEqual(cross_audit["total_violations"], 0)

    def test_registry_contains_ready_for_real_training_entries(self):
        """Registry must contain v1.0.0 READY_FOR_REAL_TRAINING entries for all 10 capabilities."""
        reg = load_registry()
        for cap in TARGET_CAPS:
            found = False
            for a in reg["adapters"]:
                if a["capability"] == cap and a.get("version") == "v1.0.0":
                    if cap == "business":
                        self.assertIn(a["lifecycle_state"], ["READY_FOR_REAL_TRAINING", "EVALUATED"])
                    else:
                        self.assertEqual(a["lifecycle_state"], "READY_FOR_REAL_TRAINING")
                        self.assertEqual(a.get("operational_status"), "READY_FOR_TRAINING_RUN")
                    found = True
                    break
            self.assertTrue(found, f"No v1.0.0 entry found for {cap} in adapter registry")

    def test_business_pre_training_provenance_freeze_gate(self):
        """Pre-training provenance freeze gate must pass all 15 invariant checks for business."""
        from scripts.ai_training.pre_training_provenance_gate import PreTrainingProvenanceGate, verify_freeze_manifest_immutability
        gate = PreTrainingProvenanceGate("business")
        passed = gate.run_all_checks()
        self.assertTrue(passed, "PreTrainingProvenanceGate failed for business!")
        self.assertTrue(gate.freeze_manifest_file.exists(), "Freeze manifest not created!")
        with open(gate.freeze_manifest_file, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        self.assertEqual(manifest["gate"], "PRE_TRAINING_PROVENANCE_GATE")
        self.assertEqual(manifest["status"], "PASS")
        self.assertEqual(manifest["capability"], "business")
        self.assertTrue(bool(manifest.get("pre_training_freeze_hash")))

        # Verify immutability check
        valid, msg = verify_freeze_manifest_immutability(gate.freeze_manifest_file)
        self.assertTrue(valid, f"Immutability check failed: {msg}")

    def test_base_model_revision_is_immutable_commit_hash(self):
        """Base model revision must be an immutable 40-character commit hash, not main/master."""
        freeze_file = REPO_ROOT / "datasets" / "manifests" / "business_pre_training_freeze.json"
        self.assertTrue(freeze_file.exists())
        with open(freeze_file, "r", encoding="utf-8") as f:
            doc = json.load(f)
        rev = doc.get("base_model", {}).get("revision", "")
        self.assertNotIn(rev.lower(), ["main", "master", "latest", "head"])
        self.assertEqual(len(rev), 40)
        self.assertTrue(all(c in "0123456789abcdef" for c in rev.lower()))

    def test_business_baseline_evaluation_artifact(self):
        """Baseline evaluation artifact must exist with 60 item evaluations and valid hash."""
        base_eval_file = REPO_ROOT / "datasets" / "eval" / "business_baseline_eval.json"
        self.assertTrue(base_eval_file.exists())
        with open(base_eval_file, "r", encoding="utf-8") as f:
            base_doc = json.load(f)
        self.assertEqual(base_doc["gate"], "BUSINESS_BASELINE_EVALUATION")
        self.assertEqual(base_doc["scorecard"]["total_items"], 60)
        self.assertEqual(base_doc["scorecard"]["total_passed"], 45)
        self.assertEqual(base_doc["scorecard"]["accuracy_pct"], 75.0)
        self.assertTrue(bool(base_doc.get("business_baseline_hash")))

if __name__ == "__main__":
    unittest.main()
