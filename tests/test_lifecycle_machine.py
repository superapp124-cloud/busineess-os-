"""
Test Suite: 7-State Model Lifecycle State Machine
Verifies strict sequential transitions and programmatic enforcement of illegal transition blocks.
"""

import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from scripts.ai_training.adapter_registry import (
    validate_transition,
    LIFECYCLE_STATES,
    AUXILIARY_STATES,
    LEGAL_TRANSITIONS,
    EXPLICITLY_FORBIDDEN_TRANSITIONS,
)


class TestLifecycleStateMachine(unittest.TestCase):
    def test_all_sequential_transitions_are_legal(self):
        """Verify the complete forward path from DESIGNED to PRODUCTION is legal."""
        path = [
            ("DESIGNED", "READY_FOR_REAL_TRAINING"),
            ("READY_FOR_REAL_TRAINING", "TRAINING_IN_PROGRESS"),
            ("TRAINING_IN_PROGRESS", "TRAINED_UNVERIFIED"),
            ("TRAINED_UNVERIFIED", "EVALUATED"),
            ("EVALUATED", "SHIPPED"),
            ("SHIPPED", "PRODUCTION"),
            ("PRODUCTION", "ARCHIVED"),
        ]
        for src, dst in path:
            valid, msg = validate_transition(src, dst)
            self.assertTrue(valid, f"Expected {src} -> {dst} to be valid, but got: {msg}")

    def test_explicitly_forbidden_transitions_are_blocked(self):
        """Verify all explicitly forbidden transitions return False with ILLEGAL TRANSITION BLOCKED message."""
        for src, dst, reason in EXPLICITLY_FORBIDDEN_TRANSITIONS:
            valid, msg = validate_transition(src, dst)
            self.assertFalse(valid, f"Expected forbidden transition {src} -> {dst} to fail!")
            self.assertIn("ILLEGAL TRANSITION BLOCKED", msg)

    def test_cannot_skip_from_ready_to_shipped_or_production(self):
        """READY_FOR_REAL_TRAINING cannot jump to SHIPPED or PRODUCTION."""
        valid, msg = validate_transition("READY_FOR_REAL_TRAINING", "SHIPPED")
        self.assertFalse(valid)
        valid, msg = validate_transition("READY_FOR_REAL_TRAINING", "PRODUCTION")
        self.assertFalse(valid)

    def test_cannot_skip_from_trained_unverified_to_production(self):
        """TRAINED_UNVERIFIED cannot jump to PRODUCTION without evaluation and shipping."""
        valid, msg = validate_transition("TRAINED_UNVERIFIED", "PRODUCTION")
        self.assertFalse(valid)

    def test_superseded_mock_is_permanently_locked(self):
        """SUPERSEDED_MOCK can never transition anywhere."""
        for target in LIFECYCLE_STATES + AUXILIARY_STATES:
            valid, msg = validate_transition("SUPERSEDED_MOCK", target)
            self.assertFalse(valid, f"SUPERSEDED_MOCK unexpectedly transitioned to {target}")

    def test_unknown_state_rejected(self):
        """Random string state rejected."""
        valid, msg = validate_transition("READY_FOR_REAL_TRAINING", "MAGIC_STATE")
        self.assertFalse(valid)
        self.assertIn("Unknown target state", msg)


if __name__ == "__main__":
    unittest.main()
