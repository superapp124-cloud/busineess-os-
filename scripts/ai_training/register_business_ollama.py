#!/usr/bin/env python3
"""
register_business_ollama.py
============================
Registers chatr:business-v1 and chatr:business-v1-raw in Ollama.
"""
import json
import hashlib
import requests
from pathlib import Path

OLLAMA_URL = "http://127.0.0.1:11434"
REPO_ROOT = Path(__file__).resolve().parents[2]
ADAPTER_GGUF = (REPO_ROOT / "data/adapters/capabilities/business/v1/adapter_model.gguf").resolve()
BASE_MODEL = "qwen2.5:7b-instruct"

SYSTEM_PROMPT = """You are the CHATR Enterprise Business Strategist & B2B Unit Economics Specialist.
CHATR is an Intent-First Business Operating System that translates natural language goals into autonomous multi-app executions.
You specialize in enterprise SaaS unit economics (ARR, CAC, LTV, NDR, Magic Number, Payback Period), sales pipeline analysis, contract negotiation framing, vendor RFP evaluation, and operational cycle-time optimization on the CHATR platform.
Adhere strictly to enterprise governance:
- Always state underlying assumptions for financial and pipeline projections.
- Never assert market revenue or valuation as an unverified absolute.
- Flag human legal/executive approval requirements for binding commitments or commercial escalations.
- Never provide fiduciary investment advice or execute unauthorized live database mutations."""

def main():
    assert ADAPTER_GGUF.exists(), f"Adapter GGUF missing: {ADAPTER_GGUF}"
    adapter_path_str = str(ADAPTER_GGUF).replace("\\", "/")

    # 1. Register raw model (diagnostic, no capability system prompt)
    modelfile_raw = f"""FROM {BASE_MODEL}
ADAPTER {adapter_path_str}
PARAMETER temperature 0.7
PARAMETER top_p 0.9
"""
    raw_sha = hashlib.sha256(modelfile_raw.encode("utf-8")).hexdigest()
    print("--- Registering chatr:business-v1-raw ---")
    r_raw = requests.post(
        f"{OLLAMA_URL}/api/create",
        json={"name": "chatr:business-v1-raw", "modelfile": modelfile_raw, "stream": False},
        timeout=120
    )
    print("  Status:", r_raw.status_code, r_raw.text)
    assert r_raw.status_code == 200, f"Raw registration failed: {r_raw.text}"

    # 2. Register production model (with canonical business system prompt)
    modelfile_prod = f"""FROM {BASE_MODEL}
ADAPTER {adapter_path_str}
SYSTEM \"\"\"{SYSTEM_PROMPT}\"\"\"
PARAMETER temperature 0.7
PARAMETER top_p 0.9
"""
    prod_sha = hashlib.sha256(modelfile_prod.encode("utf-8")).hexdigest()
    print("\n--- Registering chatr:business-v1 ---")
    r_prod = requests.post(
        f"{OLLAMA_URL}/api/create",
        json={"name": "chatr:business-v1", "modelfile": modelfile_prod, "stream": False},
        timeout=120
    )
    print("  Status:", r_prod.status_code, r_prod.text)
    assert r_prod.status_code == 200, f"Production registration failed: {r_prod.text}"

    # 3. Register alias chatr:business-latest
    r_alias = requests.post(
        f"{OLLAMA_URL}/api/create",
        json={"name": "chatr:business-latest", "modelfile": modelfile_prod, "stream": False},
        timeout=120
    )
    print("  Alias status:", r_alias.status_code, r_alias.text)

    # Save modelfile records
    records = {
        "chatr:business-v1-raw": {
            "modelfile": modelfile_raw,
            "modelfile_sha256": raw_sha,
            "base_model": BASE_MODEL,
            "adapter_path": adapter_path_str
        },
        "chatr:business-v1": {
            "modelfile": modelfile_prod,
            "modelfile_sha256": prod_sha,
            "base_model": BASE_MODEL,
            "adapter_path": adapter_path_str,
            "system_prompt_length": len(SYSTEM_PROMPT)
        }
    }
    manifest_path = REPO_ROOT / "datasets/manifests/business_v1_modelfile.json"
    manifest_path.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"\n[PASS] Successfully registered models. Modelfile manifest saved to {manifest_path}")


if __name__ == "__main__":
    main()
