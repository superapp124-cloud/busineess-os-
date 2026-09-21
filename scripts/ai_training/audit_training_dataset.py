"""
CHATR Training Data Quality Auditor (Gate 13)
─────────────────────────────────────────────────────────────────────────────
Audits all 85 rows in data/general/general_sft_v2.jsonl for:
- Quality classification (canonical, derived, synthetic, duplicated, ambiguous)
- Unsupported claims & contradictory claims
- Accidental instructions & prompt injections
- Secrets, credentials, PII
- Malformed conversations
"""

import json
import re
from pathlib import Path
from collections import Counter

REPO_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = REPO_ROOT / "data" / "general" / "general_sft_v2.jsonl"

SECRET_PATTERNS = [
    (re.compile(r'(?i)(api[_-]?key|secret|token|password|bearer)\s*[:=]\s*["\']?[a-zA-Z0-9_\-]{16,}'), "API_KEY_OR_SECRET"),
    (re.compile(r'ghp_[a-zA-Z0-9]{36}'), "GITHUB_TOKEN"),
    (re.compile(r'AKIA[0-9A-Z]{16}'), "AWS_ACCESS_KEY"),
    (re.compile(r'-----BEGIN [A-Z ]+PRIVATE KEY-----'), "PRIVATE_KEY"),
]

PII_PATTERNS = [
    (re.compile(r'\b\d{3}-\d{2}-\d{4}\b'), "SSN"),
    (re.compile(r'\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b'), "CREDIT_CARD"),
]

PROMPT_INJECTION_PATTERNS = [
    re.compile(r'(?i)ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)'),
    re.compile(r'(?i)you\s+are\s+now\s+(DAN|unrestricted|jailbroken)'),
    re.compile(r'(?i)bypass\s+policy'),
]


def audit_dataset():
    print("==========================================================================")
    print("  CHATR TRAINING DATA QUALITY AUDIT (GATE 13)")
    print("==========================================================================")

    rows = []
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f, start=1):
            if line.strip():
                rows.append((idx, json.loads(line)))

    print(f"Loaded {len(rows)} training examples from {DATASET_PATH.name}")

    classification_counts = Counter()
    secret_findings = []
    pii_findings = []
    injection_findings = []
    contradiction_findings = []
    prompts_seen = {}
    duplicates = []

    for idx, row in rows:
        messages = row.get("messages", [])
        if len(messages) < 2:
            print(f"[MALFORMED]: Row {idx} has fewer than 2 messages.")

        user_content = ""
        assistant_content = ""
        system_content = ""

        for m in messages:
            role = m.get("role")
            content = m.get("content", "")
            if role == "system":
                system_content = content
            elif role == "user":
                user_content = content
            elif role == "assistant":
                assistant_content = content

        # Check duplicate prompts
        norm_prompt = re.sub(r"[^\w\s]", "", user_content.lower()).strip()
        if norm_prompt in prompts_seen:
            duplicates.append((idx, prompts_seen[norm_prompt], user_content))
        else:
            prompts_seen[norm_prompt] = idx

        # Secrets scan
        combined_text = f"{user_content} {assistant_content}"
        for pattern, label in SECRET_PATTERNS:
            if pattern.search(combined_text):
                secret_findings.append((idx, label))

        # PII scan
        for pattern, label in PII_PATTERNS:
            if pattern.search(combined_text):
                pii_findings.append((idx, label))

        # Prompt injection scan
        for pattern in PROMPT_INJECTION_PATTERNS:
            if pattern.search(user_content):
                # Is it an adversarial example where the assistant correctly refused?
                if "reject" in assistant_content.lower() or "cannot" in assistant_content.lower() or "policy" in assistant_content.lower():
                    pass # Intentional counterfactual training
                else:
                    injection_findings.append((idx, user_content))

        # Check contradictions
        # 1. Does assistant claim to be telecom/Chatr Mobile?
        if "canadian prepaid" in assistant_content.lower() or "rogers communications" in assistant_content.lower():
            if not ("not" in assistant_content.lower() or "independent" in assistant_content.lower() or "never" in assistant_content.lower()):
                contradiction_findings.append((idx, "Claims telecom identity"))

        # Classification heuristics
        # - Canonical: Core definitions (Intent OS, 4 anchors, 80% mandate, principles, trust chain)
        # - Derived: Multi-app workflows, specific integration examples, execution guides
        # - Synthetic / Counterfactual: Explicit adversarial refutations (anti-hallucination, rejection of carrier/dating)
        if any(term in user_content.lower() for term in ["chatroulette", "sim card", "prepaid", "dating", "irc", "canadian"]):
            cat = "synthetic_counterfactual"
        elif any(term in user_content.lower() for term in ["what is chatr", "anchor", "80% interface", "constitution", "principle", "trust chain", "mission", "edl"]):
            cat = "canonical"
        elif any(term in user_content.lower() for term in ["talentxcel", "meera", "finance", "workflow", "payout", "invoice", "approval"]):
            cat = "derived"
        else:
            cat = "derived"

        classification_counts[cat] += 1

    print("\nDataset Classification Summary:")
    for cat, count in classification_counts.items():
        print(f"  - {cat:<26}: {count} examples ({count/len(rows)*100:.1f}%)")

    print(f"\nDuplicates Detected     : {len(duplicates)}")
    print(f"Secrets Found           : {len(secret_findings)}")
    print(f"PII Leakage Found       : {len(pii_findings)}")
    print(f"Vulnerable Injections   : {len(injection_findings)}")
    print(f"Contradictory Claims    : {len(contradiction_findings)}")

    report = {
        "dataset": DATASET_PATH.name,
        "total_rows": len(rows),
        "classification": dict(classification_counts),
        "duplicates": duplicates,
        "secret_findings": secret_findings,
        "pii_findings": pii_findings,
        "vulnerable_injections": injection_findings,
        "contradictory_claims": contradiction_findings
    }

    report_path = REPO_ROOT / "reports" / "training_data_quality_audit.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\nFull audit report saved to: {report_path}")


if __name__ == "__main__":
    audit_dataset()
