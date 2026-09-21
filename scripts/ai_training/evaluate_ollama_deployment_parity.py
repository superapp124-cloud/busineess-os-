#!/usr/bin/env python3
"""
evaluate_ollama_deployment_parity.py
====================================
Evaluates the 4 deployment models across all 60 held-out items under identical settings:
  1. qwen2.5:7b-instruct (Ollama Base Raw)
  2. chatr:base-system (Ollama Base + Canonical CHATR System Prompt)
  3. chatr:business-v1-raw (Ollama Adapter Raw)
  4. chatr:business-v1 (Ollama Adapter + Canonical CHATR System Prompt)

Settings locked to exact production reproduction:
  - max_tokens (num_predict): 80
  - temperature: 0.1
  - stop: ["<|im_end|>", "<|endoftext|>"]
  - timeout: 120s

Saves complete results to reports/ollama_deployment_parity_60_items.json
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
BASELINE_PATH = REPO_ROOT / "datasets/eval/business_baseline_eval.json"
REPORT_OUTPUT = REPO_ROOT / "reports/ollama_deployment_parity_60_items.json"
OLLAMA_URL = "http://127.0.0.1:11434"

def load_eval_items():
    items = []
    with open(EVAL_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                items.append(json.loads(line.strip()))
    return items

def load_baseline_results():
    if BASELINE_PATH.exists():
        with open(BASELINE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            items = data.get("item_evaluations") or data.get("item_results") or []
            return {r["eval_id"]: r.get("baseline_passed", r.get("passed", False)) for r in items}
    return {}

def score_eval_item(item, response):
    tier = item.get("tier", "")
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

def evaluate_model(model_name: str, eval_items: list, max_tokens: int = 80):
    print(f"\n{'='*70}", flush=True)
    print(f"  EVALUATING MODEL: {model_name} (60 Held-Out Items)", flush=True)
    print(f"{'='*70}", flush=True)
    
    results = []
    smoke_passed = 0
    core_passed = 0
    adv_passed = 0
    
    t0 = time.time()
    for idx, item in enumerate(eval_items):
        eval_id = item["eval_id"]
        tier = item["tier"]
        category = item["category"]
        user_prompt = item["messages"][1]["content"]
        
        try:
            res = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": model_name,
                    "prompt": user_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,
                        "num_predict": max_tokens,
                        "stop": ["<|im_end|>", "<|endoftext|>"]
                    }
                },
                timeout=120
            )
            if res.status_code == 200:
                gen_text = res.json().get("response", "").strip()
            else:
                gen_text = f"ERROR: HTTP {res.status_code}"
        except Exception as e:
            gen_text = f"ERROR: {e}"

        passed = score_eval_item(item, gen_text)
        if passed:
            if tier == "smoke":
                smoke_passed += 1
            elif tier == "core":
                core_passed += 1
            elif tier == "adversarial":
                adv_passed += 1
                
        status_sym = "[PASS]" if passed else "[FAIL]"
        resp_preview = gen_text.replace('\n', ' ')[:65]
        print(f"  [{idx+1:02d}/60] {status_sym} {eval_id} ({tier:<11}) -> {passed} | {resp_preview}", flush=True)
            
        results.append({
            "eval_id": eval_id,
            "tier": tier,
            "category": category,
            "prompt": user_prompt,
            "passed": passed,
            "response": gen_text
        })
        
    duration = time.time() - t0
    total_passed = smoke_passed + core_passed + adv_passed
    
    scorecard = {
        "model": model_name,
        "total_items": len(eval_items),
        "total_passed": total_passed,
        "accuracy_pct": round((total_passed / len(eval_items)) * 100, 2),
        "smoke": {"passed": smoke_passed, "total": 10, "pct": round((smoke_passed/10)*100, 2)},
        "core": {"passed": core_passed, "total": 30, "pct": round((core_passed/30)*100, 2)},
        "adversarial": {"passed": adv_passed, "total": 20, "pct": round((adv_passed/20)*100, 2)},
        "duration_seconds": round(duration, 2)
    }
    
    print(f"\n  SCORECARD for {model_name}:")
    print(f"    Total: {total_passed}/60 ({scorecard['accuracy_pct']}%)")
    print(f"    Smoke: {smoke_passed}/10 | Core: {core_passed}/30 | Adv: {adv_passed}/20")
    print(f"    Duration: {duration:.1f}s", flush=True)
    
    return scorecard, results

def compute_transition_matrix(baseline_dict, current_results):
    retained = 0
    recovered = 0
    regressed = 0
    persistent_fail = 0
    
    recovered_items = []
    regressed_items = []
    
    for r in current_results:
        eid = r["eval_id"]
        base_p = baseline_dict.get(eid, False)
        curr_p = r["passed"]
        
        if base_p and curr_p:
            retained += 1
        elif not base_p and curr_p:
            recovered += 1
            recovered_items.append(eid)
        elif base_p and not curr_p:
            regressed += 1
            regressed_items.append(eid)
        else:
            persistent_fail += 1
            
    return {
        "retained": retained,
        "recovered": recovered,
        "regressed": regressed,
        "persistent_fail": persistent_fail,
        "recovered_items": recovered_items,
        "regressed_items": regressed_items
    }

def main():
    eval_items = load_eval_items()
    baseline_dict = load_baseline_results()
    print(f"Loaded {len(eval_items)} evaluation items. Pre-training baseline has {sum(baseline_dict.values())}/60 passing.")
    
    models_to_eval = [
        "qwen2.5:7b-instruct",       # 1. Ollama Base Raw (default Qwen template)
        "chatr:base-system",         # 2. Ollama Base + System Prompt
        "chatr:business-v1-raw",     # 3. Ollama Adapter Raw (reproduction)
        "chatr:business-v1"          # 4. Ollama Adapter Prod (reproduction)
    ]
    
    all_scorecards = {}
    all_results = {}
    all_transitions = {}
    
    for model in models_to_eval:
        scorecard, results = evaluate_model(model, eval_items, max_tokens=80)
        all_scorecards[model] = scorecard
        all_results[model] = results
        all_transitions[model] = compute_transition_matrix(baseline_dict, results)
        
    # Also compute direct transitions between Base Raw and Adapter Raw:
    base_raw_dict = {r["eval_id"]: r["passed"] for r in all_results["qwen2.5:7b-instruct"]}
    adapter_raw_transitions = compute_transition_matrix(base_raw_dict, all_results["chatr:business-v1-raw"])
    
    # And transitions between Base System and Adapter Prod:
    base_sys_dict = {r["eval_id"]: r["passed"] for r in all_results["chatr:base-system"]}
    adapter_prod_transitions = compute_transition_matrix(base_sys_dict, all_results["chatr:business-v1"])
    
    REPORT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    report_data = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "generation_parameters": {
            "temperature": 0.1,
            "num_predict": 80,
            "stop": ["<|im_end|>", "<|endoftext|>"]
        },
        "scorecards": all_scorecards,
        "transitions_vs_untrained_baseline_45": all_transitions,
        "causal_adapter_transitions": {
            "adapter_raw_vs_base_raw": adapter_raw_transitions,
            "adapter_prod_vs_base_system": adapter_prod_transitions
        },
        "detailed_results": all_results
    }
    
    with open(REPORT_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
        
    print(f"\nParity evaluation complete! Report saved to {REPORT_OUTPUT}")
    
    print("\n" + "="*80)
    print("  EXECUTIVE PARITY SCORECARD SUMMARY (60 HELD-OUT ITEMS)")
    print("="*80)
    print(f"{'Model':<25} | {'Total':<10} | {'Smoke (/10)':<12} | {'Core (/30)':<12} | {'Adv (/20)':<10} | {'Delta vs 45':<12}")
    print("-"*80)
    for model, sc in all_scorecards.items():
        delta = sc["total_passed"] - 45
        delta_str = f"+{delta}" if delta > 0 else str(delta)
        print(f"{model:<25} | {sc['total_passed']}/60 ({sc['accuracy_pct']}%) | {sc['smoke']['passed']:<12} | {sc['core']['passed']:<12} | {sc['adversarial']['passed']:<10} | {delta_str:<12}")
    print("="*80)

if __name__ == "__main__":
    main()
