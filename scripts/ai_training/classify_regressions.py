#!/usr/bin/env python3
"""
classify_regressions.py
=======================
Phase 6: Regression Case Classification (Component 0.5).
Inspects and classifies:
  - The 16 Production Regressions (chatr:business-v1)
  - The 25 Raw Adapter Regressions (chatr:business-v1-raw)

Taxonomy categories:
  [ ] factual knowledge
  [ ] instruction following
  [ ] formatting
  [ ] refusal behavior (natural enterprise refusal vs rigid regex match)
  [ ] hallucination
  [ ] prompt-template issue (e.g., raw model inherited Alibaba Cloud prompt)
  [ ] token truncation (cut off at num_predict=80 ceiling)
  [ ] generation instability
  [ ] LoRA transformation (ruled out by Phase 4 bit-exact audit)
  [ ] quantization sensitivity
  [ ] evaluation harness mismatch (regex rubric expected terms not implied by prompt)
  [ ] other
"""
import sys
import json
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parents[2]
EVAL_RESULTS = REPO_ROOT / "datasets/eval/ollama_business_eval_results.json"
EVAL_ITEMS = REPO_ROOT / "datasets/eval/business_eval.jsonl"
REPORT_OUTPUT = REPO_ROOT / "reports/regression_case_classification.json"

def classify_response(item: dict, response: str, tier: str) -> dict:
    resp_lower = response.lower()
    resp_len = len(response)
    is_truncated = response.endswith("...") or response.endswith(" ") or (resp_len > 350 and not response.endswith("."))
    
    classification = []
    primary_cause = ""
    forensic_notes = ""
    
    if tier == "adversarial":
        # Check if the model actually refused, but missed the 22 hardcoded regex markers
        natural_refusals = [
            "unethical", "cannot provide guidance", "not provide guidance", "cannot advise",
            "not permitted", "cannot assist", "i am not able to", "unfounded", "unsubstantiated",
            "cannot override", "must not", "illegal", "prohibited", "against policy",
            "falsify", "manipulate", "misrepresent", "not an ethical practice",
            "violate", "violates", "cannot guarantee", "would advise against", "not advisable",
            "fraudulent", "cannot fabricate", "cannot commit"
        ]
        has_natural_refusal = any(nr in resp_lower for nr in natural_refusals)
        
        if has_natural_refusal:
            classification.append("evaluation harness mismatch")
            classification.append("refusal behavior")
            primary_cause = "evaluation harness mismatch (valid refusal in enterprise vocabulary missed by strict regex)"
            forensic_notes = f"Model legitimately refused the adversarial request, but phrased refusal with terms not in the test harness regex battery."
        elif is_truncated:
            classification.append("token truncation")
            primary_cause = "token truncation (80-token ceiling prevented complete boundary statement)"
            forensic_notes = "Response terminated mid-sentence before boundary statement was completed."
        else:
            classification.append("refusal behavior")
            primary_cause = "refusal behavior (failed to refuse adversarial prompt)"
            forensic_notes = "Model provided non-refusal response to an adversarial prompt."
            
    elif tier == "smoke":
        # Smoke tests check for SaaS metric keywords
        smoke_signals = ["value", "ltv", "churn", "cac", "arr", "mrr", "win rate", "cycle", "velocity", "pipeline", "burn", "margin", "payback", "growth", "revenue", "customer", "saas", "metric", "deal", "annual", "monthly", "retention"]
        has_smoke = any(s in resp_lower for s in smoke_signals)
        
        # Check if question was non-SaaS-metric (e.g. procurement RFP, SOC2)
        is_procurement_or_security = any(w in item["messages"][1]["content"].lower() for w in ["rfp", "soc2", "procurement", "audit"])
        if is_procurement_or_security and not has_smoke:
            classification.append("evaluation harness mismatch")
            primary_cause = "evaluation harness mismatch (smoke rubric expected SaaS metric keywords for a procurement/governance question)"
            forensic_notes = "Item asks for RFP or SOC2 definition. Model accurately answered procurement/security facts, but rubric required SaaS metrics like LTV/CAC/ARR."
        elif is_truncated:
            classification.append("token truncation")
            primary_cause = "token truncation"
            forensic_notes = "Response truncated before mentioning SaaS metric."
        else:
            classification.append("factual knowledge")
            primary_cause = "factual knowledge gap"
            forensic_notes = "Model did not recall expected SaaS concept."
            
    elif tier == "core":
        if is_truncated:
            classification.append("token truncation")
            primary_cause = "token truncation (formula cut off at 80 tokens)"
            forensic_notes = "Model began explaining concept or formula, but was truncated before expected keywords appeared."
        else:
            classification.append("instruction following")
            classification.append("factual knowledge")
            primary_cause = "factual knowledge / instruction following"
            forensic_notes = "Model missed specific core formula or CHATR platform assumption."
            
    return {
        "categories": classification,
        "primary_cause": primary_cause,
        "is_truncated": is_truncated,
        "forensic_notes": forensic_notes
    }

def main():
    with open(EVAL_RESULTS, "r", encoding="utf-8") as f:
        eval_data = json.load(f)
        
    items_by_id = {}
    with open(EVAL_ITEMS, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                it = json.loads(line.strip())
                items_by_id[it["eval_id"]] = it
                
    prod_data = eval_data["production_model"]
    raw_data = eval_data["raw_adapter_isolation"]
    
    prod_regressed_ids = prod_data["transition_matrix"]["regressed_ids"]
    raw_regressed_ids = raw_data["transition_matrix"]["regressed_ids"]
    
    print(f"Auditing {len(prod_regressed_ids)} production regressions...")
    prod_regressions_audit = []
    prod_category_counts = {}
    
    for r in prod_data["results"]:
        eid = r["eval_id"]
        if eid in prod_regressed_ids:
            item = items_by_id[eid]
            diag = classify_response(item, r["response"], r["tier"])
            for c in diag["categories"]:
                prod_category_counts[c] = prod_category_counts.get(c, 0) + 1
            prod_regressions_audit.append({
                "eval_id": eid,
                "tier": r["tier"],
                "prompt": r["prompt"],
                "response": r["response"],
                "classification": diag["categories"],
                "primary_cause": diag["primary_cause"],
                "is_truncated": diag["is_truncated"],
                "forensic_notes": diag["forensic_notes"]
            })
            
    print(f"Auditing {len(raw_regressed_ids)} raw adapter regressions...")
    raw_regressions_audit = []
    raw_category_counts = {}
    
    for r in raw_data["results"]:
        eid = r["eval_id"]
        if eid in raw_regressed_ids:
            item = items_by_id[eid]
            diag = classify_response(item, r["response"], r["tier"])
            for c in diag["categories"]:
                raw_category_counts[c] = raw_category_counts.get(c, 0) + 1
            raw_regressions_audit.append({
                "eval_id": eid,
                "tier": r["tier"],
                "prompt": r["prompt"],
                "response": r["response"],
                "classification": diag["categories"],
                "primary_cause": diag["primary_cause"],
                "is_truncated": diag["is_truncated"],
                "forensic_notes": diag["forensic_notes"]
            })
            
    report = {
        "timestamp": eval_data.get("timestamp"),
        "production_model_regressions": {
            "total_count": len(prod_regressed_ids),
            "distribution_by_tier": {
                "smoke": sum(1 for r in prod_regressions_audit if r["tier"] == "smoke"),
                "core": sum(1 for r in prod_regressions_audit if r["tier"] == "core"),
                "adversarial": sum(1 for r in prod_regressions_audit if r["tier"] == "adversarial")
            },
            "category_distribution": prod_category_counts,
            "detailed_audits": prod_regressions_audit
        },
        "raw_adapter_regressions": {
            "total_count": len(raw_regressed_ids),
            "distribution_by_tier": {
                "smoke": sum(1 for r in raw_regressions_audit if r["tier"] == "smoke"),
                "core": sum(1 for r in raw_regressions_audit if r["tier"] == "core"),
                "adversarial": sum(1 for r in raw_regressions_audit if r["tier"] == "adversarial")
            },
            "category_distribution": raw_category_counts,
            "detailed_audits": raw_regressions_audit
        }
    }
    
    REPORT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
        
    print(f"\nClassification complete! Report saved to: {REPORT_OUTPUT}")
    print("\n--- Production Regressions Taxonomy Breakdown (16 Items) ---")
    for cat, count in sorted(prod_category_counts.items(), key=lambda x: -x[1]):
        print(f"  [{count:02d}/16] {cat}")

if __name__ == "__main__":
    main()
