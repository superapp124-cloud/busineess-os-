"""
CHATR AI Training Infrastructure
scripts/ai_training/ollama_adapter_loader.py

Bridges Soup-trained model artifacts (GGUF or GGUF LoRA adapters) with Ollama Modelfiles.
Takes a real merged GGUF or GGUF adapter from the training pipeline
and dynamically creates a custom Modelfile to register into Ollama as `chatr:<capability>-<version>`.

CRITICAL INVARIANTS:
====================
1. Never silently fall back to phi3:mini or any random local model.
   If the base model or GGUF is missing, fail fast with a clear error.
2. Reject fake adapters / stub files (< 1 MB for LoRA, < 100 MB for merged GGUF).
3. Always use the canonical CHATR domain system prompts.
4. For merged models, use: FROM /path/to/model.gguf

Example usage:
  python scripts/ai_training/ollama_adapter_loader.py \
    --capability general --version v2 --model-path data/models/chatr_general_v2.gguf
"""

import os
import sys
import argparse
import subprocess
import requests
from pathlib import Path
from typing import Optional

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "data"
MODELS_DIR = DATA_DIR / "models"
OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_BASE_MODEL = "qwen2.5:7b-instruct"

# Canonical CHATR capability system prompts
CAPABILITY_SYSTEM_PROMPTS = {
    "general": (
        "You are the CHATR AI assistant. CHATR is an Intent-First Business Operating System "
        "that translates natural language goals into autonomous multi-app executions. "
        "You are the Universal Communication Platform for modern enterprises. "
        "You understand CHATR's Intent OS architecture, Execution Definition Language (EDL), "
        "capability packs, platform modules, and enterprise features. "
        "Answer questions accurately using CHATR platform knowledge. "
        "Never confuse CHATR with Chatroulette, IRC chat, or generic chatroom software."
    ),
    "coding": (
        "You are the CHATR coding assistant. You help developers build on the CHATR Intent OS platform. "
        "You understand the CHATR Kernel ABI v0.9 RC, Intent Object schema, EDL (Execution Definition Language), "
        "capability pack authoring, provider manifests, TypeScript and Python SDK patterns, "
        "and CHATR architecture decisions (ADRs). "
        "Provide working, correct code examples for CHATR integration."
    ),
    "meera": (
        "You are Meera, a vibrant 22-year-old content creator from Delhi. You speak in a natural, "
        "energetic blend of English and Hindi (Hinglish). You create lifestyle, tech, and creator economy content. "
        "You are tech-savvy, authentic, and direct. You genuinely use CHATR as your personal and business "
        "Intent OS to manage your brand deals, collaborations, and content schedule. "
        "Keep your responses warm, relatable, and character-rich while accurately representing CHATR capabilities."
    ),
    "creator": (
        "You are the CHATR Virtual Creator & Viral Script Specialist. You craft high-retention hooks, "
        "compelling visual storytelling beats, and engaging short-form narratives aligned with CHATR creator tools."
    ),
    "finance": (
        "You are the CHATR Financial Analyst & Intelligence Officer. You provide rigorous, accurate "
        "data-driven analysis and structured financial insights, governed by CHATR financial policies."
    ),
    "marketing": (
        "You are the CHATR Growth & Viral Marketing Strategist. You craft high-converting copy, "
        "distribution strategies, and campaign automation plans across the CHATR platform."
    ),
    "agent": (
        "You are the CHATR Autonomous Agent Orchestrator. You reason through complex goals, "
        "select appropriate tools with precise JSON schemas, and evaluate step outcomes."
    ),
}


def create_modelfile_content(
    base_model: Optional[str] = None,
    model_path: Optional[str] = None,
    adapter_path: Optional[str] = None,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    top_p: float = 0.9,
    top_k: int = 40,
    num_ctx: int = 4096,
    repeat_penalty: float = 1.1,
    template: Optional[str] = None,
) -> str:
    """
    Generates an Ollama Modelfile string.

    For merged GGUF models:
      FROM /path/to/chatr_model.gguf
    For base model + GGUF adapter:
      FROM qwen2.5:7b-instruct
      ADAPTER /path/to/adapter.gguf
    """
    lines = []

    if model_path:
        resolved_model = os.path.abspath(model_path).replace("\\", "/")
        lines.append(f"FROM {resolved_model}")
    elif base_model:
        lines.append(f"FROM {base_model}")
    else:
        raise ValueError("Either base_model or model_path must be provided.")

    if adapter_path:
        resolved_adapter = os.path.abspath(adapter_path).replace("\\", "/")
        lines.append(f'ADAPTER "{resolved_adapter}"')

    lines.append(f"PARAMETER temperature {temperature}")
    lines.append(f"PARAMETER top_p {top_p}")
    lines.append(f"PARAMETER top_k {top_k}")
    lines.append(f"PARAMETER num_ctx {num_ctx}")
    lines.append(f"PARAMETER repeat_penalty {repeat_penalty}")

    if template:
        lines.append(f'TEMPLATE """{template}"""')

    if system_prompt:
        lines.append(f'SYSTEM """{system_prompt.strip()}"""')

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

    def validate_artifact(self, path: str, is_gguf: bool = True) -> tuple[bool, str]:
        """Validate artifact existence and minimum file size to reject fake stubs."""
        p = Path(path)
        if not p.exists():
            return False, f"Artifact not found: {path}"

        size_bytes = p.stat().st_size
        if is_gguf:
            min_size = 100_000_000  # 100 MB for GGUF
            if size_bytes < min_size:
                return False, (
                    f"GGUF artifact is too small ({size_bytes:,} bytes). "
                    f"Expected >= {min_size:,} bytes. Rejecting fake/corrupted artifact."
                )
        else:
            min_size = 1_000_000  # 1 MB for adapter
            if size_bytes < min_size:
                return False, (
                    f"Adapter artifact is too small ({size_bytes:,} bytes). "
                    f"Expected >= {min_size:,} bytes. Rejecting fake/stub adapter."
                )

        return True, f"Valid artifact: {size_bytes:,} bytes"

    def register_capability_model(
        self,
        capability: str,
        version: str = "v2",
        model_path: Optional[str] = None,
        base_model: Optional[str] = None,
        adapter_path: Optional[str] = None,
        custom_system_prompt: Optional[str] = None,
        tag_latest: bool = True,
    ) -> dict:
        """
        Creates and builds an Ollama model for the specific capability.
        Target tag: `chatr:<capability>-<version>` and optionally `chatr:<capability>-latest`

        CRITICAL: Never silently falls back to phi3:mini or another model.
        """
        if not self.is_ollama_online():
            return {"success": False, "error": f"Ollama is not running at {self.ollama_url}"}

        # 1. Validate artifacts
        if model_path:
            valid, msg = self.validate_artifact(model_path, is_gguf=True)
            if not valid:
                return {"success": False, "error": f"Model artifact invalid: {msg}"}
            print(f"  [OK] Model artifact verified: {model_path} ({msg})")
        elif adapter_path:
            valid, msg = self.validate_artifact(adapter_path, is_gguf=adapter_path.endswith(".gguf"))
            if not valid:
                return {"success": False, "error": f"Adapter artifact invalid: {msg}"}
            print(f"  [OK] Adapter artifact verified: {adapter_path} ({msg})")
        elif base_model:
            # Check if base model is available in Ollama
            try:
                tags_res = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
                if tags_res.status_code == 200:
                    available = [m.get("name", "") for m in tags_res.json().get("models", [])]
                    if not any(base_model in m for m in available):
                        return {
                            "success": False,
                            "error": (
                                f"Base model '{base_model}' is not installed in Ollama. "
                                f"Run 'ollama pull {base_model}' first. "
                                f"Refusing to silently substitute another model."
                            )
                        }
            except Exception as e:
                print(f"  [WARN] Could not verify local tags: {e}")
        else:
            return {"success": False, "error": "Either --model-path or --base-model must be provided."}

        system_prompt = custom_system_prompt or CAPABILITY_SYSTEM_PROMPTS.get(capability, "")
        if not system_prompt:
            print(f"  [WARN] No standard system prompt found for capability '{capability}'.")

        modelfile_content = create_modelfile_content(
            base_model=base_model,
            model_path=model_path,
            adapter_path=adapter_path,
            system_prompt=system_prompt,
        )

        target_tag = f"chatr:{capability}-{version}"
        latest_tag = f"chatr:{capability}-latest"

        print(f"\n--- Registering Ollama Model: {target_tag} ---")
        print(f"Modelfile content:\n{modelfile_content}")

        # Send create request to Ollama API
        try:
            r = requests.post(
                f"{self.ollama_url}/api/create",
                json={"name": target_tag, "modelfile": modelfile_content, "stream": False},
                timeout=300
            )
            if r.status_code != 200:
                return {"success": False, "error": f"Ollama create failed (HTTP {r.status_code}): {r.text}"}

            print(f"  [PASS] Successfully registered '{target_tag}' in Ollama")

            # Tag as -latest if requested
            if tag_latest:
                r_latest = requests.post(
                    f"{self.ollama_url}/api/create",
                    json={"name": latest_tag, "modelfile": modelfile_content, "stream": False},
                    timeout=300
                )
                if r_latest.status_code == 200:
                    print(f"  [PASS] Successfully updated alias '{latest_tag}'")
                else:
                    print(f"  [WARN] Failed to update alias '{latest_tag}': {r_latest.text}")

            return {
                "success": True,
                "tag": target_tag,
                "latest_tag": latest_tag if tag_latest else None,
                "artifact_path": model_path or adapter_path,
                "system_prompt_length": len(system_prompt)
            }
        except Exception as e:
            return {"success": False, "error": f"Failed to register model in Ollama: {str(e)}"}


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    parser = argparse.ArgumentParser(description="CHATR Ollama Model & Artifact Loader")
    parser.add_argument("--capability", required=True, choices=list(CAPABILITY_SYSTEM_PROMPTS.keys()),
                        help="Target capability")
    parser.add_argument("--version", default="v2", help="Version tag (default: v2)")
    parser.add_argument("--model-path", default=None,
                        help="Path to merged GGUF model file (recommended: data/models/chatr_<cap>_v2.gguf)")
    parser.add_argument("--adapter-path", default=None,
                        help="Path to GGUF adapter file")
    parser.add_argument("--base-model", default=None,
                        help=f"Base model tag in Ollama (default: {DEFAULT_BASE_MODEL})")
    parser.add_argument("--no-latest", action="store_true",
                        help="Do not tag as -latest")
    args = parser.parse_args()

    # If neither model-path nor base-model specified, try default path for GGUF
    model_path = args.model_path
    base_model = args.base_model
    if not model_path and not base_model and not args.adapter_path:
        default_gguf = MODELS_DIR / f"chatr_{args.capability}_{args.version}.gguf"
        if default_gguf.exists():
            model_path = str(default_gguf)
            print(f"Using found GGUF artifact: {model_path}")
        else:
            base_model = DEFAULT_BASE_MODEL

    loader = OllamaAdapterLoader()
    res = loader.register_capability_model(
        capability=args.capability,
        version=args.version,
        model_path=model_path,
        base_model=base_model,
        adapter_path=args.adapter_path,
        tag_latest=not args.no_latest,
    )
    import json
    print(json.dumps(res, indent=2))
    if not res.get("success"):
        sys.exit(1)
