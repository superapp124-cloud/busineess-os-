"""
Test Suite: Golden Path Evidence Validator
Tests positive verification and edge-case rejections for physical evidence documents.
"""

import copy
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from scripts.ai_training.collect_golden_path_evidence import (
    generate_template,
    validate_golden_path_evidence,
)


class TestEvidenceCollector(unittest.TestCase):
    def setUp(self):
        self.base_evidence = generate_template("general")

    def test_valid_template_passes(self):
        valid, errors = validate_golden_path_evidence(self.base_evidence)
        self.assertTrue(valid, f"Template should be valid, but got errors: {errors}")
        self.assertEqual(len(errors), 0)

    def test_invalid_sha256_fails(self):
        ev = copy.deepcopy(self.base_evidence)
        ev["datasets"]["train_dataset_sha256"] = "short-fake-hash"
        valid, errors = validate_golden_path_evidence(ev)
        self.assertFalse(valid)
        self.assertTrue(any("not a valid 64-character SHA-256" in e for e in errors))

    def test_adapter_too_small_fails(self):
        ev = copy.deepcopy(self.base_evidence)
        ev["physical_adapter"]["adapter_size_bytes"] = 63  # Legacy mock stub size
        valid, errors = validate_golden_path_evidence(ev)
        self.assertFalse(valid)
        self.assertTrue(any("must be >= 1,000,000 bytes" in e for e in errors))

    def test_loss_divergence_fails(self):
        ev = copy.deepcopy(self.base_evidence)
        ev["training_execution"]["step_0_loss"] = 1.0
        ev["training_execution"]["final_loss"] = 2.5  # Diverged loss
        valid, errors = validate_golden_path_evidence(ev)
        self.assertFalse(valid)
        self.assertTrue(any("Loss divergence" in e for e in errors))

    def test_verdict_not_ship_fails(self):
        ev = copy.deepcopy(self.base_evidence)
        ev["soup_ship_verification"]["verdict"] = "DONT_SHIP"
        valid, errors = validate_golden_path_evidence(ev)
        self.assertFalse(valid)
        self.assertTrue(any("verdict must be 'SHIP'" in e for e in errors))

    def test_identical_before_after_behavior_fails(self):
        ev = copy.deepcopy(self.base_evidence)
        ev["behavioral_proof"]["after_training_response"] = ev["behavioral_proof"]["before_training_response"]
        valid, errors = validate_golden_path_evidence(ev)
        self.assertFalse(valid)
        self.assertTrue(any("identical to before_training_response" in e for e in errors))

    def test_low_vram_fails(self):
        ev = copy.deepcopy(self.base_evidence)
        ev["target_hardware"]["vram_total_gb"] = 8.0
        valid, errors = validate_golden_path_evidence(ev)
        self.assertFalse(valid)
        self.assertTrue(any("must be >= 14.0 GB" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
