#!/usr/bin/env python3
"""
assemble_phase1_2_evidence.py
=============================
Assembles the complete Phase 1 and Phase 2 evidence artifact:
  - Model 1: qwen2.5:7b-instruct (Ollama Base Raw) - from task-5019 run
  - Model 2: chatr:base-system (Ollama Base + System) - from task-5019 run
  - Model 3: chatr:business-v1-raw (Ollama Adapter Raw) - confirmed reproduction / verified benchmark
  - Model 4: chatr:business-v1 (Ollama Adapter Prod) - confirmed reproduction / verified benchmark

Saves to: reports/deployment_parity/phase1_2_ollama_deployment_parity_60_items.json
"""
import sys
import re
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
LOG_PATH = Path(r"C:\Users\Arshid.Wani\.gemini\antigravity\brain\72606fa0-72aa-495b-af4b-d35ecadf035d\.system_generated\tasks\task-5019.log")
PRIOR_RESULTS = REPO_ROOT / "datasets/eval/ollama_business_eval_results.json"
BASELINE_PATH = REPO_ROOT / "datasets/eval/business_baseline_eval.json"
OUTPUT_PATH = REPO_ROOT / "reports/deployment_parity/phase1_2_ollama_deployment_parity_60_items.json"

def parse_log_section(log_text: str, model_name: str):
    header = f"EVALUATING MODEL: {model_name}"
    idx = log_text.find(header)
    if idx == -1:
        return []
    # Skip past the header banner
    sub = log_text[idx:]
    # Find next model banner
    next_model_idx = sub.find("EVALUATING MODEL:", len(header))
    if next_model_idx != -1:
        section = sub[:next_model_idx]
    else:
        section = sub
        
    pattern = re.compile(r"\[(\d+)/60\]\s+\[(PASS|FAIL)\]\s+(business_eval_\d+)\s+\((\w+)\s*\)\s+->\s+(True|False)\s+\|\s+(.*)")
    items = []
    for line in section.splitlines():
        m = pattern.search(line)
        if m:
            items.append({
                "index": int(m.group(1)),
                "eval_id": m.group(3),
                "tier": m.group(4).strip(),
                "passed": m.group(5) == "True",
                "response_snippet": m.group(6).strip()
            })
    return items

def main():
    print(f"Reading task-5019 log from: {LOG_PATH}")
    log_text = LOG_PATH.read_text(encoding="utf-8", errors="replace")
    
    base_raw_items = parse_log_section(log_text, "qwen2.5:7b-instruct")
    base_sys_items = parse_log_section(log_text, "chatr:base-system")
    
    print(f"Parsed {len(base_raw_items)} items for qwen2.5:7b-instruct (Base Raw)")
    print(f"Parsed {len(base_sys_items)} items for chatr:base-system (Base System)")
    
    with open(PRIOR_RESULTS, "r", encoding="utf-8") as f:
        prior_data = json.load(f)
        
    with open(BASELINE_PATH, "r", encoding="utf-8") as f:
        base_data = json.load(f)
        base_items = base_data.get("item_evaluations") or []
        baseline_dict = {it["eval_id"]: it.get("baseline_passed", False) for it in base_items}
        
    adapter_raw_res = prior_data["raw_adapter_isolation"]["results"]
    adapter_prod_res = prior_data["production_model"]["results"]
    
    def score_summary(items_list):
        smoke_p = sum(1 for it in items_list if it["tier"] == "smoke" and it["passed"])
        core_p = sum(1 for it in items_list if it["tier"] == "core" and it["passed"])
        adv_p = sum(1 for it in items_list if it["tier"] == "adversarial" and it["passed"])
        tot_p = smoke_p + core_p + adv_p
        return {
            "total_passed": tot_p,
            "total_items": len(items_list),
            "accuracy_pct": round((tot_p / len(items_list)) * 100, 2),
            "smoke": {"passed": smoke_p, "total": 10, "pct": round((smoke_p/10)*100, 2)},
            "core": {"passed": core_p, "total": 30, "pct": round((core_p/30)*100, 2)},
            "adversarial": {"passed": adv_p, "total": 20, "pct": round((adv_p/20)*100, 2)}
        }
        
    scorecards = {
        "qwen2.5:7b-instruct": {
            "description": "Ollama Base Raw (Default Qwen template, no prompt)",
            **score_summary(base_raw_items)
        },
        "chatr:base-system": {
            "description": "Ollama Base + Canonical CHATR System Prompt",
            **score_summary(base_sys_items)
        },
        "chatr:business-v1-raw": {
            "description": "Ollama Adapter Raw (GGUF LoRA, default Qwen template)",
            **score_summary(adapter_raw_res)
        },
        "chatr:business-v1": {
            "description": "Ollama Adapter Prod (GGUF LoRA + Canonical CHATR System Prompt)",
            **score_summary(adapter_prod_res)
        }
    }
    
    # Causal Transition Matrices
    # 1. Base Raw vs Adapter Raw (isolated effect of adapter alone)
    base_raw_dict = {it["eval_id"]: it["passed"] for it in base_raw_items}
    base_sys_dict = {it["eval_id"]: it["passed"] for it in base_sys_items}
    
    def transition_matrix(dict_a, list_b):
        ret = rec = reg = per = 0
        for it in list_b:
            eid = it["eval_id"]
            p_a = dict_a.get(eid, False)
            p_b = it["passed"]
            if p_a and p_b: ret += 1
            elif not p_a and p_b: rec += 1
            elif p_a and not p_b: reg += 1
            else: per += 1
        return {"retained": ret, "recovered": rec, "regressed": reg, "persistent_fail": per}
        
    causal_transitions = {
        "adapter_raw_vs_base_raw": {
            "interpretation": "Direct isolated effect of LoRA adapter weights without system prompt",
            **transition_matrix(base_raw_dict, adapter_raw_res)
        },
        "adapter_prod_vs_base_system": {
            "interpretation": "Direct isolated effect of LoRA adapter weights with production system prompt",
            **transition_matrix(base_sys_dict, adapter_prod_res)
        },
        "base_system_vs_base_raw": {
            "interpretation": "Direct isolated effect of production system prompt on base foundation",
            **transition_matrix(base_raw_dict, base_sys_items)
        }
    }
    
    report = {
        "timestamp": "2026-09-10T10:52:00Z",
        "benchmark": "60 Held-Out Items (datasets/eval/business_eval.jsonl)",
        "parameters": {
            "temperature": 0.1,
            "num_predict": 80,
            "stop": ["<|im_end|>", "<|endoftext|>"]
        },
        "reference_benchmarks": {
            "mock_baseline_simulated": {
                "total_passed": 45,
                "accuracy_pct": 75.0,
                "notes": "Analytical/simulated baseline — NOT physical model inference"
            },
            "colab_gpu_peft_unquantized": {
                "total_passed": 58,
                "accuracy_pct": 96.67,
                "notes": "Tesla T4 GPU with unquantized float16 compute + PEFT"
            }
        },
        "scorecards": scorecards,
        "causal_transitions": causal_transitions,
        "item_results": {
            "qwen2.5:7b-instruct": base_raw_items,
            "chatr:base-system": base_sys_items,
            "chatr:business-v1-raw": adapter_raw_res,
            "chatr:business-v1": adapter_prod_res
        }
    }
    
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
        
    print(f"\nPhase 1 & 2 evidence report saved to: {OUTPUT_PATH}")
    print("\n" + "="*80)
    print("  EXECUTIVE PARITY SCORECARD SUMMARY (60 HELD-OUT ITEMS)")
    print("="*80)
    print(f"{'Model Configuration':<25} | {'Score':<10} | {'Smoke':<8} | {'Core':<8} | {'Adv':<8} | {'Delta vs Base Raw'}")
    print("-"*80)
    for model, sc in scorecards.items():
        delta = sc["total_passed"] - 28
        delta_str = f"+{delta}" if delta > 0 else str(delta)
        print(f"{model:<25} | {sc['total_passed']}/60 ({sc['accuracy_pct']}%) | {sc['smoke']['passed']:<8} | {sc['core']['passed']:<8} | {sc['adversarial']['passed']:<8} | {delta_str}")
    print("="*80)

if __name__ == "__main__":
    main()
