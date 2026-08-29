"""
CHATR Virtual Creator — Voice Pipeline
Generates natural Hinglish speech using edge-tts (free, local).
Produces WAV + timing metadata for Wav2Lip.

Voice: hi-IN-SwaraNeural (Meera's locked voice)
Fallback: en-IN-NeerjaNeural (English-heavy scripts)
"""

import asyncio
import json
import os
import re
import sys
from pathlib import Path
from typing import Optional


try:
    import edge_tts
except ImportError:
    print("ERROR: edge-tts not installed. Run: pip install edge-tts")
    sys.exit(1)


# Meera's locked voice identity
MEERA_VOICE = "hi-IN-SwaraNeural"
MEERA_VOICE_FALLBACK = "en-IN-NeerjaNeural"

# Voice settings for natural rhythm
VOICE_SETTINGS = {
    "hi-IN-SwaraNeural": {
        "rate": "+0%",      # natural pace
        "pitch": "+0Hz",
        "volume": "+0%"
    },
    "en-IN-NeerjaNeural": {
        "rate": "-5%",      # slightly slower for clarity
        "pitch": "+0Hz",
        "volume": "+0%"
    }
}


def detect_script_language(script: str) -> str:
    """Detect if script is primarily Hindi or English."""
    # Count Devanagari characters
    devanagari = sum(1 for c in script if '\u0900' <= c <= '\u097F')
    total_chars = len([c for c in script if c.strip()])

    if total_chars == 0:
        return "hi-IN-SwaraNeural"

    hindi_ratio = devanagari / total_chars
    return MEERA_VOICE if hindi_ratio > 0.15 else MEERA_VOICE_FALLBACK


def preprocess_script(script: str) -> str:
    """
    Make the script sound more natural for TTS.
    Add pauses, handle Hinglish, clean formatting.
    """
    # Replace em dashes with comma-pause
    script = script.replace("—", ", ")

    # Add pause after catchphrases
    catchphrase_patterns = [
        r"(Okay so listen)",
        r"(Be honest with me)",
        r"(Yaar sach mein\?)",
        r"(Matlab seriously\?)",
    ]
    for p in catchphrase_patterns:
        script = re.sub(p, r"\1...", script)

    # Normalize ellipsis
    script = re.sub(r'\.{3,}', '...', script)

    # Clean extra whitespace
    script = re.sub(r'\s+', ' ', script).strip()

    return script


async def generate_voice_async(
    script: str,
    output_path: str,
    voice_override: Optional[str] = None
) -> dict:
    """
    Generate voice audio from script using edge-tts.
    Returns timing metadata.
    """
    voice = voice_override or detect_script_language(script)
    settings = VOICE_SETTINGS.get(voice, VOICE_SETTINGS[MEERA_VOICE])
    processed_script = preprocess_script(script)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Word-level timing for lip sync
    word_timings = []

    communicate = edge_tts.Communicate(
        text=processed_script,
        voice=voice,
        rate=settings["rate"],
        pitch=settings["pitch"],
        volume=settings["volume"]
    )

    # Collect word boundaries for lip sync timing
    with open(output_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                word_timings.append({
                    "word": chunk["text"],
                    "offset_ms": chunk["offset"] // 10000,  # convert 100-ns to ms
                    "duration_ms": chunk["duration"] // 10000
                })

    # Check output
    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        raise RuntimeError(f"Voice generation failed — empty output at {output_path}")

    file_size = os.path.getsize(output_path)

    # Estimate duration from file size (MP3: ~128kbps average)
    estimated_duration_sec = file_size / (128 * 1024 / 8)

    metadata = {
        "voice": voice,
        "script_length_chars": len(processed_script),
        "word_count": len(processed_script.split()),
        "estimated_duration_sec": round(estimated_duration_sec, 2),
        "output_path": output_path,
        "file_size_bytes": file_size,
        "word_timings": word_timings[:50],  # store first 50 for lip sync
        "generation_success": True
    }

    return metadata


def generate_voice(
    script: str,
    output_path: str,
    voice_override: Optional[str] = None
) -> dict:
    """Synchronous wrapper."""
    return asyncio.run(generate_voice_async(script, output_path, voice_override))


def generate_captions_srt(word_timings: list, output_path: str) -> str:
    """Generate SRT caption file from word timings."""
    if not word_timings:
        # Fallback: generate single caption block
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("1\n00:00:00,000 --> 00:00:30,000\n[Meera]\n")
        return output_path

    srt_lines = []
    # Group words into caption chunks (max 8 words per caption)
    chunk_size = 8
    chunks = [word_timings[i:i + chunk_size] for i in range(0, len(word_timings), chunk_size)]

    for idx, chunk in enumerate(chunks):
        start_ms = chunk[0]['offset_ms']
        end_ms = chunk[-1]['offset_ms'] + chunk[-1]['duration_ms']
        text = ' '.join(w['word'] for w in chunk)

        def ms_to_srt(ms):
            h = ms // 3600000
            m = (ms % 3600000) // 60000
            s = (ms % 60000) // 1000
            ms_rem = ms % 1000
            return f"{h:02d}:{m:02d}:{s:02d},{ms_rem:03d}"

        srt_lines.append(f"{idx + 1}")
        srt_lines.append(f"{ms_to_srt(start_ms)} --> {ms_to_srt(end_ms)}")
        srt_lines.append(text)
        srt_lines.append("")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(srt_lines))

    return output_path


if __name__ == "__main__":
    # Quick test
    test_script = "Okay so listen— yaar sach mein, main ek cheez samajhna chahti hoon. This is genuinely insane to me. Be honest with me."
    output = "public/chatr/test_voice.mp3"

    print(f"Testing voice generation...")
    print(f"Script: {test_script[:60]}...")

    result = generate_voice(test_script, output)
    print("SUCCESS!")
    print(f"   Voice: {result['voice']}")
    print(f"   Duration: ~{result['estimated_duration_sec']}s")
    print(f"   File: {result['output_path']} ({result['file_size_bytes']} bytes)")
    print(f"   Words: {result['word_count']}")

    # Generate captions
    srt_path = output.replace('.mp3', '.srt')
    generate_captions_srt(result['word_timings'], srt_path)
    print(f"   Captions: {srt_path}")
