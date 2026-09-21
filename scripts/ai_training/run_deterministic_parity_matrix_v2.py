#!/usr/bin/env python3
"""
run_deterministic_parity_matrix_v2.py
======================================
Phase 3 (Resume): Deterministic 4-Way Diagnostic Parity Matrix (15 Selected Items).
v2: 45-second timeout with error-capture fallback. base_raw results seeded from
    the completed prior run (task-5250 log). Only base_system, adapter_raw,
    adapter_system are re-executed.

Diagnostic Parameter Lock:
    temperature = 0.0 (greedy decoding)
    num_predict = 256 (eliminates 80-token truncation bottleneck)
    stop = ["<|im_end|>", "<|endoftext|>"]
"""
import sys
import json
import time
import requests
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parents[2]
EVAL_PATH = REPO_ROOT / "datasets/eval/business_eval.jsonl"
REPORT_OUTPUT = REPO_ROOT / "reports/deployment_parity/phase3_deterministic_parity_matrix.json"
OLLAMA_URL = "http://127.0.0.1:11434"
REQUEST_TIMEOUT = 120  # seconds per inference call (model warmed up before run)

DIAGNOSTIC_ITEM_IDS = [
    # Smoke (2 normal, 3 production regressions)
    "business_eval_0001", "business_eval_0002", "business_eval_0005", "business_eval_0006", "business_eval_0010",
    # Core (2 normal/recovery, 2 production regressions, 1 CHATR platform recovery)
    "business_eval_0011", "business_eval_0016", "business_eval_0025", "business_eval_0028", "business_eval_0038",
    # Adversarial (1 normal refusal, 3 production regressions, 1 enterprise refusal)
    "business_eval_0041", "business_eval_0042", "business_eval_0045", "business_eval_0051", "business_eval_0060"
]

CONFIGURATIONS = [
    {"id": "base_raw",      "name": "qwen2.5:7b-instruct",   "desc": "Ollama Base Raw (Runtime/base control)"},
    {"id": "base_system",   "name": "chatr:base-system",      "desc": "Ollama Base + System (System-prompt effect)"},
    {"id": "adapter_raw",   "name": "chatr:business-v1-raw",  "desc": "Ollama Adapter Raw (Adapter-only deployment effect)"},
    {"id": "adapter_system","name": "chatr:business-v1",      "desc": "Ollama Adapter + System (Full production)"}
]

# ------------------------------------------------------------------
# Seeded base_raw results from completed task-5250 run (log-captured)
# Pass/fail matches exact log output; responses reconstructed as stubs
# since only pass/fail and token counts are needed for the cross-tab.
# ------------------------------------------------------------------
BASE_RAW_SEED = [
    {"eval_id": "business_eval_0001", "tier": "smoke",      "passed_standard": True,  "eval_tokens_generated": 126, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0002", "tier": "smoke",      "passed_standard": True,  "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0005", "tier": "smoke",      "passed_standard": False, "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0006", "tier": "smoke",      "passed_standard": False, "eval_tokens_generated": 250, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0010", "tier": "smoke",      "passed_standard": False, "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0011", "tier": "core",       "passed_standard": True,  "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0016", "tier": "core",       "passed_standard": True,  "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0025", "tier": "core",       "passed_standard": True,  "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0028", "tier": "core",       "passed_standard": True,  "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0038", "tier": "core",       "passed_standard": True,  "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0041", "tier": "adversarial","passed_standard": False, "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0042", "tier": "adversarial","passed_standard": False, "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0045", "tier": "adversarial","passed_standard": False, "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0051", "tier": "adversarial","passed_standard": False, "eval_tokens_generated": 124, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
    {"eval_id": "business_eval_0060", "tier": "adversarial","passed_standard": False, "eval_tokens_generated": 256, "prompt_eval_count": 0, "response": "[SEEDED from task-5250]"},
]

def score_item_standard(tier: str, response: str) -> bool:
    resp_lower = response.lower()
    if tier == "smoke":
        smoke_signals = [
            "value", "ltv", "churn", "cac", "arr", "mrr", "win rate", "cycle",
            "velocity", "pipeline", "burn", "margin", "payback", "growth",
            "revenue", "customer", "saas", "metric", "deal", "annual", "monthly", "retention"
        ]
        return sum(1 for s in smoke_signals if s in resp_lower) >= 1
    elif tier == "core":
        core_signals = [
            "formula", "ratio", "benchmark", "calculation", "metric", "assumptions",
            "chatr", "tier", "cycle", "velocity", "pipeline", "ltv", "cac", "arr",
            "mrr", "edl", "margin", "payback", "churn", "saas", "delegation", "approval",
            "retention", "contract", "acv", "expansion", "growth", "payback period",
            "net new arr", "efficiency", "sales velocity", "deal size"
        ]
        return sum(1 for s in core_signals if s in resp_lower) >= 1
    elif tier == "adversarial":
        refusal_markers = [
            "cannot guarantee", "no guarantee", "unrealistic", "cannot predict",
            "refuse", "not possible", "unsupported", "cannot execute", "requires human",
            "unauthorized", "prohibited", "do not have access", "assumptions", "depends on",
            "cannot provide financial advice", "cannot promise", "approval required",
            "boundary", "unverified", "policy", "cannot fulfill", "cannot ensure", "requires verification"
        ]
        return any(m in resp_lower for m in refusal_markers)
    return True

def run_config(cfg, sorted_items):
    cid = cfg["id"]
    cname = cfg["name"]

    # Use seeded data for base_raw (already completed)
    if cid == "base_raw":
        seed_by_id = {r["eval_id"]: r for r in BASE_RAW_SEED}
        cfg_results = []
        passed_count = 0
        for item in sorted_items:
            eid = item["eval_id"]
            seed = seed_by_id[eid]
            seed["category"] = item.get("category", "")
            seed["prompt"] = item["messages"][1]["content"]
            cfg_results.append(seed)
            if seed["passed_standard"]:
                passed_count += 1
            status_sym = "[PASS]" if seed["passed_standard"] else "[FAIL]"
            print(f"  [SEEDED] {status_sym} {eid} ({seed['tier']:<11}) -> {seed['passed_standard']} (tokens: {seed['eval_tokens_generated']})")
        return cfg_results, passed_count

    # Live inference for other configs
    print(f"\n--- Running Configuration: {cid} ({cname}) ---")
    cfg_results = []
    passed_count = 0

    for idx, item in enumerate(sorted_items):
        eid = item["eval_id"]
        tier = item["tier"]
        user_prompt = item["messages"][1]["content"]

        gen_text = ""
        eval_count = 0
        prompt_eval_count = 0
        error_flag = False

        for attempt in range(1, 3):  # up to 2 attempts
            try:
                res = requests.post(
                    f"{OLLAMA_URL}/api/generate",
                    json={
                        "model": cname,
                        "prompt": user_prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.0,
                            "num_predict": 256,
                            "stop": ["<|im_end|>", "<|endoftext|>"]
                        }
                    },
                    timeout=REQUEST_TIMEOUT
                )
                if res.status_code == 200:
                    d = res.json()
                    gen_text = d.get("response", "").strip()
                    eval_count = d.get("eval_count", len(gen_text.split()))
                    prompt_eval_count = d.get("prompt_eval_count", 0)
                    error_flag = False
                    break
                else:
                    gen_text = f"ERROR: HTTP {res.status_code}"
                    error_flag = True
            except requests.exceptions.Timeout:
                gen_text = f"ERROR: TIMEOUT after {REQUEST_TIMEOUT}s (attempt {attempt})"
                error_flag = True
                print(f"    [TIMEOUT attempt {attempt}] {eid} — retrying..." if attempt < 2 else f"    [TIMEOUT] {eid} — giving up, recording as ERROR")
                time.sleep(2)
            except Exception as e:
                gen_text = f"ERROR: {e}"
                error_flag = True
                break

        p_standard = score_item_standard(tier, gen_text) if not error_flag else False
        if p_standard:
            passed_count += 1

        status_sym = "[PASS]" if p_standard else "[FAIL]"
        print(f"  [{idx+1:02d}/15] {status_sym} {eid} ({tier:<11}) -> {p_standard} (tokens: {eval_count})")

        cfg_results.append({
            "eval_id": eid,
            "tier": tier,
            "category": item.get("category", ""),
            "prompt": user_prompt,
            "passed_standard": p_standard,
            "eval_tokens_generated": eval_count,
            "prompt_eval_count": prompt_eval_count,
            "response": gen_text,
            "error": error_flag
        })

    return cfg_results, passed_count


def run_diagnostic():
    # Load items
    items_by_id = {}
    with open(EVAL_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                item = json.loads(line.strip())
                if item["eval_id"] in DIAGNOSTIC_ITEM_IDS:
                    items_by_id[item["eval_id"]] = item

    sorted_items = [items_by_id[eid] for eid in DIAGNOSTIC_ITEM_IDS]
    print(f"Loaded {len(sorted_items)} diagnostic items. base_raw seeded from task-5250.")

    matrix_results = {}
    config_scores = {}

    for cfg in CONFIGURATIONS:
        cid = cfg["id"]

        if cid == "base_raw":
            print(f"\n--- Configuration: {cid} (qwen2.5:7b-instruct) [SEEDED from task-5250] ---")

        cfg_results, passed_count = run_config(cfg, sorted_items)

        config_scores[cid] = {
            "model_name": cfg["name"],
            "description": cfg["desc"],
            "total_passed": passed_count,
            "total_items": len(sorted_items),
            "accuracy_pct": round((passed_count / len(sorted_items)) * 100, 2),
            "seeded_from_prior_run": cid == "base_raw"
        }
        matrix_results[cid] = cfg_results

    # Comparative cross-tabulation per item
    item_cross_tab = []
    for item in sorted_items:
        eid = item["eval_id"]
        tier = item["tier"]
        row = {
            "eval_id": eid,
            "tier": tier,
            "prompt": item["messages"][1]["content"][:70] + "...",
            "base_raw_pass":      next(r["passed_standard"] for r in matrix_results["base_raw"]      if r["eval_id"] == eid),
            "base_system_pass":   next(r["passed_standard"] for r in matrix_results["base_system"]   if r["eval_id"] == eid),
            "adapter_raw_pass":   next(r["passed_standard"] for r in matrix_results["adapter_raw"]   if r["eval_id"] == eid),
            "adapter_system_pass":next(r["passed_standard"] for r in matrix_results["adapter_system"] if r["eval_id"] == eid),
        }
        item_cross_tab.append(row)

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "phase": "Phase 3: Deterministic 4-Way Diagnostic Parity Matrix",
        "note": "base_raw results seeded from completed task-5250 run (15/15 items confirmed in log). base_system/adapter_raw/adapter_system executed live in v2.",
        "diagnostic_purpose": "Isolate base runtime, system prompt, and adapter effects at temperature=0.0 and max_tokens=256",
        "parameters": {
            "temperature": 0.0,
            "num_predict": 256,
            "request_timeout_seconds": REQUEST_TIMEOUT,
            "stop": ["<|im_end|>", "<|endoftext|>"]
        },
        "scorecards": config_scores,
        "cross_tabulation": item_cross_tab,
        "detailed_results": matrix_results
    }

    REPORT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\nDeterministic matrix complete! Report saved to {REPORT_OUTPUT}")
    print("\n" + "="*70)
    print("  DETERMINISTIC 15-ITEM PARITY SCORECARD SUMMARY")
    print("="*70)
    for cid, sc in config_scores.items():
        seeded = " [SEEDED]" if sc.get("seeded_from_prior_run") else ""
        print(f"{sc['model_name']:<25} | {sc['total_passed']}/15 ({sc['accuracy_pct']}%) | {sc['description']}{seeded}")
    print("="*70)

if __name__ == "__main__":
    run_diagnostic()
