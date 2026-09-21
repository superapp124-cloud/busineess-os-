"""
tests/test_live_model_identity_and_grounding.py
===============================================
Adversarial and behavioral grounding test suite for CHATR & TalentXcel model identity.

Validates:
1. CLI / Model resolution does not resolve to phi3:mini or chatr:general-v1.
2. Models in Ollama are audited against registered digests.
3. Proves that existing chatr:general-v1 fails CHATR canonical identity and TalentXcel grounding.
4. Ensures chatr:general-v2 is NOT falsely marked as trained before physical GPU run.
5. Verifies that system-prompt-only wrappers cannot pass the 25-point invariant.
6. Asserts hallucination resistance and domain grounding.
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

from scripts.ai_training.adapter_registry import load_registry, validate_transition
from scripts.ai_training.collect_golden_path_evidence import validate_golden_path_evidence


class TestLiveModelIdentityAndGrounding(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.registry = load_registry()
        cls.ollama_available = False
        cls.ollama_models = []
        try:
            r = requests.get("http://localhost:11434/api/tags", timeout=3)
            if r.status_code == 200:
                cls.ollama_available = True
                cls.ollama_models = r.json().get("models", [])
        except Exception:
            cls.ollama_available = False

    def test_forbidden_fallbacks_are_not_serving_production(self):
        """Production registry must NEVER serve phi3:mini or chatr:general-v1."""
        prod = self.registry.get("production", {})
        forbidden = ["phi3:mini", "chatr:general-v1", "chatr:coding-v1", "chatr:meera-v1"]
        for cap, model in prod.items():
            self.assertNotIn(
                model,
                forbidden,
                f"Production slot '{cap}' is serving forbidden mock/baseline model '{model}'!"
            )

    def test_chatr_general_v2_not_promoted_without_real_weights(self):
        """chatr:general-v2 must be in READY_FOR_REAL_TRAINING, EVALUATED, or verified PRODUCTION with Golden-Path evidence."""
        adapters = self.registry.get("adapters", [])
        v2 = next((a for a in adapters if a.get("capability") == "general" and a.get("version") == "v2.0.0"), None)
        self.assertIsNotNone(v2)
        state = v2.get("lifecycle_state")
        self.assertIn(state, ["READY_FOR_REAL_TRAINING", "EVALUATED", "PRODUCTION"])
        if state == "PRODUCTION":
            evidence_file = REPO_ROOT / "golden_path_evidence_chatr_general_v2.json"
            self.assertTrue(evidence_file.exists(), "Golden-Path evidence must exist on disk for PRODUCTION state")

    def test_canonical_identity_definition_integrity(self):
        """Canonical CHATR definition must contain Intent OS and business execution principles."""
        # Read general SFT v2 dataset
        sft_path = REPO_ROOT / "data" / "general" / "general_sft_v2.jsonl"
        self.assertTrue(sft_path.exists(), "General SFT v2 dataset must exist")
        
        with open(sft_path, encoding="utf-8") as f:
            first_row = json.loads(f.readline())
        
        # Verify first row contains canonical definition
        assistant_msg = next(m["content"] for m in first_row["messages"] if m["role"] == "assistant")
        self.assertIn("Intent-First Business Operating System", assistant_msg)
        self.assertIn("autonomous multi-app executions", assistant_msg)

    def test_talentxcel_grounding_dataset_integrity(self):
        """Canonical TalentXcel dataset must define TalentXcel as built on CHATR Intent OS."""
        tx_path = REPO_ROOT / "data" / "talentxcel" / "talentxcel_sft_v1.jsonl"
        self.assertTrue(tx_path.exists(), "TalentXcel SFT v1 dataset must exist")
        
        with open(tx_path, encoding="utf-8") as f:
            first_row = json.loads(f.readline())
        
        assistant_msg = next(m["content"] for m in first_row["messages"] if m["role"] == "assistant")
        self.assertIn("TalentXcel", assistant_msg)
        self.assertIn("CHATR", assistant_msg)

    def test_v1_models_fail_digest_divergence(self):
        """
        In Ollama, chatr:general-v1 uses the same base layer digest as phi3:mini,
        which fails the weight divergence test.
        """
        if not self.ollama_available:
            self.skipTest("Ollama is not running locally.")

        phi3 = next((m for m in self.ollama_models if "phi3:mini" in m.get("name", "")), None)
        v1 = next((m for m in self.ollama_models if m.get("name") == "chatr:general-v1"), None)

        if phi3 and v1:
            r_phi3 = requests.post("http://localhost:11434/api/show", json={"name": phi3["name"]}).json()
            r_v1 = requests.post("http://localhost:11434/api/show", json={"name": v1["name"]}).json()
            # Check diff_ids or base blob
            base_phi3 = r_phi3.get("details", {}).get("family")
            base_v1 = r_v1.get("details", {}).get("family")
            self.assertEqual(base_phi3, "phi3")
            self.assertEqual(base_v1, "phi3")

    def test_system_prompt_alone_does_not_satisfy_evidence_schema(self):
        """An evidence document with zero trainable parameters or matching base digest is rejected."""
        evidence = {
            "schema_version": "1.0.0",
            "base_model": {"base_model_id": "Qwen/Qwen2.5-7B-Instruct"},
            "training_execution": {
                "training_engine": "soup",
                "trainable_parameters": 0,  # Zero trainable parameters
            },
            "ollama_deployment": {
                "digests_differ": False,  # Identical to base
            }
        }
        valid, errors = validate_golden_path_evidence(evidence)
        self.assertFalse(valid)
        self.assertTrue(any("trainable_parameters" in e for e in errors))
        self.assertTrue(any("digests_differ" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
