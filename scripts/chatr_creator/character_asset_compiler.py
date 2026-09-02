#!/usr/bin/env python3
"""
CHATR — Character Asset Compiler
Validates every character's crop directory, enforces hard-gate against master
reference sheets, builds a per-character crops/manifest.json, and outputs
a global registry of all production-ready characters.

Hard Rules:
  1. master_*.jpg / master_reference*.jpg MUST NEVER appear in I2V inputs.
  2. Every I2V-eligible image must be a single isolated person photo.
  3. Each character must have at minimum: portrait + full_body.
  4. manifest.json maps emotion/mode → exact clean crop path.
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Tuple

CHARS_ROOT = Path("public/characters")
MASTER_SHEET_PATTERNS = ["master_", "reference_pack", "collage", "_sheet"]

# Minimum required assets for a character to be PRODUCTION_READY
REQUIRED_ASSETS = {
    "portrait":  ["front_portrait", "face_crop", "portrait"],
    "full_body": ["full_body", "hero_", "standing"],
}

def is_master_sheet(filename: str) -> bool:
    """Returns True if this file looks like a master reference collage."""
    f = filename.lower()
    return any(p in f for p in MASTER_SHEET_PATTERNS)

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def scan_crops_dir(character_id: str) -> Tuple[dict, List[str]]:
    """
    Scans crops/ directory, enforces hard-gate, builds asset map.
    Returns (asset_map, errors).
    """
    crops_dir = CHARS_ROOT / character_id / "crops"
    errors = []
    asset_map = {
        "expressions": {},
        "modes": {},
        "full_body": [],
        "portraits": [],
        "lifestyle": [],
        "wardrobe": [],
        "all_eligible": []
    }

    if not crops_dir.exists():
        return asset_map, [f"crops/ directory missing for {character_id}"]

    for f in sorted(crops_dir.iterdir()):
        if f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue

        # ──── HARD GATE ────
        if is_master_sheet(f.name):
            errors.append(f"HARD_GATE_VIOLATION: {f.name} looks like a master sheet — blocked from I2V")
            continue

        fname = f.name.lower().replace(".jpg", "").replace(".jpeg", "").replace(".png", "")
        rel = f"crops/{f.name}"
        sha = sha256_file(f)

        # Classify the asset
        if fname.startswith("exp_"):
            emotion = fname[4:].replace("_v2", "").replace("_", " ")
            asset_map["expressions"][emotion] = rel
        elif "full_body" in fname or "hero_" in fname:
            asset_map["full_body"].append(rel)
        elif "front_portrait" in fname or "face_crop" in fname:
            asset_map["portraits"].insert(0, rel)  # front_portrait first
        elif "lifestyle_" in fname or "vibe_" in fname:
            asset_map["lifestyle"].append(rel)
        elif "look_" in fname:
            asset_map["wardrobe"].append(rel)

        # All non-master files are eligible for I2V
        asset_map["all_eligible"].append({
            "file": rel,
            "basename": f.name,
            "sha256": sha,
            "size_bytes": f.stat().st_size
        })

    # Check required minimum
    if not asset_map["portraits"]:
        errors.append("MISSING: No clean portrait found (need front_portrait.jpg)")
    if not asset_map["full_body"]:
        errors.append("MISSING: No full_body image found")

    return asset_map, errors

def build_mode_routing(character_id: str, asset_map: dict, identity: dict) -> dict:
    """
    Builds mode → exact asset path routing from identity.json + asset_map.
    """
    routing = {}
    identity_modes = identity.get("modes", {})

    for mode, cfg in identity_modes.items():
        src = cfg.get("source_asset", "")
        # Resolve relative to character directory
        full_path = CHARS_ROOT / character_id / src
        if full_path.exists() and not is_master_sheet(src):
            routing[mode] = {
                "source_asset": src,
                "style": cfg.get("style", "STYLE_A_PORTRAIT_MONOLOGUE"),
                "expression": cfg.get("expression", "neutral"),
                "model_preference": cfg.get("model_preference", "echomimic_v3"),
                "prompt_prefix": cfg.get("prompt_prefix", ""),
                "duration_range": cfg.get("duration_range", [15, 60])
            }
        else:
            # Fallback to portrait
            portrait = asset_map["portraits"][0] if asset_map["portraits"] else None
            if portrait:
                routing[mode] = {
                    "source_asset": portrait,
                    "style": "STYLE_A_PORTRAIT_MONOLOGUE",
                    "expression": cfg.get("expression", "neutral"),
                    "model_preference": "echomimic_v3",
                    "prompt_prefix": "",
                    "duration_range": [15, 60],
                    "WARNING": f"Source asset {src} missing — fell back to portrait"
                }

    return routing

def compile_character(character_id: str) -> dict:
    """Compiles a single character's full asset manifest."""
    char_dir = CHARS_ROOT / character_id
    identity_path = char_dir / "identity.json"
    manifest_path = char_dir / "crops" / "manifest.json"

    identity = {}
    if identity_path.exists():
        with open(identity_path) as f:
            identity = json.load(f)

    asset_map, errors = scan_crops_dir(character_id)
    mode_routing = build_mode_routing(character_id, asset_map, identity)

    # Determine production status
    status = "PRODUCTION_READY" if not errors else "NEEDS_ATTENTION"
    if not asset_map["portraits"] and not asset_map["full_body"]:
        status = "NOT_READY"

    manifest = {
        "character_id": character_id,
        "name": identity.get("name", character_id),
        "status": status,
        "total_eligible_assets": len(asset_map["all_eligible"]),
        "portraits": asset_map["portraits"],
        "full_body": asset_map["full_body"],
        "expressions": asset_map["expressions"],
        "lifestyle": asset_map["lifestyle"],
        "wardrobe": asset_map["wardrobe"],
        "mode_routing": mode_routing,
        "hard_gate_violations": [e for e in errors if "HARD_GATE" in e],
        "warnings": [e for e in errors if "MISSING" in e],
        "all_eligible": asset_map["all_eligible"]
    }

    # Write per-character manifest
    os.makedirs(char_dir / "crops", exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    return manifest

def run_compiler() -> dict:
    """Compiles all characters and outputs global summary."""
    if not CHARS_ROOT.exists():
        print(f"[COMPILER] ERROR: {CHARS_ROOT} not found")
        return {}

    global_registry = {}
    print(f"\n{'='*70}")
    print("CHATR CHARACTER ASSET COMPILER")
    print(f"{'='*70}\n")

    for char_dir in sorted(CHARS_ROOT.iterdir()):
        if not char_dir.is_dir() or char_dir.name == "__pycache__":
            continue
        if (char_dir / "crops").exists() or (char_dir / "identity.json").exists():
            print(f"[COMPILING] {char_dir.name}...")
            manifest = compile_character(char_dir.name)
            global_registry[char_dir.name] = {
                "name": manifest["name"],
                "status": manifest["status"],
                "total_assets": manifest["total_eligible_assets"],
                "hard_gate_violations": manifest["hard_gate_violations"],
                "warnings": manifest["warnings"],
                "modes_available": list(manifest["mode_routing"].keys())
            }
            status_icon = "✅" if manifest["status"] == "PRODUCTION_READY" else "⚠️"
            print(f"  {status_icon} {manifest['name']}: {manifest['status']} ({manifest['total_eligible_assets']} assets, {len(manifest['mode_routing'])} modes)")
            if manifest["hard_gate_violations"]:
                for v in manifest["hard_gate_violations"]:
                    print(f"  🔴 {v}")
            if manifest["warnings"]:
                for w in manifest["warnings"]:
                    print(f"  ⚠️  {w}")

    # Write global registry summary
    registry_out = CHARS_ROOT / "compiled_registry.json"
    with open(registry_out, "w") as f:
        json.dump(global_registry, f, indent=2)

    print(f"\n{'='*70}")
    ready = sum(1 for v in global_registry.values() if v["status"] == "PRODUCTION_READY")
    print(f"COMPILE COMPLETE: {ready}/{len(global_registry)} characters PRODUCTION_READY")
    print(f"Output: {registry_out}")
    print(f"{'='*70}\n")

    return global_registry

if __name__ == "__main__":
    os.chdir(Path(__file__).parent.parent.parent)  # project root
    run_compiler()
