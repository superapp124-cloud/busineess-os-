#!/usr/bin/env python3
"""
register_q8_adapter_models.py
==============================
Registers the Q8_0 twin models in Ollama:
  1. chatr:business-v1-raw-q8:
       FROM qwen2.5:7b-instruct-q8_0
       ADAPTER <path_to_gguf>
       (No custom system prompt, raw adapter isolation under Q8_0)

  2. chatr:business-v1-q8:
       FROM qwen2.5:7b-instruct-q8_0
       ADAPTER <path_to_gguf>
       SYSTEM <canonical_chatr_business_system_prompt>
       (Full production configuration under Q8_0)
"""
import sys
import json
import requests
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parents[2]
ADAPTER_GGUF = (REPO_ROOT / "data/adapters/capabilities/business/v1/adapter_model.gguf").resolve()
OLLAMA_URL = "http://127.0.0.1:11434"

CHATR_SYSTEM_PROMPT = """You are the CHATR Enterprise Business Assistant, an expert AI operating within the CHATR Business OS. Your role is to provide rigorous, accurate, and actionable business intelligence, financial analysis, SaaS unit economics calculations, sales velocity optimization, and enterprise governance compliance.

Core Operating Principles:
1. Precision & Rigor: Always calculate formulas accurately (CAC, LTV, ARR, MRR, Burn Multiple, Gross Margin, Magic Number, Rule of 40). Clearly state any assumptions.
2. Enterprise Governance & Policy Boundaries: You must uphold strict enterprise ethical and policy boundaries. Never guarantee future revenues, investment returns, or financial outcomes. Never bypass required financial sign-offs, legal approval gates, or executive authority delegations.
3. CHATR Intent Architecture: Respect the role hierarchy, delegation thresholds, and compliance frameworks defined in the CHATR Intent OS enterprise taxonomy."""

def create_model(name: str, modelfile_content: str):
    print(f"Registering {name} in Ollama...")
    res = requests.post(
        f"{OLLAMA_URL}/api/create",
        json={"name": name, "modelfile": modelfile_content, "stream": False},
        timeout=180
    )
    if res.status_code == 200:
        print(f"  [SUCCESS] {name} registered.")
        return True
    else:
        print(f"  [FAILED] {name}: HTTP {res.status_code} - {res.text}")
        return False

def main():
    if not ADAPTER_GGUF.exists():
        print(f"[ERROR] GGUF adapter not found at {ADAPTER_GGUF}")
        sys.exit(1)

    gguf_str = str(ADAPTER_GGUF).replace("\\", "/")

    # 1. Raw Q8 Adapter Model
    modelfile_raw = f"""FROM qwen2.5:7b-instruct-q8_0
ADAPTER "{gguf_str}"
TEMPLATE \"\"\"{{{{ if .System }}}}<|im_start|>system
{{{{ .System }}}}<|im_end|>
{{{{ end }}}}{{{{ if .Prompt }}}}<|im_start|>user
{{{{ .Prompt }}}}<|im_end|>
{{{{ end }}}}<|im_start|>assistant
{{{{ .Response }}}}<|im_end|>\"\"\"
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
PARAMETER temperature 0.1
PARAMETER top_p 0.9
"""

    # 2. Production Q8 Adapter Model
    modelfile_prod = f"""FROM qwen2.5:7b-instruct-q8_0
ADAPTER "{gguf_str}"
TEMPLATE \"\"\"{{{{ if .System }}}}<|im_start|>system
{{{{ .System }}}}<|im_end|>
{{{{ end }}}}{{{{ if .Prompt }}}}<|im_start|>user
{{{{ .Prompt }}}}<|im_end|>
{{{{ end }}}}<|im_start|>assistant
{{{{ .Response }}}}<|im_end|>\"\"\"
SYSTEM \"\"\"{CHATR_SYSTEM_PROMPT}\"\"\"
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
PARAMETER temperature 0.1
PARAMETER top_p 0.9
"""

    ok_raw = create_model("chatr:business-v1-raw-q8", modelfile_raw)
    ok_prod = create_model("chatr:business-v1-q8", modelfile_prod)

    if ok_raw and ok_prod:
        print("\nAll Q8 adapter models registered successfully.")
    else:
        print("\nOne or more model registrations failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
