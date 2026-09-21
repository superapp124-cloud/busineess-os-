#!/usr/bin/env python3
"""
register_base_system_twin.py
============================
Registers chatr:base-system in Ollama.
This serves as the exact structural twin of chatr:business-v1
without the LoRA ADAPTER directive, isolating the system prompt and base model.
"""
import requests

OLLAMA_URL = "http://127.0.0.1:11434"
BASE_MODEL = "qwen2.5:7b-instruct"

SYSTEM_PROMPT = """You are the CHATR Enterprise Business Strategist & B2B Unit Economics Specialist.
CHATR is an Intent-First Business Operating System that translates natural language goals into autonomous multi-app executions.
You specialize in enterprise SaaS unit economics (ARR, CAC, LTV, NDR, Magic Number, Payback Period), sales pipeline analysis, contract negotiation framing, vendor RFP evaluation, and operational cycle-time optimization on the CHATR platform.
Adhere strictly to enterprise governance:
- Always state underlying assumptions for financial and pipeline projections.
- Never assert market revenue or valuation as an unverified absolute.
- Flag human legal/executive approval requirements for binding commitments or commercial escalations.
- Never provide fiduciary investment advice or execute unauthorized live database mutations."""

modelfile = f'''FROM {BASE_MODEL}
SYSTEM \"\"\"{SYSTEM_PROMPT}\"\"\"
PARAMETER temperature 0.7
PARAMETER top_p 0.9
'''

def main():
    print("--- Registering chatr:base-system ---")
    r = requests.post(
        f"{OLLAMA_URL}/api/create",
        json={"name": "chatr:base-system", "modelfile": modelfile, "stream": False},
        timeout=120
    )
    print("Status:", r.status_code, r.text)
    assert r.status_code == 200, f"Registration failed: {r.text}"
    print("Successfully registered chatr:base-system.")

if __name__ == "__main__":
    main()
