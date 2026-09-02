#!/usr/bin/env python3
"""
CHATR — ZeroGPU Wan 2.2 I2V 14B Execution Connector
Connects directly to Hugging Face ZeroGPU (NVIDIA RTX Pro 6000 Blackwell 48GB/96GB)
via Gradio API to generate real AI video with zero local GPU constraints.
"""

import os
import sys
import time
import json
import shutil
import hashlib
import argparse
import subprocess
from gradio_client import Client, handle_file

DEFAULT_SPACE = "zerogpu-aoti/wan2-2-fp8da-aoti-faster"

def generate_zerogpu_video(
    image_path: str,
    prompt: str,
    space_id: str = DEFAULT_SPACE,
    steps: int = 6,
    duration_seconds: float = 4.0,
    seed: int = 42,
    output_dir: str = "data/worker_scratch",
    run_proof: bool = True
) -> dict:
    os.makedirs(output_dir, exist_ok=True)
    out_mp4 = os.path.join(output_dir, "zerogpu_wan_output.mp4")
    out_manifest = os.path.join(output_dir, "zerogpu_wan_manifest.json")

    print("=" * 70, flush=True)
    print("🚀 CHATR REAL VIDEO ENGINE: HUGGING FACE ZEROGPU CONNECTOR", flush=True)
    print(f"   Space: {space_id}", flush=True)
    print(f"   Hardware: NVIDIA RTX Pro 6000 Blackwell (48GB/96GB VRAM)", flush=True)
    print(f"   Model: Wan 2.2 I2V 14B (FP8 + Lightning LoRA)", flush=True)
    print("=" * 70, flush=True)

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Reference image not found: {image_path}")

    print(f"📡 Connecting to Gradio Client on Space: {space_id}...", flush=True)
    client = Client(space_id)
    print("✅ Connected to ZeroGPU Space successfully!", flush=True)

    print(f"\n🎬 Submitting Wan 2.2 14B I2V Generation Request:", flush=True)
    print(f"   Input Image: {image_path}", flush=True)
    print(f"   Prompt: {prompt}", flush=True)
    print(f"   Inference Steps: {steps}", flush=True)
    print(f"   Duration: {duration_seconds}s", flush=True)
    print(f"   Seed: {seed}", flush=True)

    start_time = time.time()
    print("\n⏳ Processing on ZeroGPU Blackwell GPU (Estimated: 20-60s)...", flush=True)

    try:
        result = client.predict(
            input_image=handle_file(image_path),
            prompt=prompt,
            steps=steps,
            duration_seconds=duration_seconds,
            guidance_scale=1.0,
            guidance_scale_2=1.0,
            seed=seed,
            randomize_seed=False,
            api_name="/generate_video"
        )
    except Exception as e:
        print(f"❌ ZeroGPU Generation failed: {e}", flush=True)
        return {"status": "FAILED", "error": str(e)}

    elapsed = time.time() - start_time
    print(f"\n🎉 ZeroGPU Generation COMPLETED in {elapsed:.2f}s!", flush=True)
    print(f"   Raw Result: {result}", flush=True)

    raw_video_path = result[0]
    shutil.copy(raw_video_path, out_mp4)
    file_size = os.path.getsize(out_mp4)
    print(f"✅ Video saved to: {out_mp4} ({file_size} bytes)", flush=True)

    with open(out_mp4, "rb") as f:
        mp4_sha256 = hashlib.sha256(f.read()).hexdigest()

    manifest = {
        "MODEL_ID": "Wan-AI/Wan2.2-I2V-A14B-Diffusers",
        "MODEL_SOURCE": "huggingface_zerogpu",
        "SPACE_ID": space_id,
        "GPU_NAME": "NVIDIA RTX Pro 6000 Blackwell",
        "GPU_VRAM": "48GB/96GB",
        "QUANTIZATION": "FP8_AOTInductor",
        "SPEEDUP": "Lightning_LoRA",
        "STEPS": steps,
        "DURATION_SECONDS": duration_seconds,
        "SEED": seed,
        "GENERATION_TIME": round(elapsed, 2),
        "OUTPUT_SHA256": mp4_sha256,
        "OUTPUT_FILE": out_mp4,
        "GENERATION_PASSED": True
    }

    with open(out_manifest, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"✅ Manifest saved to: {out_manifest}", flush=True)

    if run_proof:
        print("\n🧪 Running Optical Flow & Temporal Proof Analysis...", flush=True)
        cmd_proof = [
            sys.executable,
            "scripts/chatr_creator/wan_temporal_proof.py",
            "--video", out_mp4,
            "--manifest", out_manifest
        ]
        res = subprocess.run(cmd_proof, capture_output=True, text=True)
        print(res.stdout, flush=True)
        if res.stderr:
            print(res.stderr, file=sys.stderr, flush=True)

    return manifest

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CHATR ZeroGPU Wan Generator")
    parser.add_argument("--image", default="public/characters/meera/master_face.jpg", help="Path to reference face image")
    parser.add_argument("--prompt", default="Indian young woman Meera walking and talking with natural facial expressions, Delhi office background, 9:16 vertical social video", help="Prompt")
    parser.add_argument("--space", default=DEFAULT_SPACE, help="Hugging Face Space ID")
    parser.add_argument("--steps", type=int, default=6, help="Inference steps")
    parser.add_argument("--duration", type=float, default=4.0, help="Duration in seconds")
    parser.add_argument("--seed", type=int, default=42, help="Seed")
    args = parser.parse_args()

    generate_zerogpu_video(
        image_path=args.image,
        prompt=args.prompt,
        space_id=args.space,
        steps=args.steps,
        duration_seconds=args.duration,
        seed=args.seed
    )
