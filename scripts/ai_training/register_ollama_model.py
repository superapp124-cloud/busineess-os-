"""
DEPRECATED / ARCHIVED — Legacy v1 registration script.
HISTORICAL ARTIFACT FROM AUDIT:
This script originally registered vanilla phi3:mini models with system prompts
without applying any LoRA or trained weights updates.

DO NOT USE FOR CHATR v2 POST-TRAINING.
For real model deployment, use:
    scripts/ai_training/ollama_adapter_loader.py --model-path <path_to_gguf>
"""
import sys
import argparse

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def main():
    parser = argparse.ArgumentParser(description="Legacy Ollama registration script (DEPRECATED)")
    parser.add_argument("--legacy-mock-audit-only", action="store_true", help="Acknowledge legacy mock reproduction only")
    args = parser.parse_args()

    if not args.legacy_mock_audit_only:
        print("\n" + "=" * 70)
        print("  ❌ BLOCKED: register_ollama_model.py is DEPRECATED")
        print("=" * 70)
        print("  This legacy script creates vanilla phi3:mini wrappers without trained weights.")
        print("  Real CHATR post-training models MUST be deployed from real GGUF artifacts using:")
        print("    python scripts/ai_training/ollama_adapter_loader.py --model-path <path_to_gguf>")
        print("=" * 70 + "\n")
        sys.exit(1)

    print("[WARN] Running legacy registration in audit reproduction mode.")


if __name__ == "__main__":
    main()
