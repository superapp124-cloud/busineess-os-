"""
Phase 0 — Step 2: Baseline Benchmark
Runs the base models through a capability test suite and records scores.
These become the comparison baseline for adapter evaluation.
"""
import sys, json, time, datetime, hashlib
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

try:
    import requests
except ImportError:
    print("pip install requests")
    sys.exit(1)

OLLAMA_URL = "http://localhost:11434"
RESULTS_PATH = Path("data/adapters/phase0_baseline.json")
RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)

# ── Capability test prompts ──────────────────────────────────────────────────
TEST_SUITES = {
    "general": [
        {"prompt": "What is the difference between RAM and storage?", "check": ["storage", "RAM", "memory"]},
        {"prompt": "Explain what an API is in one paragraph.", "check": ["application", "interface", "request"]},
        {"prompt": "What is compound interest? Give a brief example.", "check": ["interest", "principal", "compound"]},
    ],
    "coding": [
        {"prompt": "Write a Python function that reverses a string.", "check": ["def", "return", "[::-1]"]},
        {"prompt": "What does the SQL keyword JOIN do?", "check": ["table", "rows", "match"]},
        {"prompt": "Write a TypeScript type that makes all keys optional.", "check": ["Partial", "optional", "type"]},
    ],
    "meera": [
        {"prompt": "Meera, what's your morning routine like?", "check": ["chai", "Delhi", "morning"]},
        {"prompt": "Meera, give me a video hook idea for a Delhi street food Reel.", "check": ["hook", "food", "Reel"]},
        {"prompt": "Meera, how do you handle creative blocks?", "check": ["creative", "idea", "block"]},
    ],
}

def chat(model: str, prompt: str, system: str = "") -> dict:
    """Single inference call to Ollama, returns response + timing."""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    start = time.perf_counter()
    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/chat",
            json={"model": model, "messages": messages, "stream": False},
            timeout=60,
        )
        elapsed_ms = (time.perf_counter() - start) * 1000
        if r.status_code != 200:
            return {"response": "", "ttft_ms": elapsed_ms, "error": f"HTTP {r.status_code}"}
        data = r.json()
        return {
            "response": data.get("message", {}).get("content", ""),
            "ttft_ms": round(elapsed_ms, 1),
        }
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return {"response": "", "ttft_ms": round(elapsed_ms, 1), "error": str(e)}


def score_response(response: str, keywords: list[str]) -> float:
    """Simple keyword grounding score: fraction of expected keywords present."""
    resp_lower = response.lower()
    hits = sum(1 for kw in keywords if kw.lower() in resp_lower)
    return round(hits / len(keywords), 3) if keywords else 0.0


def run_baseline(model: str, capability: str) -> dict:
    suite = TEST_SUITES.get(capability, [])
    if not suite:
        return {"error": f"No test suite for {capability}"}

    system_prompts = {
        "general":  "You are a helpful AI assistant. Be concise and accurate.",
        "coding":   "You are an expert software engineer. Give precise, correct answers.",
        "meera":    "You are Meera, a vibrant 22-year-old content creator from Delhi. Speak in Hinglish.",
    }
    system = system_prompts.get(capability, "")

    results = []
    total_score = 0.0
    total_ms = 0.0

    for i, test in enumerate(suite):
        print(f"    [{i+1}/{len(suite)}] {test['prompt'][:60]}...")
        result = chat(model, test["prompt"], system)
        score = score_response(result.get("response", ""), test.get("check", []))
        total_score += score
        total_ms += result.get("ttft_ms", 0)
        results.append({
            "prompt": test["prompt"],
            "response_preview": result.get("response", "")[:120],
            "keywords_expected": test["check"],
            "keyword_score": score,
            "ttft_ms": result.get("ttft_ms"),
            "error": result.get("error"),
        })
        print(f"      score={score:.2f}  ttft={result.get('ttft_ms',0):.0f}ms")

    avg_score = round(total_score / len(suite), 3)
    avg_ms = round(total_ms / len(suite), 1)

    return {
        "model": model,
        "capability": capability,
        "avg_keyword_score": avg_score,
        "avg_ttft_ms": avg_ms,
        "tests": results,
    }


# ── Main ─────────────────────────────────────────────────────────────────────

# Use phi3:mini as the base — it's already in Ollama and small enough for fast baseline
# (We'll compare against this when adapters come back from Colab)
MODELS_TO_BASELINE = [
    ("phi3:mini",      ["general", "coding", "meera"]),
    ("llama3.2:3b",    ["general", "coding", "meera"]),
]

# Also test the existing chatr:meera-v1 to see if it's already differentiated
CHATR_MODELS = [
    ("chatr:meera-v1", ["meera"]),
]

all_results = {}

print("=" * 60)
print("CHATR PHASE 0 — BASELINE BENCHMARK")
print(f"Started: {datetime.datetime.now().strftime('%H:%M:%S')}")
print("=" * 60)

# Health check
try:
    r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
    models_available = [m["name"] for m in r.json().get("models", [])]
    print(f"\nOllama online. Models: {models_available}\n")
except Exception as e:
    print(f"Ollama offline: {e}")
    sys.exit(1)

for model, capabilities in MODELS_TO_BASELINE + CHATR_MODELS:
    if model not in models_available:
        print(f"Skipping {model} — not loaded in Ollama")
        continue
    print(f"\n── Model: {model} ──")
    all_results[model] = {}
    for cap in capabilities:
        print(f"  Capability: {cap}")
        result = run_baseline(model, cap)
        all_results[model][cap] = result
        print(f"  → avg_score={result.get('avg_keyword_score')}  avg_ttft={result.get('avg_ttft_ms')}ms")

# Save results
output = {
    "_meta": {
        "phase": "phase0_baseline",
        "recorded_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "purpose": "Baseline scores before adapter training. Compare against adapter-loaded models to prove improvement.",
        "gate": "adapter_score > baseline_score AND regression_score > 0.90",
    },
    "baselines": all_results,
}
RESULTS_PATH.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")

print("\n" + "=" * 60)
print("BASELINE BENCHMARK COMPLETE")
print(f"Results saved: {RESULTS_PATH}")
print("\nSummary:")
for model, caps in all_results.items():
    for cap, r in caps.items():
        print(f"  {model:<25} {cap:<10} score={r.get('avg_keyword_score','?'):.2f}  ttft={r.get('avg_ttft_ms','?')}ms")
print("\nNext: submit training job to Colab worker, then compare adapter vs these baselines.")
