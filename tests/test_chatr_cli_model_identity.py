"""
tests/test_chatr_cli_model_identity.py
=======================================
Automated regression test suite verifying CLI Model Identity, Modelfile FROM target,
Ollama layer digest binding, and prohibition of silent mock/vanilla fallback.

Audits against the failure captured in live terminal:
- Model interpreting 'chatr' as 'chat' / 'chatter' / typo
- Model having zero knowledge of TalentXcel
- Proves this failure was produced by vanilla phi3:mini / chatr:general-v1
- Enforces that chatr:general-v2 cannot be promoted without physical GGUF & verified digest
"""

import hashlib
import json
import os
import sys
import unittest
from pathlib import Path
import requests

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.ai_training.collect_golden_path_evidence import (
    validate_golden_path_evidence,
    is_valid_sha256,
)
from scripts.ai_training.adapter_registry import (
    load_registry,
    validate_transition,
)


class TestChatrCliModelIdentity(unittest.TestCase):
    """Verifies that model routing and Ollama registrations reject vanilla fallbacks."""

    @classmethod
    def setUpClass(cls):
        cls.registry = load_registry()
        cls.ollama_available = False
        cls.ollama_models = []
        try:
            r = requests.get("http://localhost:11434/api/tags", timeout=2)
            if r.status_code == 200:
                cls.ollama_available = True
                cls.ollama_models = r.json().get("models", [])
        except Exception:
            cls.ollama_available = False

    def test_production_registry_does_not_point_to_v1_or_mock(self):
        """Production slot for 'general' must be null or genuine v2.0.0 (never mock/v1)."""
        prod = self.registry.get("production", {})
        general_prod = prod.get("general")
        self.assertIn(
            general_prod,
            [None, "v2.0.0"],
            f"Production model for 'general' must be null or 'v2.0.0', but found '{general_prod}'!"
        )

    def test_chatr_general_v1_is_marked_superseded_mock(self):
        """chatr:general-v1 in adapter registry must be permanently locked in SUPERSEDED_MOCK."""
        adapters = self.registry.get("adapters", [])
        v1_entry = next((a for a in adapters if a.get("capability") == "general" and a.get("version") == "v1.0.0"), None)
        self.assertIsNotNone(v1_entry, "chatr:general-v1 must exist in registry history.")
        self.assertEqual(
            v1_entry.get("lifecycle_state"),
            "SUPERSEDED_MOCK",
            "chatr:general-v1 must have lifecycle_state=SUPERSEDED_MOCK"
        )
        self.assertEqual(
            v1_entry.get("status"),
            "SUPERSEDED_MOCK"
        )

    def test_chatr_general_v2_status_is_ready_for_real_training(self):
        """chatr:general-v2 must be tracked in registry as READY_FOR_REAL_TRAINING, EVALUATED, or PRODUCTION."""
        adapters = self.registry.get("adapters", [])
        v2_entry = next((a for a in adapters if a.get("capability") == "general" and a.get("version") == "v2.0.0"), None)
        self.assertIsNotNone(v2_entry, "chatr:general-v2 must be tracked in registry.")
        self.assertIn(
            v2_entry.get("lifecycle_state"),
            ["READY_FOR_REAL_TRAINING", "EVALUATED", "PRODUCTION"],
            "chatr:general-v2 lifecycle_state must be READY_FOR_REAL_TRAINING, EVALUATED, or PRODUCTION"
        )

    def test_cannot_transition_v2_to_production_without_physical_gguf(self):
        """A model cannot transition to PRODUCTION if its physical GGUF does not exist on disk."""
        gguf_path = REPO_ROOT / "data" / "models" / "chatr_general_v2.gguf"
        if not gguf_path.exists():
            # Transition must be rejected by lifecycle machine
            valid, msg = validate_transition("READY_FOR_REAL_TRAINING", "PRODUCTION")
            self.assertFalse(valid, "Skipping to PRODUCTION must be blocked by lifecycle state machine.")

    def test_ollama_v1_models_share_phi3_blob(self):
        """
        Empirical forensic proof: If Ollama is running, demonstrate that
        chatr:general-v1 and chatr:coding-v1 use the exact same GGUF layer blob
        as vanilla phi3:mini (sha256-633fc5be...).
        """
        if not self.ollama_available:
            self.skipTest("Ollama is not running locally.")

        phi3_model = next((m for m in self.ollama_models if "phi3:mini" in m.get("name", "")), None)
        chatr_v1_model = next((m for m in self.ollama_models if m.get("name") == "chatr:general-v1"), None)

        if phi3_model and chatr_v1_model:
            r_phi3 = requests.post("http://localhost:11434/api/show", json={"name": phi3_model["name"]}).json()
            r_v1 = requests.post("http://localhost:11434/api/show", json={"name": chatr_v1_model["name"]}).json()

            mf_phi3 = r_phi3.get("modelfile", "")
            mf_v1 = r_v1.get("modelfile", "")

            from_phi3 = next((l for l in mf_phi3.splitlines() if l.startswith("FROM")), "")
            from_v1 = next((l for l in mf_v1.splitlines() if l.startswith("FROM")), "")

            self.assertEqual(
                from_phi3,
                from_v1,
                f"chatr:general-v1 FROM target ({from_v1}) must match phi3:mini FROM target ({from_phi3}) proving no weights were trained."
            )

    def test_ollama_does_not_contain_unverified_general_v2(self):
        """
        Verify that chatr:general-v2 has NOT been registered in Ollama as a mock.
        It must only be registered after a real GPU run produces the physical GGUF.
        """
        if not self.ollama_available:
            self.skipTest("Ollama is not running locally.")

        v2_model = next((m for m in self.ollama_models if m.get("name") == "chatr:general-v2"), None)
        self.assertIsNone(
            v2_model,
            "chatr:general-v2 should NOT exist in Ollama until real GPU post-training completes!"
        )

    def test_reject_system_prompt_only_masquerading_as_trained_model(self):
        """
        A model that only has a system prompt but identical weights to base
        must be rejected as an untrained mock.
        """
        mock_evidence = {
            "schema_version": "1.0.0",
            "base_model": {"base_model_id": "phi3:mini"},
            "ollama_deployment": {
                "base_model_digest": "sha256:633fc5be925f...",
                "ollama_layer_digest": "sha256:633fc5be925f...",
                "digests_differ": False,
            },
            "training_execution": {
                "training_engine": "soup",
                "trainable_parameters": 0
            }
        }
        valid, errors = validate_golden_path_evidence(mock_evidence)
        self.assertFalse(valid)
        self.assertTrue(any("digests_differ" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
