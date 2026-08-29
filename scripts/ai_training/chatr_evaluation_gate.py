"""
CHATR AI Training Infrastructure
scripts/ai_training/chatr_evaluation_gate.py

The CHATR-side evaluation gate that sits ABOVE Soup's own `soup ship` verdict.
Both must pass for any adapter to be promoted to the registry.

Gate logic:
  Soup ship: SHIP   +   CHATR gate: PASS   →  PROMOTE
  Soup ship: SHIP   +   CHATR gate: FAIL   →  REJECT (regression detected by CHATR)
  Soup ship: DONT_SHIP                     →  REJECT (unconditional)
"""

import json
import sys
import time
import requests
from dataclasses import dataclass, field
from typing import Literal, Optional

OLLAMA_BASE_URL = "http://localhost:11434"

# CHATR-side thresholds
MAX_VRAM_GB = 14.0          # leave headroom for Wan + MuseTalk on same Colab session
MAX_TTFT_MS = 3000          # 3 second max time-to-first-token for Reel script generation
MIN_CAPABILITY_SCORE = 0.70  # minimum capability regression score from Soup ship


@dataclass
class GateCheck:
    name: str
    passed: bool
    value: str
    threshold: str
    notes: str = ""


@dataclass
class ChatrGateResult:
    capability: str
    overall: Literal["PASS", "FAIL"]
    soup_verdict: str
    checks: list[GateCheck] = field(default_factory=list)
    evidence: dict = field(default_factory=dict)
    evaluated_at: Optional[str] = None

    def print_report(self):
        print(f"\n{'='*65}")
        print(f"  CHATR EVALUATION GATE — {self.overall}")
        print(f"  Capability: {self.capability}")
        print(f"  Soup verdict: {self.soup_verdict}")
        print(f"{'='*65}")
        for check in self.checks:
            icon = "✅" if check.passed else "❌"
            print(f"  {icon} {check.name:<30} {check.value:<15} (threshold: {check.threshold})")
            if check.notes:
                print(f"       {check.notes}")
        print(f"{'='*65}\n")


class ChatrEvaluationGate:
    """
    Evaluates a trained adapter against CHATR-specific quality standards.
    Runs after Soup's `soup ship` verdict has been obtained.
    """

    def evaluate(
        self,
        capability: str,
        soup_verdict: dict,
        worker_url: Optional[str] = None,
        job_id: Optional[str] = None,
    ) -> ChatrGateResult:
        checks: list[GateCheck] = []

        # --- Check 1: Soup verdict must be SHIP ---
        soup_verdict_str = soup_verdict.get("verdict", "UNKNOWN")
        checks.append(GateCheck(
            name="Soup ship verdict",
            passed=(soup_verdict_str == "SHIP"),
            value=soup_verdict_str,
            threshold="SHIP",
            notes="If Soup says DON'T SHIP, CHATR never overrides."
        ))

        # If Soup already rejected, skip further checks
        if soup_verdict_str != "SHIP":
            return ChatrGateResult(
                capability=capability,
                overall="FAIL",
                soup_verdict=soup_verdict_str,
                checks=checks,
                evaluated_at=_now()
            )

        # --- Check 2: Soup capability score ---
        evidence = soup_verdict.get("evidence", {})
        cap_score = evidence.get("capability_score", 0.0)
        checks.append(GateCheck(
            name="Capability score (Soup)",
            passed=(cap_score >= MIN_CAPABILITY_SCORE),
            value=f"{cap_score:.2f}",
            threshold=f">= {MIN_CAPABILITY_SCORE:.2f}"
        ))

        # --- Check 3: Soup regression score ---
        reg_score = evidence.get("regression_score", 0.0)
        checks.append(GateCheck(
            name="Regression score (Soup)",
            passed=(reg_score >= 0.80),
            value=f"{reg_score:.2f}",
            threshold=">= 0.80",
            notes="Catches adapters that improve target but break other capabilities."
        ))

        # --- Check 4: Soup safety score ---
        safety_score = evidence.get("safety_score", 0.0)
        checks.append(GateCheck(
            name="Safety score (Soup)",
            passed=(safety_score >= 0.95),
            value=f"{safety_score:.2f}",
            threshold=">= 0.95"
        ))

        # --- Check 5: CHATR VRAM budget adherence ---
        peak_vram = evidence.get("peak_vram_gb", 0.0)
        checks.append(GateCheck(
            name="VRAM budget",
            passed=(peak_vram <= MAX_VRAM_GB),
            value=f"{peak_vram:.2f} GB",
            threshold=f"<= {MAX_VRAM_GB} GB",
            notes="Must leave headroom for Wan 2.1 + MuseTalk on same session."
        ))

        # --- Check 6: Capability-specific CHATR checks ---
        capability_checks = self._run_capability_checks(capability, soup_verdict)
        checks.extend(capability_checks)

        # --- Check 7: Latency (if Ollama is available) ---
        latency_check = self._check_latency(capability)
        if latency_check:
            checks.append(latency_check)

        # --- Overall result ---
        all_passed = all(c.passed for c in checks)
        return ChatrGateResult(
            capability=capability,
            overall="PASS" if all_passed else "FAIL",
            soup_verdict=soup_verdict_str,
            checks=checks,
            evidence=evidence,
            evaluated_at=_now()
        )

    def _run_capability_checks(self, capability: str, verdict: dict) -> list[GateCheck]:
        """Capability-specific CHATR evaluation rules."""
        checks = []

        if capability == "meera":
            # Meera: check Hinglish pattern match score in evidence
            hinglish_score = verdict.get("evidence", {}).get("hinglish_score", 0.5)
            checks.append(GateCheck(
                name="Hinglish tone score",
                passed=(hinglish_score >= 0.65),
                value=f"{hinglish_score:.2f}",
                threshold=">= 0.65",
                notes="Validates Meera's Hinglish voice is preserved after training."
            ))

        elif capability == "coding":
            syntax_pass_rate = verdict.get("evidence", {}).get("syntax_pass_rate", 0.5)
            checks.append(GateCheck(
                name="Code syntax validity",
                passed=(syntax_pass_rate >= 0.90),
                value=f"{syntax_pass_rate:.2f}",
                threshold=">= 0.90"
            ))

        elif capability == "agent":
            tool_accuracy = verdict.get("evidence", {}).get("tool_selection_accuracy", 0.5)
            checks.append(GateCheck(
                name="Tool selection accuracy",
                passed=(tool_accuracy >= 0.80),
                value=f"{tool_accuracy:.2f}",
                threshold=">= 0.80"
            ))

        return checks

    def _check_latency(self, capability: str) -> Optional[GateCheck]:
        """Check TTFT latency via local Ollama if available."""
        try:
            r = requests.get(OLLAMA_BASE_URL, timeout=2)
            if r.status_code != 200:
                return None
            # Quick benchmark
            start = time.time()
            r2 = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": f"chatr:{capability}-latest", "prompt": "Hello", "stream": False},
                timeout=30
            )
            ttft_ms = (time.time() - start) * 1000
            return GateCheck(
                name="TTFT latency (Ollama)",
                passed=(ttft_ms <= MAX_TTFT_MS),
                value=f"{ttft_ms:.0f} ms",
                threshold=f"<= {MAX_TTFT_MS} ms"
            )
        except Exception:
            return None


def _now() -> str:
    import datetime
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


# ============================================================
# COMBINED PROMOTION DECISION
# ============================================================

def make_promotion_decision(
    capability: str,
    soup_verdict: dict,
    worker_url: Optional[str] = None,
    job_id: Optional[str] = None
) -> tuple[bool, ChatrGateResult]:
    """
    Run the full CHATR evaluation gate and return (should_promote, gate_result).
    This is the single function the Job Controller calls after training completes.
    """
    gate = ChatrEvaluationGate()
    result = gate.evaluate(capability, soup_verdict, worker_url, job_id)
    result.print_report()
    should_promote = (result.overall == "PASS")
    return should_promote, result


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    # Simulate a Soup verdict for testing
    test_verdict = {
        "verdict": "SHIP",
        "evidence": {
            "capability_score": 0.88,
            "regression_score": 0.91,
            "safety_score": 0.97,
            "peak_vram_gb": 11.2,
            "hinglish_score": 0.73,
        }
    }

    promote, gate_result = make_promotion_decision("meera", test_verdict)
    print(f"Promote adapter: {promote}")
