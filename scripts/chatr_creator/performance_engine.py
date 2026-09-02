#!/usr/bin/env python3
"""
CHATR — Performance Engine (Job Type Classifier)
Takes a PerformanceSpec + ProductionJob and routes to the correct AI model:

  TALKING_HEAD   → EchoMimicV3 Flash (12GB VRAM, T4-class)
                 → MuseTalk 1.5 fallback (8GB VRAM)
  FULL_BODY_WALK → Wan Animate 2.2 (24GB VRAM)
  AUDIO_DRIVEN   → Wan S2V-14B (24GB VRAM, audio-driven)
  DANCE          → Wan Animate 2.2 + driving pose video
  SINGING        → Wan S2V + audio/pose
  FULL_SCENE_I2V → Wan 2.2 I2V-A14B (48GB ZeroGPU)

GPU selection is handled transparently by Layer 1 GPU Orchestrator.
This engine only concerns itself with model routing and job graph generation.
"""

import os
import sys
import time
import json
import shutil
import hashlib
import subprocess
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Tuple
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from chatr_creator.character_dna import CharacterDNA, PerformanceSpec, load_character_dna

# ─────────────────────────────────────────────
# JOB TYPE DEFINITIONS
# ─────────────────────────────────────────────
JOB_TYPES = {
    "echomimic_v3": {
        "display": "EchoMimicV3 Flash (Talking-Body)",
        "vram_gb": 12,
        "max_sec": 120,
        "supports": ["podcast", "talk", "reaction", "sing", "vlog"],
        "hardware_tier": "T4"
    },
    "musetalk": {
        "display": "MuseTalk 1.5 (Lip-Sync)",
        "vram_gb": 8,
        "max_sec": 300,
        "supports": ["podcast", "talk", "react"],
        "hardware_tier": "T4"
    },
    "wan_animate": {
        "display": "Wan Animate 2.2 (Body Motion)",
        "vram_gb": 24,
        "max_sec": 60,
        "supports": ["walk", "dance", "street", "full_body"],
        "hardware_tier": "L4"
    },
    "wan_s2v": {
        "display": "Wan S2V-14B (Audio-Driven Cinematic)",
        "vram_gb": 24,
        "max_sec": 60,
        "supports": ["sing", "audio_driven"],
        "hardware_tier": "L4"
    },
    "wan_i2v": {
        "display": "Wan 2.2 I2V-A14B (Full Scene I2V)",
        "vram_gb": 48,
        "max_sec": 30,
        "supports": ["scene", "general", "walk", "podcast"],
        "hardware_tier": "Blackwell_ZeroGPU"
    }
}

@dataclass
class ProductionJob:
    job_id: str
    character_id: str
    mode: str
    script: str
    voice_path: Optional[str] = None
    duration_sec: int = 30
    emotion: Optional[str] = None
    language: str = "hinglish"
    output_format: str = "9:16_reel"
    scene_index: int = 0
    total_scenes: int = 1

@dataclass
class PerformanceTrack:
    """One character's complete performance pipeline for a single scene."""
    character_id: str
    character_name: str
    scene_index: int
    source_asset: str         # Hard-gated clean crop
    style_type: str
    emotion: str
    model: str                # Actual model to use
    voice_path: str
    raw_video_out: str        # Where raw video goes before lip-sync
    lipsync_out: str          # Where lip-synced video goes
    final_out: str            # Final validated clip
    prompt: str
    duration_sec: int
    status: str = "PENDING"
    error: Optional[str] = None

@dataclass
class ProductionGraph:
    """Full multi-character multi-scene production graph."""
    job_id: str
    total_duration_sec: int
    scenes: List[List[PerformanceTrack]] = field(default_factory=list)
    final_output: str = ""
    status: str = "PENDING"


def classify_job_type(mode: str, style_type: str, has_audio: bool = True) -> str:
    """
    Determines which model to use based on mode and style.
    Returns model key from JOB_TYPES.
    """
    if mode in ("walk", "dance", "street"):
        return "wan_animate"
    if mode == "sing":
        return "wan_s2v" if has_audio else "echomimic_v3"
    if mode in ("podcast", "talk", "reaction", "vlog"):
        return "echomimic_v3"
    if style_type == "STYLE_B_FULL_BODY_ENVIRONMENT":
        return "wan_animate"
    # Default: EchoMimicV3 for portrait, Wan for full-body
    return "echomimic_v3"


def generate_scene_chunks(total_sec: int, chunk_size: int = 25) -> List[Tuple[int, int]]:
    """Splits a long video into overlapping scene chunks for generation."""
    chunks = []
    start = 0
    while start < total_sec:
        end = min(start + chunk_size, total_sec)
        chunks.append((start, end))
        start = end
    return chunks


def build_production_graph(
    job: ProductionJob,
    characters: List[CharacterDNA],
    voice_paths: Dict[str, str],
    scratch_dir: str = "data/worker_scratch"
) -> ProductionGraph:
    """
    Builds the full production graph for a multi-character, multi-scene job.
    """
    os.makedirs(scratch_dir, exist_ok=True)
    graph = ProductionGraph(
        job_id=job.job_id,
        total_duration_sec=job.duration_sec,
        final_output=f"public/chatr/live_generated/{job.job_id}_master.mp4"
    )

    # For single character, simple single-scene graph
    if len(characters) == 1 and job.duration_sec <= 30:
        char = characters[0]
        spec = char.get_performance_spec(job.mode, job.emotion)
        model = classify_job_type(job.mode, spec.style_type)

        prompt = f"{spec.prompt_prefix}, {job.script[:80]}, 9:16 vertical video, cinematic quality"
        raw_out = f"{scratch_dir}/{job.job_id}_scene00_raw.mp4"
        lipsync_out = f"{scratch_dir}/{job.job_id}_scene00_lipsync.mp4"
        final_out = f"{scratch_dir}/{job.job_id}_scene00_final.mp4"

        track = PerformanceTrack(
            character_id=char.character_id,
            character_name=char.name,
            scene_index=0,
            source_asset=spec.source_asset,
            style_type=spec.style_type,
            emotion=spec.emotion,
            model=model,
            voice_path=voice_paths.get(char.character_id, ""),
            raw_video_out=raw_out,
            lipsync_out=lipsync_out,
            final_out=final_out,
            prompt=prompt,
            duration_sec=job.duration_sec
        )
        graph.scenes = [[track]]
        return graph

    # Multi-character or long-form: chunk into scenes
    chunks = generate_scene_chunks(job.duration_sec)
    for i, (start, end) in enumerate(chunks):
        scene_tracks = []
        for char in characters:
            spec = char.get_performance_spec(job.mode, job.emotion)
            model = classify_job_type(job.mode, spec.style_type)
            scene_dur = end - start
            raw_out = f"{scratch_dir}/{job.job_id}_{char.character_id}_scene{i:02d}_raw.mp4"
            lipsync_out = f"{scratch_dir}/{job.job_id}_{char.character_id}_scene{i:02d}_lipsync.mp4"
            final_out = f"{scratch_dir}/{job.job_id}_{char.character_id}_scene{i:02d}_final.mp4"
            track = PerformanceTrack(
                character_id=char.character_id,
                character_name=char.name,
                scene_index=i,
                source_asset=spec.source_asset,
                style_type=spec.style_type,
                emotion=spec.emotion,
                model=model,
                voice_path=voice_paths.get(char.character_id, ""),
                raw_video_out=raw_out,
                lipsync_out=lipsync_out,
                final_out=final_out,
                prompt=f"{spec.prompt_prefix}, {job.script[i*40:(i+1)*40]}, 9:16 vertical video",
                duration_sec=scene_dur
            )
            scene_tracks.append(track)
        graph.scenes.append(scene_tracks)

    return graph


def execute_wan_i2v_scene(track: PerformanceTrack, zerogpu_client) -> str:
    """Executes a Wan I2V scene via the existing ZeroGPU client."""
    from chatr_creator.zerogpu_wan_client import generate_zerogpu_video
    manifest = generate_zerogpu_video(
        image_path=track.source_asset,
        prompt=track.prompt,
        steps=6,
        duration_seconds=min(track.duration_sec, 8.0),
        seed=42,
        run_proof=False
    )
    raw_video = manifest.get("OUTPUT_FILE", "data/worker_scratch/zerogpu_wan_output.mp4")
    shutil.copy(raw_video, track.raw_video_out)
    return track.raw_video_out


def report_graph_status(graph: ProductionGraph) -> dict:
    """Returns structured status of the production graph."""
    tracks = [t for scene in graph.scenes for t in scene]
    return {
        "job_id": graph.job_id,
        "total_duration_sec": graph.total_duration_sec,
        "total_scenes": len(graph.scenes),
        "total_tracks": len(tracks),
        "tracks": [
            {
                "character": t.character_name,
                "scene": t.scene_index,
                "model": JOB_TYPES.get(t.model, {}).get("display", t.model),
                "asset": os.path.basename(t.source_asset),
                "emotion": t.emotion,
                "style": t.style_type,
                "status": t.status
            }
            for t in tracks
        ],
        "final_output": graph.final_output,
        "status": graph.status
    }


if __name__ == "__main__":
    os.chdir(Path(__file__).parent.parent.parent)
    dna = load_character_dna("meera")
    if dna:
        job = ProductionJob(
            job_id="test_001",
            character_id="meera",
            mode="walk",
            script="Walking through Lajpat Nagar market live report. Momos are spiritually important.",
            duration_sec=30
        )
        graph = build_production_graph(job, [dna], {})
        status = report_graph_status(graph)
        print(json.dumps(status, indent=2))
