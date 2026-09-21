"""
CHATR Train/Eval Leakage & Similarity Auditor (Gate 14)
─────────────────────────────────────────────────────────────────────────────
Audits datasets/eval/general_eval.jsonl against data/general/general_sft_v2.jsonl
for:
- Exact prompt overlap
- Normalized prompt overlap
- Exact answer overlap
- N-gram and token Jaccard similarity
- Forensic analysis of top near-duplicate candidates
"""

import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
TRAIN_PATH = REPO_ROOT / "data" / "general" / "general_sft_v2.jsonl"
EVAL_PATH = REPO_ROOT / "datasets" / "eval" / "general_eval.jsonl"


def normalize(text: str) -> str:
    return re.sub(r"[^\w\s]", "", text.lower()).strip()


def tokenize(text: str) -> set[str]:
    # Filter stopwords for meaningful semantic overlap analysis
    stopwords = {"what", "is", "the", "a", "an", "and", "or", "to", "in", "of", "for", "with", "how", "does", "do", "you", "are", "it"}
    tokens = set(re.findall(r"\b\w+\b", text.lower()))
    return tokens - stopwords


def audit_leakage():
    print("==========================================================================")
    print("  CHATR TRAIN/EVAL LEAKAGE AUDIT (GATE 14)")
    print("==========================================================================")

    # 1. Ingest Train
    train_records = []
    with open(TRAIN_PATH, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f, start=1):
            if line.strip():
                d = json.loads(line)
                user_msg = next((m["content"] for m in d.get("messages", []) if m["role"] == "user"), "")
                asst_msg = next((m["content"] for m in d.get("messages", []) if m["role"] == "assistant"), "")
                train_records.append({
                    "idx": idx,
                    "prompt": user_msg,
                    "norm_prompt": normalize(user_msg),
                    "answer": asst_msg,
                    "norm_answer": normalize(asst_msg),
                    "tokens": tokenize(user_msg)
                })

    # 2. Ingest Eval
    eval_records = []
    with open(EVAL_PATH, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f, start=1):
            if line.strip():
                d = json.loads(line)
                user_msg = d.get("prompt") or next((m["content"] for m in d.get("messages", []) if m["role"] == "user"), "")
                asst_msg = d.get("answer") or next((m["content"] for m in d.get("messages", []) if m["role"] == "assistant"), "")
                eval_records.append({
                    "id": d.get("id", f"eval-{idx}"),
                    "category": d.get("category", "unknown"),
                    "prompt": user_msg,
                    "norm_prompt": normalize(user_msg),
                    "answer": asst_msg,
                    "norm_answer": normalize(asst_msg),
                    "tokens": tokenize(user_msg)
                })

    print(f"Loaded {len(train_records)} training records and {len(eval_records)} evaluation records.")

    # 3. Exact and Normalized Overlap
    exact_prompt_overlap = 0
    norm_prompt_overlap = 0
    exact_answer_overlap = 0
    norm_answer_overlap = 0

    train_prompts = {t["prompt"]: t["idx"] for t in train_records}
    train_norm_prompts = {t["norm_prompt"]: t["idx"] for t in train_records}
    train_answers = {t["answer"]: t["idx"] for t in train_records}
    train_norm_answers = {t["norm_answer"]: t["idx"] for t in train_records}

    for e in eval_records:
        if e["prompt"] in train_prompts:
            exact_prompt_overlap += 1
            print(f"[EXACT PROMPT OVERLAP]: {e['id']} matches Train #{train_prompts[e['prompt']]}")
        if e["norm_prompt"] in train_norm_prompts:
            norm_prompt_overlap += 1
            print(f"[NORM PROMPT OVERLAP]: {e['id']} matches Train #{train_norm_prompts[e['norm_prompt']]}")
        if e["answer"] in train_answers:
            exact_answer_overlap += 1
        if e["norm_answer"] in train_norm_answers:
            norm_answer_overlap += 1

    # 4. Jaccard Similarity Analysis
    suspicious_pairs = []
    for e in eval_records:
        e_tokens = e["tokens"]
        if not e_tokens:
            continue
        for t in train_records:
            t_tokens = t["tokens"]
            if not t_tokens:
                continue
            intersection = len(e_tokens & t_tokens)
            union = len(e_tokens | t_tokens)
            sim = intersection / union if union > 0 else 0.0
            if sim >= 0.50:
                suspicious_pairs.append({
                    "eval_id": e["id"],
                    "eval_prompt": e["prompt"],
                    "train_idx": t["idx"],
                    "train_prompt": t["prompt"],
                    "jaccard_similarity": round(sim, 3),
                    "shared_tokens": sorted(list(e_tokens & t_tokens))
                })

    suspicious_pairs.sort(key=lambda x: x["jaccard_similarity"], reverse=True)

    print("\nOverlap Audit Findings:")
    print(f"  - Exact Prompt Overlap      : {exact_prompt_overlap}")
    print(f"  - Normalized Prompt Overlap : {norm_prompt_overlap}")
    print(f"  - Exact Answer Overlap      : {exact_answer_overlap}")
    print(f"  - Normalized Answer Overlap : {norm_answer_overlap}")
    print(f"  - Near-Duplicate Candidates (Jaccard >= 0.50): {len(suspicious_pairs)}")

    print("\nTop 5 Closest Near-Duplicate Candidates (Forensic Review):")
    for idx, p in enumerate(suspicious_pairs[:5], start=1):
        print(f"\n  Candidate #{idx} [Jaccard: {p['jaccard_similarity']:.2f}]")
        print(f"    Eval ({p['eval_id']}) : {p['eval_prompt']}")
        print(f"    Train (#{p['train_idx']})  : {p['train_prompt']}")
        print(f"    Shared Tokens      : {', '.join(p['shared_tokens'])}")

    report = {
        "train_records_count": len(train_records),
        "eval_records_count": len(eval_records),
        "exact_prompt_overlap": exact_prompt_overlap,
        "normalized_prompt_overlap": norm_prompt_overlap,
        "exact_answer_overlap": exact_answer_overlap,
        "normalized_answer_overlap": norm_answer_overlap,
        "high_similarity_candidates_count": len(suspicious_pairs),
        "top_candidates": suspicious_pairs[:10]
    }

    report_path = REPO_ROOT / "reports" / "train_eval_leakage_audit.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\nFull leakage report saved to: {report_path}")


if __name__ == "__main__":
    audit_leakage()
