"""
CHATR VIRTUAL CREATOR — MILESTONE 1 RUNNER
Target: Generate exactly ONE 8-second MP4:
MEERA — DELHI WALKING TEST

Input: public/characters/meera/master_fullbody.jpg
Output: public/outputs/meera/milestone-1/meera_delhi_walk_001.mp4
"""

import os
import sys
import json
import time
import argparse
import subprocess

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from video_generation_worker import health_check, submit_i2v_job, poll_and_download_result

M1_PROMPT = (
    "Meera, the exact woman from the master reference, walks toward a handheld smartphone camera "
    "on a busy Delhi street in late afternoon. She is already moving when the shot begins. "
    "Her hair moves naturally in the breeze. Her clothing moves with her walking motion. "
    "Background pedestrians continue moving naturally. She briefly looks into the camera, smiles, "
    "then looks toward something happening on the street. The camera operator walks backward naturally, "
    "creating subtle handheld movement. Photorealistic Indian creator Reel, authentic smartphone footage, "
    "natural skin texture, realistic human proportions, imperfect natural movement, shallow depth of field, "
    "documentary realism."
)

M1_NEGATIVE_PROMPT = (
    "static image, 2D animation, cutout, slideshow, morphing, blurry face, distorted hands, "
    "deformed limbs, robotic motion, CGI render, cartoon, oversaturated, watermark, text, captions"
)

def run_milestone_1(worker_url: str = None, reference_img: str = None, mock: bool = False):
    print("=" * 70)
    print("🎯 CHATR VIRTUAL CREATOR — MILESTONE 1: 8-SECOND MEERA DELHI WALKING TEST")
    print("=" * 70)

    output_dir = "public/outputs/meera/milestone-1"
    os.makedirs(output_dir, exist_ok=True)
    target_mp4 = os.path.join(output_dir, "meera_delhi_walk_001.mp4")
    meta_json = os.path.join(output_dir, "job_metadata.json")

    # Reference asset
    if not reference_img:
        reference_img = "public/characters/meera/master_fullbody.jpg"
        if not os.path.exists(reference_img):
            reference_img = "public/characters/meera/master_creator.jpg"
        if not os.path.exists(reference_img):
            reference_img = "public/characters/meera/master_face.jpg"

    print(f"📸 Reference Image: {reference_img} ({os.path.getsize(reference_img)} bytes)")
    print(f"🎬 Prompt: {M1_PROMPT[:90]}...")
    print(f"⏱️  Duration: 8.0s | Target: {target_mp4}")

    # Check worker connectivity
    worker_online = False
    if worker_url and not mock:
        health = health_check(worker_url)
        worker_online = health.get("online", False)
        if worker_online:
            print(f"⚡ Connected to GPU Worker: {health.get('gpu_name')} ({health.get('vram_total_gb')}GB VRAM)")

    if worker_online and not mock:
        job_id = f"meera_m1_walk_{int(time.time())}"
        print(f"📡 Submitting job {job_id} to {worker_url}...")
        submit_res = submit_i2v_job(
            worker_url=worker_url,
            job_id=job_id,
            reference_image_path=reference_img,
            performance_prompt=M1_PROMPT,
            negative_prompt=M1_NEGATIVE_PROMPT,
            duration_sec=8,
            fps=16,
            width=480,
            height=854,
            seed=42
        )
        print(f"Job queued on worker: {submit_res}")

        # Poll and download
        poll_and_download_result(worker_url, job_id, target_mp4)

        metadata = {
            "milestone": "M1_WALK",
            "jobId": job_id,
            "backend": "COLAB_T4_WAN2.1",
            "workerUrl": worker_url,
            "targetMp4": target_mp4,
            "durationSec": 8,
            "state": "VIDEO_MOTION_HUMAN_REVIEW_REQUIRED",
            "humanDecision": None,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    else:
        print("⚠️  Worker offline or mock requested.")
        print("   Generating local baseline reference clip for contract/UI testing...")
        # Create an 8-second MP4 from reference asset using ffmpeg
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1",
            "-i", reference_img,
            "-c:v", "libx264",
            "-t", "8",
            "-pix_fmt", "yuv420p",
            "-r", "16",
            "-vf", "scale=480:854:force_original_aspect_ratio=decrease,pad=480:854:(ow-iw)/2:(oh-ih)/2",
            target_mp4
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"✅ Baseline reference MP4 generated at: {target_mp4}")

        metadata = {
            "milestone": "M1_WALK",
            "jobId": f"meera_m1_local_{int(time.time())}",
            "backend": "LOCAL_MOCK_AWAITING_GPU_WORKER",
            "workerUrl": worker_url or "NOT_CONNECTED",
            "targetMp4": target_mp4,
            "durationSec": 8,
            "state": "VIDEO_MOTION_AWAITING_WORKER",
            "humanDecision": None,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    with open(meta_json, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"📄 Metadata written to: {meta_json}")
    print("=" * 70)
    print("🏁 MILESTONE 1 RUN COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--worker-url", type=str, default=None, help="Cloudflare tunnel URL of Colab worker")
    parser.add_argument("--ref", type=str, default=None, help="Path to reference image")
    parser.add_argument("--mock", action="store_true", help="Generate local mock MP4 for testing")
    args = parser.parse_args()

    run_milestone_1(worker_url=args.worker_url, reference_img=args.ref, mock=args.mock)
