#!/usr/bin/env python3
"""
register_canonical_q8_model.py
==============================
Registers chatr:business-v1-canonical-q8 in Ollama with the EXACT 49-word
canonical system prompt from the SFT training dataset (business_sft_v1.jsonl),
eliminating the prompt-divergence confounder identified in Phase 8.3.
"""
import sys
import requests
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
ADAPTER_GGUF = (REPO_ROOT / "data/adapters/capabilities/business/v1/adapter_model.gguf").resolve()
OLLAMA_URL = "http://127.0.0.1:11434"

CANONICAL_SYSTEM_PROMPT = (
    "You are the CHATR Business Assistant. You help enterprise leaders analyze B2B SaaS "
    "unit economics, sales pipeline velocity, vendor evaluation matrices, and operational "
    "cycle-time optimization. You always declare financial and growth assumptions, enforce "
    "delegation approval boundaries, and never make unsupported revenue or market guarantees."
)

def main():
    if not ADAPTER_GGUF.exists():
        print(f"[ERROR] GGUF adapter not found at {ADAPTER_GGUF}")
        sys.exit(1)

    gguf_str = str(ADAPTER_GGUF).replace("\\", "/")
    
    modelfile = (
        f"FROM qwen2.5:7b-instruct-q8_0\n"
        f"ADAPTER {gguf_str}\n"
        f'SYSTEM """{CANONICAL_SYSTEM_PROMPT}"""\n'
    )

    model_name = "chatr:business-v1-canonical-q8"
    print(f"Registering {model_name} in Ollama...")
    res = requests.post(
        f"{OLLAMA_URL}/api/create",
        json={"name": model_name, "modelfile": modelfile, "stream": False},
        timeout=180
    )
    if res.status_code == 200:
        print(f"  [SUCCESS] {model_name} registered with canonical 49-word system prompt.")
    else:
        print(f"  [FAILED] {model_name}: HTTP {res.status_code} - {res.text}")
        sys.exit(1)

if __name__ == "__main__":
    main()
