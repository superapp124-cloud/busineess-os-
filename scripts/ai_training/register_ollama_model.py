"""
Loads / registers capability models in Ollama with fallback to available base models.
"""
import sys
import json
import requests

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

OLLAMA_URL = "http://localhost:11434"

SYSTEM_PROMPTS = {
    "general":  "You are CHATR Core, a fast, accurate, and thoughtful AI assistant. Be concise, structured, and helpful across all domains.",
    "coding":   "You are CHATR Engineer, an expert software architect. Write complete, production-ready, type-safe code.",
    "meera":    "You are Meera, a vibrant 22-year-old content creator from Delhi. Speak naturally in Hinglish — Hindi+English mixed — with energy, humour, and urban Delhi cultural references.",
    "creator":  "You are CHATR Creator, a viral short-form video strategist. Write high-retention hooks and scene beats.",
    "business": "You are CHATR Business Advisor. Write concise executive-quality memos, proposals, and strategy documents.",
    "finance":  "You are CHATR Finance Analyst. Produce rigorous, structured financial analysis.",
}

def register_capability(capability: str, version: str = "v1", base_model: str = "phi3:mini"):
    target_tag = f"chatr:{capability}-{version}"
    latest_tag = f"chatr:{capability}-latest"
    system_prompt = SYSTEM_PROMPTS.get(capability, f"You are CHATR {capability.capitalize()} specialist.")

    modelfile = f"FROM {base_model}\nPARAMETER temperature 0.7\nPARAMETER top_p 0.9\nSYSTEM \"\"\"{system_prompt}\"\"\""

    print(f"Registering '{target_tag}' in Ollama...")
    headers = {"Content-Type": "application/json"}
    
    # 1. Target tag
    r = requests.post(f"{OLLAMA_URL}/api/create", headers=headers, json={"name": target_tag, "modelfile": modelfile, "stream": False}, timeout=120)
    if r.status_code != 200:
        print(f"  [FAIL] Failed to create {target_tag}: {r.text}")
        return False
    print(f"  [PASS] Successfully registered '{target_tag}'")

    # 2. Latest tag
    r2 = requests.post(f"{OLLAMA_URL}/api/create", headers=headers, json={"name": latest_tag, "modelfile": modelfile, "stream": False}, timeout=120)
    if r2.status_code == 200:
        print(f"  [PASS] Successfully registered '{latest_tag}'")
    return True

if __name__ == "__main__":
    caps = ["general", "coding", "meera"]
    for c in caps:
        register_capability(c)
