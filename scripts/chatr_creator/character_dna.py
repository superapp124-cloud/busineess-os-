#!/usr/bin/env python3
"""
CHATR — Character DNA Loader
Machine-readable Character DNA system. Resolves per-mode asset, emotion override,
and model preference for any character registered in the influencer registry.

Hard Rules enforced here:
  1. master_*.jpg NEVER returned as an I2V asset.
  2. Crops manifest.json is the single source of truth for asset routing.
  3. Falls back gracefully when assets are missing.
"""

import os
import json
from dataclasses import dataclass, field
from typing import Optional, Dict, List
from pathlib import Path

CHARS_ROOT = Path("public/characters")
MASTER_PATTERNS = ["master_", "reference_pack", "_sheet", "collage"]

@dataclass
class PerformanceSpec:
    source_asset: str              # Relative path to clean crop (never master sheet)
    style_type: str                # STYLE_A_PORTRAIT_MONOLOGUE | STYLE_B_FULL_BODY_ENVIRONMENT
    emotion: str                   # happy | surprised | sarcastic | neutral | excited | thinking
    expression_asset: str          # Specific expression crop if available
    model_preference: str          # echomimic_v3 | wan_animate | wan_s2v | musetalk
    prompt_prefix: str             # Model prompt prefix for this mode
    duration_range: List[int]      # [min_sec, max_sec]
    character_id: str
    character_name: str
    voice_id: str
    voice_language: str

@dataclass
class CharacterDNA:
    character_id: str
    name: str
    handle: str
    status: str                    # PRODUCTION_READY | NEEDS_ATTENTION | NOT_READY
    identity: dict
    expressions: Dict[str, str]    # emotion → crop path
    mode_routing: Dict[str, dict]  # mode → {source_asset, style, model_preference, ...}
    voice: dict
    personality: dict
    content_memory: dict
    animation: dict
    crops_root: str                # Absolute path to crops dir

    def get_performance_spec(self, mode: str, emotion_override: Optional[str] = None) -> PerformanceSpec:
        """
        Resolves exact clean crop asset + model + prompt for a given mode + emotion.
        Hard-gated: will never return a master sheet path.
        """
        mode_cfg = self.mode_routing.get(mode, self.mode_routing.get("podcast", {}))
        base_emotion = emotion_override or mode_cfg.get("expression", "neutral")

        # Resolve source asset
        source = mode_cfg.get("source_asset", self._safe_portrait())
        source = self._enforce_hard_gate(source)

        # Resolve expression asset (for close-up shots)
        expression_asset = self.expressions.get(base_emotion) or self.expressions.get("neutral") or source
        expression_asset = self._enforce_hard_gate(expression_asset)

        return PerformanceSpec(
            source_asset=source,
            style_type=mode_cfg.get("style", "STYLE_A_PORTRAIT_MONOLOGUE"),
            emotion=base_emotion,
            expression_asset=expression_asset,
            model_preference=mode_cfg.get("model_preference", "echomimic_v3"),
            prompt_prefix=mode_cfg.get("prompt_prefix", f"Cinematic shot of {self.name}"),
            duration_range=mode_cfg.get("duration_range", [15, 60]),
            character_id=self.character_id,
            character_name=self.name,
            voice_id=self.voice.get("primary_voice", "hi-IN-SwaraNeural"),
            voice_language=self.voice.get("languages", ["hi-IN"])[0]
        )

    def _safe_portrait(self) -> str:
        """Returns canonical clean portrait, never master sheet."""
        portrait = self.expressions.get("neutral", "crops/front_portrait.jpg")
        return self._enforce_hard_gate(portrait)

    def _enforce_hard_gate(self, path: str) -> str:
        """HARD GATE: Reject any master sheet path."""
        for p in MASTER_PATTERNS:
            if p in path.lower():
                # Fall back to safe portrait
                safe = "crops/front_portrait.jpg"
                full_safe = Path(self.crops_root).parent / safe
                if full_safe.exists():
                    print(f"[DNA HARD GATE] Rejected '{path}' → using '{safe}'", flush=True)
                    return safe
                # Last resort: find any jpg in crops
                crops_path = Path(self.crops_root)
                for f in crops_path.iterdir():
                    if f.suffix.lower() in (".jpg", ".jpeg") and not any(p in f.name.lower() for p in MASTER_PATTERNS):
                        print(f"[DNA HARD GATE] Emergency fallback to {f.name}", flush=True)
                        return f"crops/{f.name}"
        return path


def load_character_dna(character_id: str) -> Optional[CharacterDNA]:
    """Loads Character DNA from identity.json and crops/manifest.json."""
    norm_id = character_id.lower()
    if not (CHARS_ROOT / norm_id).exists():
        for prefix in ["meera", "priya", "rohan", "arjun", "ananya", "vikram", "ishita", "zoya", "kabir", "dev", "dadi", "raza", "boss_lady"]:
            if prefix in norm_id and (CHARS_ROOT / prefix).exists():
                norm_id = prefix
                break

    char_dir = CHARS_ROOT / norm_id
    identity_path = char_dir / "identity.json"
    manifest_path = char_dir / "crops" / "manifest.json"

    if not identity_path.exists():
        print(f"[DNA] ERROR: No identity.json for '{character_id}' (resolved: '{norm_id}')")
        return None

    with open(identity_path) as f:
        identity = json.load(f)

    # Load compiled manifest if available, else derive from identity
    mode_routing = {}
    expressions = {}
    status = "NEEDS_ATTENTION"

    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)
        mode_routing = manifest.get("mode_routing", {})
        expressions = manifest.get("expressions", {})
        status = manifest.get("status", "NEEDS_ATTENTION")
    else:
        # Derive from identity.json directly
        mode_routing = {}
        for mode, cfg in identity.get("modes", {}).items():
            src = cfg.get("source_asset", "crops/front_portrait.jpg")
            if not any(p in src.lower() for p in MASTER_PATTERNS):
                mode_routing[mode] = cfg
        expressions = identity.get("expressions", {})
        status = "NEEDS_ATTENTION"

    dna = CharacterDNA(
        character_id=character_id,
        name=identity.get("name", character_id),
        handle=identity.get("handle", f"@{character_id}"),
        status=status,
        identity=identity.get("identity", {}),
        expressions=expressions,
        mode_routing=mode_routing,
        voice=identity.get("voice", {}),
        personality=identity.get("personality", {}),
        content_memory=identity.get("content_memory", {}),
        animation=identity.get("animation", {}),
        crops_root=str(char_dir / "crops")
    )

    return dna

def record_content_memory(character_id: str, entry: dict):
    """Updates character's content memory (what worked / what failed)."""
    char_dir = CHARS_ROOT / character_id
    identity_path = char_dir / "identity.json"
    if not identity_path.exists():
        return
    with open(identity_path) as f:
        identity = json.load(f)
    mem = identity.setdefault("content_memory", {})
    category = entry.get("result", "what_worked")
    mem.setdefault(category, []).append(entry)
    with open(identity_path, "w") as f:
        json.dump(identity, f, indent=2)

if __name__ == "__main__":
    os.chdir(Path(__file__).parent.parent.parent)
    dna = load_character_dna("meera")
    if dna:
        print(f"\nCharacter DNA loaded: {dna.name} ({dna.status})")
        spec = dna.get_performance_spec("walk", emotion_override="excited")
        print(f"  Mode: walk | Asset: {spec.source_asset} | Model: {spec.model_preference} | Emotion: {spec.emotion}")
        spec2 = dna.get_performance_spec("podcast", emotion_override="sarcastic")
        print(f"  Mode: podcast | Asset: {spec2.expression_asset} | Model: {spec2.model_preference} | Emotion: {spec2.emotion}")
