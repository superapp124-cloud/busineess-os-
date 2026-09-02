#!/usr/bin/env python3
"""
CHATR — Character Asset & Style Resolver with Audio Multiplexer
1. Resolves Style A (Portrait/Monologue) vs Style B (Full-body/Street/Environment)
2. Hard-gates against master collage sheets (Strictly selects clean cropped photos)
3. Detects emotional sentiment from script (happy, sarcastic, surprised, thinking, neutral)
4. Merges generated Wan video with neural voice audio into a certified broadcast MP4
"""

import os
import sys
import re
import json
import shutil
import subprocess
from typing import Tuple, Optional

EMOTION_KEYWORDS = {
    "sarcastic": ["seriously", "matlab", "expert", "sure", "obviously", "acting", "claims", "hacks"],
    "surprised": ["cannot believe", "ready", "insane", "crazy", "shock", "so nahi", "literally what", "unbelievable"],
    "happy": ["love", "amazing", "best", "super", "favorite", "great", "spiritual", "supremacy", "party"],
    "thinking": ["why", "kya", "samajhna", "reason", "debate", "question", "wonder", "difference"],
    "excited": ["live", "breaking", "viral", "challenge", "dance", "drop", "energy", "let's go"]
}

def detect_script_emotion(script: str) -> str:
    """Classifies emotion from script text."""
    s_lower = script.lower()
    for emotion, words in EMOTION_KEYWORDS.items():
        if any(w in s_lower for w in words):
            return emotion
    return "neutral"

def resolve_character_asset(
    character_id: str = "meera_delhi",
    mode: str = "walk",
    script: str = ""
) -> Tuple[str, str, str]:
    """
    Resolves the exact cropped source asset based on creator mode and emotion.
    Returns: (asset_path, style_type, emotion)
    Hard Rule: Master collage sheets (master_face.jpg, etc.) are FORBIDDEN.
    """
    emotion = detect_script_emotion(script)
    crops_dir = "public/characters/meera/crops"

    # Style B — Full-Body & Environment Motion
    if mode.lower() in ("walk", "dance", "travel", "street", "fashion"):
        style_type = "STYLE_B_FULL_BODY_ENVIRONMENT"
        if mode.lower() == "walk":
            asset_file = "full_body_street.jpg"
        elif mode.lower() == "dance":
            asset_file = "vibe_dancing_fun.jpg"
        elif "market" in script.lower():
            asset_file = "lifestyle_market.jpg"
        elif "cafe" in script.lower():
            asset_file = "lifestyle_cafe.jpg"
        else:
            asset_file = "full_body_street.jpg"

    # Style A — Portrait & Expressive Monologue
    else:
        style_type = "STYLE_A_PORTRAIT_MONOLOGUE"
        if emotion in ("sarcastic", "sassy"):
            asset_file = "exp_sassy.jpg" if os.path.exists(os.path.join(crops_dir, "exp_sassy.jpg")) else "exp_sarcastic_v2.jpg"
        elif emotion == "surprised":
            asset_file = "exp_surprised_v2.jpg" if os.path.exists(os.path.join(crops_dir, "exp_surprised_v2.jpg")) else "creator_phone_shock.jpg"
        elif emotion in ("happy", "excited"):
            asset_file = "exp_excited_v2.jpg" if os.path.exists(os.path.join(crops_dir, "exp_excited_v2.jpg")) else "exp_happy_v2.jpg"
        elif emotion == "thinking":
            asset_file = "exp_thinking_v2.jpg" if os.path.exists(os.path.join(crops_dir, "exp_thinking_v2.jpg")) else "exp_confused_v2.jpg"
        else:
            asset_file = "front_portrait.jpg"

    resolved_path = os.path.join(crops_dir, asset_file)
    if not os.path.exists(resolved_path):
        resolved_path = os.path.join(crops_dir, "front_portrait.jpg")

    # Hard-Gate: Verify not master collage
    if "master" in resolved_path.lower():
        resolved_path = os.path.join(crops_dir, "front_portrait.jpg")

    return resolved_path, style_type, emotion

def merge_video_and_voice(
    video_path: str,
    audio_path: str,
    output_path: str,
    voice_volume: float = 1.0
) -> bool:
    """
    Multiplexes generated video and voice audio into broadcast MP4 with AAC audio.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-filter_complex", f"[1:a]volume={voice_volume}[aout]",
        "-map", "0:v:0",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "44100",
        "-shortest",
        "-movflags", "+faststart",
        output_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[MUX_ERROR] FFmpeg failed: {res.stderr}", file=sys.stderr)
        return False
    return True

if __name__ == "__main__":
    p, s, e = resolve_character_asset("meera_delhi", "walk", "Walking through Lajpat Nagar market live report.")
    print(f"Mode: walk | Style: {s} | Emotion: {e} | Asset: {p}")
    p2, s2, e2 = resolve_character_asset("meera_delhi", "podcast", "Okay I literally cannot believe this insane climax!")
    print(f"Mode: podcast | Style: {s2} | Emotion: {e2} | Asset: {p2}")
