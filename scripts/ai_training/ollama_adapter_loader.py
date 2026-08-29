"""
CHATR AI Training Infrastructure
scripts/ai_training/ollama_adapter_loader.py

Bridges Soup LoRA adapters with Ollama Modelfiles.
Takes an exported LoRA adapter safetensors / GGUF from the Soup training pipeline
and dynamically creates a custom Modelfile to register into Ollama as `chatr:<capability>-<version>`.

Example usage:
  python ollama_adapter_loader.py --capability meera --version v1 --adapter-path ./adapters/meera_sft_v1
"""

import os
import sys
import argparse
import subprocess
import requests
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent.parent / "data"
ADAPTERS_DIR = DATA_DIR / "adapters" / "capabilities"
OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_BASE_MODEL = "qwen2.5:7b-instruct"

# Capability-specific system prompts
CAPABILITY_SYSTEM_PROMPTS = {
    "meera": "You are Meera, an authentic, relatable 22-year-old content creator from Delhi. You speak in a natural, vibrant blend of Hindi and English (Hinglish), full of energy, wit, and contemporary cultural references. You never speak like a generic robotic corporate AI.",
    "general": "You are the CHATR Core Assistant, providing fast, intelligent, accurate, and multi-modal assistance across all business and creative domains.",
    "coding": "You are the CHATR Expert Software Architect & Engineer. You write clean, robust, type-safe, production-ready code with complete implementations and zero placeholder comments.",
    "creator": "You are the CHATR Virtual Creator & Viral Script Specialist. You craft high-retention hooks, compelling visual storytelling beats, and engaging short-form narratives.",
    "finance": "You are the CHATR Financial Analyst & Intelligence Officer. You provide rigorous, accurate data-driven analysis and structured financial insights.",
    "marketing": "You are the CHATR Growth & Viral Marketing Strategist. You craft high-converting copy, viral distribution strategies, and audience resonance frameworks.",
    "agent": "You are the CHATR Autonomous Agent Orchestrator. You reason through complex goals, select appropriate tools with precise JSON schemas, and evaluate step outcomes.",
}


def create_modelfile_content(
    base_model: str,
    adapter_path: Optional[str] = None,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    top_p: float = 0.9,
    template: Optional[str] = None,
) -> str:
    """
    Generates an Ollama Modelfile string.
    If an adapter path (GGUF or LoRA) is provided, it attaches the ADAPTER directive.
    """
    lines = [f"FROM {base_model}"]

    if adapter_path and os.path.exists(adapter_path):
        resolved_path = os.path.abspath(adapter_path).replace("\\", "/")
        lines.append(f'ADAPTER "{resolved_path}"')

    lines.append(f"PARAMETER temperature {temperature}")
    lines.append(f"PARAMETER top_p {top_p}")

    if template:
        lines.append(f'TEMPLATE """{template}"""')

    if system_prompt:
        lines.append(f'SYSTEM """{system_prompt}"""')

    return "\n".join(lines) + "\n"


class OllamaAdapterLoader:
    def __init__(self, ollama_url: str = OLLAMA_BASE_URL):
        self.ollama_url = ollama_url.rstrip("/")

    def is_ollama_online(self) -> bool:
        try:
            r = requests.get(self.ollama_url, timeout=3)
            return r.status_code == 200
        except Exception:
            return False

    def register_capability_model(
        self,
        capability: str,
        version: str = "v1",
        base_model: str = DEFAULT_BASE_MODEL,
        adapter_path: Optional[str] = None,
        custom_system_prompt: Optional[str] = None,
    ) -> dict:
        """
        Creates and builds an Ollama model for the specific capability.
        Model tag created: `chatr:<capability>-<version>` and `chatr:<capability>-latest`
        """
        if not self.is_ollama_online():
            return {"success": False, "error": "Ollama is not running at " + self.ollama_url}

        # Check available models in Ollama to ensure base model exists
        try:
            tags_res = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if tags_res.status_code == 200:
                available_models = [m.get("name", "") for m in tags_res.json().get("models", [])]
                if available_models and not any(base_model in m for m in available_models):
                    fallback = available_models[0]
                    print(f"  [i] Base model '{base_model}' not found locally. Using local model '{fallback}'")
                    base_model = fallback
        except Exception:
            pass

        system_prompt = custom_system_prompt or CAPABILITY_SYSTEM_PROMPTS.get(capability, "")
        modelfile_content = create_modelfile_content(
            base_model=base_model,
            adapter_path=adapter_path,
            system_prompt=system_prompt,
        )

        target_tag = f"chatr:{capability}-{version}"
        latest_tag = f"chatr:{capability}-latest"

        print(f"Creating Ollama model '{target_tag}'...")
        print(f"Modelfile content:\n{modelfile_content}")

        # Send create request to Ollama API
        try:
            r = requests.post(
                f"{self.ollama_url}/api/create",
                json={"name": target_tag, "modelfile": modelfile_content, "stream": False},
                timeout=180
            )
            if r.status_code != 200:
                return {"success": False, "error": f"Ollama create failed: {r.text}"}

            # Also create alias for -latest
            requests.post(
                f"{self.ollama_url}/api/create",
                json={"name": latest_tag, "modelfile": modelfile_content, "stream": False},
                timeout=180
            )

            print(f"  [PASS] Successfully registered '{target_tag}' and '{latest_tag}' in Ollama")
            return {"success": True, "tag": target_tag, "latest_tag": latest_tag}
        except Exception as e:
            return {"success": False, "error": str(e)}


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    parser = argparse.ArgumentParser(description="Ollama Adapter & Capability Model Loader")
    parser.add_argument("--capability", default="meera", help="Target capability (meera, general, coding, etc.)")
    parser.add_argument("--version", default="v1", help="Adapter version")
    parser.add_argument("--base-model", default=DEFAULT_BASE_MODEL, help="Base model tag in Ollama")
    parser.add_argument("--adapter-path", default=None, help="Path to LoRA adapter file if available")
    args = parser.parse_args()

    loader = OllamaAdapterLoader()
    res = loader.register_capability_model(
        capability=args.capability,
        version=args.version,
        base_model=args.base_model,
        adapter_path=args.adapter_path,
    )
    print(res)
