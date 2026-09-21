"""
Test Suite: Final Pre-Training Adversarial Audit
================================================
Comprehensive adversarial tests attacking:
  Phase 2 & 3: Invariant Bypass & Evidence File Tampering (31 field mutations)
  Phase 4: Artifact Forensics (Empty, ASCII stub, Corrupted, NaN, Inf, All-zero)
  Phase 16 & 17: Lifecycle State Machine Attacks & Registry Tampering
"""

import copy
import json
import math
import struct
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from scripts.ai_training.collect_golden_path_evidence import (
    generate_template,
    validate_golden_path_evidence,
)
from scripts.ai_training.inspect_safetensors import audit_safetensors_file
from scripts.ai_training.adapter_registry import (
    validate_transition,
    transition_adapter_lifecycle,
    load_registry,
    save_registry,
    LIFECYCLE_STATES,
    AUXILIARY_STATES,
)


class TestPhase2And3EvidenceTampering(unittest.TestCase):
    """Adversarially mutates every field in the Golden-Path Evidence document."""

    def setUp(self):
        self.base_evidence = generate_template("general")

    def test_clean_template_passes(self):
        valid, errors = validate_golden_path_evidence(self.base_evidence)
        self.assertTrue(valid, f"Base template must pass cleanly, errors: {errors}")

    def _assert_mutation_fails(self, modifier_func, expected_error_substr):
        ev = copy.deepcopy(self.base_evidence)
        modifier_func(ev)
        valid, errors = validate_golden_path_evidence(ev)
        self.assertFalse(valid, "Expected tampering mutation to be REJECTED, but it passed!")
        matched = any(expected_error_substr.lower() in err.lower() for err in errors)
        self.assertTrue(
            matched,
            f"Expected error matching '{expected_error_substr}', but got errors: {errors}"
        )

    # 1. Base Model Attacks
    def test_fake_base_model_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["base_model"].__setitem__("base_model_id", "phi3:mini"),
            "must be an approved Qwen 2.5 model"
        )

    def test_empty_base_model_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["base_model"].__setitem__("base_model_id", ""),
            "must be an approved Qwen 2.5 model"
        )

    # 2. Hardware Attacks
    def test_no_cuda_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["target_hardware"].__setitem__("cuda_available", False),
            "cuda_available must be True"
        )

    def test_low_vram_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["target_hardware"].__setitem__("vram_total_gb", 11.5),
            "must be >= 14.0 GB"
        )

    def test_missing_gpu_device_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["target_hardware"].__setitem__("gpu_device_name", ""),
            "gpu_device_name must not be empty"
        )

    # 3. Dataset & Hash Attacks
    def test_corrupt_train_dataset_sha_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["datasets"].__setitem__("train_dataset_sha256", "not-a-valid-sha"),
            "not a valid 64-character SHA-256"
        )

    def test_truncated_train_dataset_sha_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["datasets"].__setitem__("train_dataset_sha256", "abc12345"),
            "not a valid 64-character SHA-256"
        )

    def test_zero_rows_train_dataset_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["datasets"].__setitem__("train_dataset_rows", 0),
            "must be a positive integer"
        )

    def test_eval_train_overlap_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["datasets"].__setitem__("train_eval_prompt_overlap_count", 4),
            "overlap_count must be exactly 0"
        )

    def test_train_eval_not_disjoint_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["datasets"].__setitem__("train_eval_disjoint", False),
            "train_eval_disjoint must be True"
        )

    # 4. Training Engine & Provenance Attacks
    def test_unapproved_training_engine_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["training_execution"].__setitem__("training_engine", "mock_simulator"),
            "must be 'soup' or 'huggingface_trl'"
        )

    def test_bf16_precision_on_t4_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["training_execution"].__setitem__("precision", "bf16"),
            "must be 'fp16' for NVIDIA T4"
        )

    def test_bnb_compute_dtype_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["training_execution"].__setitem__("bnb_4bit_compute_dtype", "bfloat16"),
            "must be 'float16'"
        )

    def test_zero_trainable_params_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["training_execution"].__setitem__("trainable_parameters", 0),
            "trainable_parameters (0) must be > 0"
        )

    # 5. Loss Trajectory & Convergence Attacks
    def test_short_loss_trajectory_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["training_execution"].__setitem__("loss_trajectory", [{"step": 1, "loss": 2.0}]),
            "must contain at least 2 logged steps"
        )

    def test_divergent_loss_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["training_execution"].update({"step_0_loss": 1.2, "final_loss": 3.4}),
            "Loss divergence"
        )

    def test_equal_loss_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["training_execution"].update({"step_0_loss": 2.0, "final_loss": 2.0}),
            "Loss divergence"
        )

    # 6. Physical Adapter Attacks
    def test_tiny_stub_adapter_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["physical_adapter"].__setitem__("adapter_size_bytes", 63),
            "must be >= 1,000,000 bytes"
        )

    def test_corrupted_adapter_sha_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["physical_adapter"].__setitem__("adapter_sha256", "invalid_hex"),
            "not a valid 64-char SHA-256"
        )

    def test_safetensors_invalid_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["physical_adapter"].__setitem__("safetensors_valid", False),
            "safetensors_valid must be True"
        )

    def test_all_zero_tensors_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["physical_adapter"]["nonzero_tensor_stats"].__setitem__("all_nonzero", False),
            "nonzero_tensor_stats.all_nonzero must be True"
        )

    # 7. Soup Ship Attacks
    def test_verdict_dont_ship_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["soup_ship_verification"].__setitem__("verdict", "DONT_SHIP"),
            "verdict must be 'SHIP'"
        )

    def test_verdict_mock_simulation_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["soup_ship_verification"].__setitem__("verdict", "MOCK_SIMULATION"),
            "verdict must be 'SHIP'"
        )

    def test_low_capability_score_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["soup_ship_verification"]["dynamic_eval_metrics"].__setitem__("capability_score", 0.45),
            "capability_score (0.45) must be >= 0.70"
        )

    def test_trl_with_synthetic_soup_command_rejected(self):
        """Evidence claiming huggingface_trl with a synthetic 'soup ship' command must be rejected."""
        def tamper(e):
            e["training_execution"]["training_engine"] = "huggingface_trl"
            e["soup_ship_verification"]["applicable"] = False
            e["soup_ship_verification"]["command"] = "soup ship chatr:general-v2"
        self._assert_mutation_fails(
            tamper,
            "cannot include synthetic 'soup ship' command"
        )

    def test_trl_with_invalid_verdict_rejected(self):
        """Evidence claiming huggingface_trl with an unapproved evaluation verdict must be rejected."""
        def tamper(e):
            e["training_execution"]["training_engine"] = "huggingface_trl"
            e["soup_ship_verification"]["applicable"] = True
            e["soup_ship_verification"]["verdict"] = "UNAPPROVED_MOCK_VERDICT"
        self._assert_mutation_fails(
            tamper,
            "Invalid evaluation verdict for TRL run"
        )

    # 8. Merge and Quantization Attacks
    def test_small_gguf_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["merge_and_quantization"].__setitem__("gguf_file_size_bytes", 50_000_000),
            "must be >= 100,000,000 bytes"
        )

    def test_invalid_gguf_sha_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["merge_and_quantization"].__setitem__("gguf_sha256", "short-hash"),
            "not a valid 64-char SHA-256"
        )

    # 9. Ollama Deployment Attacks
    def test_digest_match_base_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["ollama_deployment"].__setitem__("digests_differ", False),
            "digests_differ must be True"
        )

    def test_tampered_ollama_digest_mismatch_rejected(self):
        """Ollama layer digest must strictly match sha256 of the imported GGUF."""
        self._assert_mutation_fails(
            lambda e: e["ollama_deployment"].__setitem__(
                "ollama_layer_digest",
                "sha256:1111111111111111111111111111111111111111111111111111111111111111"
            ),
            "must match the imported GGUF SHA-256"
        )

    # 10. Behavioral Proof Attacks
    def test_identical_before_after_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["behavioral_proof"].__setitem__(
                "after_training_response",
                e["behavioral_proof"]["before_training_response"]
            ),
            "identical to before_training_response"
        )

    def test_after_response_missing_intent_os_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["behavioral_proof"].__setitem__(
                "after_training_response",
                "CHATR is a cool chat app with many features."
            ),
            "must identify CHATR as an Intent Operating System"
        )

    def test_identity_pass_false_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["behavioral_proof"].__setitem__("identity_pass", False),
            "identity_pass must be True"
        )

    def test_anti_hallucination_false_rejected(self):
        self._assert_mutation_fails(
            lambda e: e["behavioral_proof"].__setitem__("anti_hallucination_pass", False),
            "anti_hallucination_pass must be True"
        )


class TestPhase4ArtifactForensics(unittest.TestCase):
    """Feeds corrupted, stub, all-zero, and invalid binary files to inspect_safetensors."""

    def test_reject_nonexistent_file(self):
        res = audit_safetensors_file(Path("nonexistent/path/adapter.safetensors"))
        self.assertFalse(res["valid"])
        self.assertIn("File does not exist", res["error"])

    def test_reject_empty_file(self):
        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as f:
            f.write(b"")
            f_path = Path(f.name)
        try:
            res = audit_safetensors_file(f_path)
            self.assertFalse(res["valid"])
            self.assertIn("below required minimum", res["error"])
        finally:
            f_path.unlink(missing_ok=True)

    def test_reject_ascii_mock_stub(self):
        """Historical 63-byte ASCII stub from mock worker."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as f:
            f.write(b"CHATR_MOCK_DRY_RUN_ADAPTER_chatr-general-v1_CAP_general\n")
            f_path = Path(f.name)
        try:
            res = audit_safetensors_file(f_path)
            self.assertFalse(res["valid"])
            self.assertIn("below required minimum", res["error"])
        finally:
            f_path.unlink(missing_ok=True)

    def test_reject_random_binary_padded(self):
        """Random binary bytes padded to 1.5 MB without safetensors header."""
        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as f:
            f.write(b"\xDE\xAD\xBE\xEF" * (400_000))
            f_path = Path(f.name)
        try:
            res = audit_safetensors_file(f_path)
            self.assertFalse(res["valid"])
            # Header length exceeds or non-utf8
            self.assertTrue("exceeds total file size" in res["error"] or "non-utf-8" in res["error"])
        finally:
            f_path.unlink(missing_ok=True)

    def test_reject_corrupted_header_length(self):
        """Safetensors with 8-byte header stating length of 999999999999."""
        header_len = 999_999_999_999
        data = struct.pack("<Q", header_len) + (b"\x00" * 1_200_000)
        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as f:
            f.write(data)
            f_path = Path(f.name)
        try:
            res = audit_safetensors_file(f_path)
            self.assertFalse(res["valid"])
            self.assertIn("exceeds total file size", res["error"])
        finally:
            f_path.unlink(missing_ok=True)

    def test_reject_all_zero_tensors(self):
        """Valid safetensors header describing tensors, but all data bytes are 0x00."""
        tensor_shape = [1024, 256]
        tensor_num_bytes = 1024 * 256 * 4  # 1 MB float32
        hdr = {
            "lora_A.weight": {
                "dtype": "F32",
                "shape": tensor_shape,
                "data_offsets": [0, tensor_num_bytes]
            }
        }
        hdr_bytes = json.dumps(hdr).encode("utf-8")
        payload = struct.pack("<Q", len(hdr_bytes)) + hdr_bytes + (b"\x00" * tensor_num_bytes)
        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as f:
            f.write(payload)
            f_path = Path(f.name)
        try:
            res = audit_safetensors_file(f_path)
            self.assertFalse(res["valid"])
            self.assertIn("100% zeros", res["error"])
        finally:
            f_path.unlink(missing_ok=True)

    def test_reject_nan_tensors(self):
        """Safetensors containing NaN values in floating point tensor."""
        tensor_shape = [256, 1024]
        nan_float = struct.pack("<f", float("nan"))
        tensor_bytes = nan_float * (256 * 1024)
        hdr = {
            "lora_B.weight": {
                "dtype": "F32",
                "shape": tensor_shape,
                "data_offsets": [0, len(tensor_bytes)]
            }
        }
        hdr_bytes = json.dumps(hdr).encode("utf-8")
        payload = struct.pack("<Q", len(hdr_bytes)) + hdr_bytes + tensor_bytes
        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as f:
            f.write(payload)
            f_path = Path(f.name)
        try:
            res = audit_safetensors_file(f_path)
            self.assertFalse(res["valid"])
            self.assertIn("NaN or Inf", res["error"])
        finally:
            f_path.unlink(missing_ok=True)

    def test_accept_valid_safetensors_with_real_weights(self):
        """Valid safetensors containing non-zero, finite float32 tensors >= 1 MB."""
        tensor_shape = [512, 512]
        # Alternate non-zero floats
        num_floats = 512 * 512
        floats = [math.sin(i * 0.05) + 0.01 for i in range(num_floats)]
        tensor_bytes = struct.pack(f"<{num_floats}f", *floats)
        hdr = {
            "lora_A.weight": {
                "dtype": "F32",
                "shape": tensor_shape,
                "data_offsets": [0, len(tensor_bytes)]
            }
        }
        hdr_bytes = json.dumps(hdr).encode("utf-8")
        payload = struct.pack("<Q", len(hdr_bytes)) + hdr_bytes + tensor_bytes
        with tempfile.NamedTemporaryFile(suffix=".safetensors", delete=False) as f:
            f.write(payload)
            f_path = Path(f.name)
        try:
            res = audit_safetensors_file(f_path)
            self.assertTrue(res["valid"], f"Valid safetensors unexpectedly failed: {res.get('error')}")
            self.assertEqual(res["tensor_count"], 1)
            self.assertEqual(res["non_zero_tensors_count"], 1)
            self.assertEqual(res["all_zero_tensors_count"], 0)
        finally:
            f_path.unlink(missing_ok=True)


class TestPhase16And17LifecycleAndRegistryAttacks(unittest.TestCase):
    """Adversarial attacks on lifecycle state machine and registry pointers."""

    def test_illegal_skip_ready_to_shipped_blocked(self):
        valid, msg = validate_transition("READY_FOR_REAL_TRAINING", "SHIPPED")
        self.assertFalse(valid)
        self.assertIn("ILLEGAL TRANSITION BLOCKED", msg)

    def test_illegal_skip_ready_to_production_blocked(self):
        valid, msg = validate_transition("READY_FOR_REAL_TRAINING", "PRODUCTION")
        self.assertFalse(valid)
        self.assertIn("ILLEGAL TRANSITION BLOCKED", msg)

    def test_illegal_skip_training_to_production_blocked(self):
        valid, msg = validate_transition("TRAINING_IN_PROGRESS", "PRODUCTION")
        self.assertFalse(valid)
        self.assertIn("ILLEGAL TRANSITION BLOCKED", msg)

    def test_illegal_skip_trained_unverified_to_production_blocked(self):
        valid, msg = validate_transition("TRAINED_UNVERIFIED", "PRODUCTION")
        self.assertFalse(valid)
        self.assertIn("ILLEGAL TRANSITION BLOCKED", msg)

    def test_illegal_skip_trained_unverified_to_shipped_blocked(self):
        valid, msg = validate_transition("TRAINED_UNVERIFIED", "SHIPPED")
        self.assertFalse(valid)
        self.assertIn("ILLEGAL TRANSITION BLOCKED", msg)

    def test_superseded_mock_cannot_promote_to_production(self):
        valid, msg = validate_transition("SUPERSEDED_MOCK", "PRODUCTION")
        self.assertFalse(valid)
        self.assertIn("ILLEGAL TRANSITION BLOCKED", msg)

    def test_transition_without_evidence_rejected_at_evaluated(self):
        """transition_adapter_lifecycle must raise ValueError if evidence is missing at EVALUATED."""
        # Test transition logic directly
        with self.assertRaises(ValueError) as ctx:
            transition_adapter_lifecycle(
                capability="general",
                version="v2.0.0",
                target_state="EVALUATED",
                evidence=None
            )
        self.assertIn("Transition rejected", str(ctx.exception))

    def test_engine_aware_invariant_verification_counts(self):
        """TRL direct run must yield 24 applicable passed and 1 N/A condition, blocking production."""
        from scripts.ai_training.verify_chatr_model import verify_production_invariants
        evidence_path = REPO_ROOT / "golden_path_evidence_chatr_general_v2.json"
        with open(evidence_path, "r", encoding="utf-8") as f:
            evidence_data = json.load(f)
        report = {"model": "chatr:general-v2", "tests": []}
        res = verify_production_invariants(report, evidence=evidence_data)
        self.assertEqual(res["total_conditions"], 25)
        self.assertEqual(res["applicable_count"], 24)
        self.assertEqual(res["passed_count"], 24)
        self.assertEqual(res["na_count"], 1)
        self.assertEqual(res["failed_count"], 0)
        self.assertFalse(res["production_ready"])
        self.assertEqual(res["production_state"], "EVALUATED (PRODUCTION_BLOCKED — PROVENANCE INCONSISTENCY)")
        self.assertEqual(res["checklist"]["16. Soup execution — TRL execution; Soup not applicable"], "NOT_APPLICABLE")

    def test_production_blocked_adapter_cannot_transition_to_shipped_or_production(self):
        """An adapter marked operational_status == PRODUCTION_BLOCKED cannot transition to SHIPPED or PRODUCTION."""
        reg = load_registry()
        entry = next((a for a in reg["adapters"] if a["capability"] == "general" and a["version"] == "v2.0.0"), None)
        self.assertIsNotNone(entry)
        self.assertEqual(entry.get("operational_status"), "PRODUCTION_BLOCKED")

        # Attempt transition to SHIPPED
        with self.assertRaises(ValueError) as ctx:
            transition_adapter_lifecycle("general", "v2.0.0", "SHIPPED")
        self.assertIn("PRODUCTION_BLOCKED", str(ctx.exception))

        # Attempt transition to PRODUCTION
        with self.assertRaises(ValueError) as ctx:
            transition_adapter_lifecycle("general", "v2.0.0", "PRODUCTION")
        self.assertIn("PRODUCTION_BLOCKED", str(ctx.exception))

    def test_update_registry_respects_audit_hold(self):
        """update_adapter_registry_from_verification must respect PRODUCTION_BLOCKED and not promote."""
        from scripts.ai_training.verify_chatr_model import update_adapter_registry_from_verification
        report = {
            "model": "chatr:general-v2",
            "production_invariants": {"production_ready": True}  # even if report falsely claims ready
        }
        update_adapter_registry_from_verification("chatr:general-v2", report)
        reg = load_registry()
        self.assertIsNone(reg["production"]["general"])
        entry = next(a for a in reg["adapters"] if a["capability"] == "general" and a["version"] == "v2.0.0")
        self.assertEqual(entry["lifecycle_state"], "EVALUATED")
        self.assertEqual(entry["operational_status"], "PRODUCTION_BLOCKED")


if __name__ == "__main__":
    unittest.main()
