#!/usr/bin/env python3
"""
CHATR VIRTUAL CREATOR — VIDEO JOB CONTROLLER (TIER 1 DIRECTOR)
scripts/chatr_creator/chatr_video_job_controller.py

Coordinates:
1. Performance Contract Prompt Compilation
2. Free Online Voice Synthesis (edge-tts)
3. GPU Worker Dispatch (Wan 2.1 I2V-14B 480P + MuseTalk 1.5)
4. FFmpeg Master Normalization
5. 15-Gate Deep Media Validator Execution
"""

import os
import sys
import json
import time
import uuid
import asyncio
import argparse
import subprocess
from typing import Dict, Any, Optional

try:
    import requests
except ImportError:
    requests = None

try:
    import edge_tts
except ImportError:
    edge_tts = None

try:
    import imageio_ffmpeg
    FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_EXE = "ffmpeg"


class ChatrVideoJobController:
    def __init__(self, worker_url: str = "http://localhost:8000"):
        self.worker_url = worker_url.rstrip("/")

    async def generate_speech_audio(self, text: str, voice: str, output_path: str) -> bool:
        """Synthesizes free online voice audio using edge-tts."""
        if not edge_tts:
            print("❌ edge_tts library not available")
            return False
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)
        return os.path.exists(output_path) and os.path.getsize(output_path) > 0

    def compile_performance_spec(self, creator_dna: Dict[str, Any], prompt: str, dialogue: Optional[str] = None) -> Dict[str, Any]:
        """Translates raw prompt into motion-aware performance specification."""
        return {
            "creator_id": creator_dna.get("id", "meera"),
            "handle": creator_dna.get("handle", "@meera_wtf"),
            "anchor_image": creator_dna.get("master_image", "public/characters/meera/master_face.jpg"),
            "prompt": prompt,
            "negative_prompt": "static image, talking photograph, 2d cartoon, cutout, slideshow, warped face, extra fingers",
            "dialogue": dialogue,
            "voice": creator_dna.get("voice", "hi-IN-SwaraNeural"),
            "resolution": {"width": 480, "height": 832}, # 480P Portrait for Wan I2V-14B
            "fps": 24,
            "duration_sec": 8
        }

    def run_worker_i2v(self, job_spec: Dict[str, Any], output_video_path: str) -> bool:
        """Sends job to Colab/Kaggle GPU worker running Wan 2.1 I2V-14B."""
        if not requests:
            print("❌ requests library missing")
            return False

        try:
            # 1. Health check
            h = requests.get(f"{self.worker_url}/health", timeout=5).json()
            print(f"📡 Worker Connected: {h.get('gpuName', 'GPU')} ({h.get('vramFreeGb', 0)}GB free)")
        except Exception as e:
            print(f"⚠️ Worker offline at {self.worker_url}: {e}")
            return False

        # 2. Base64 reference image
        import base64
        with open(job_spec["anchor_image"], "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode("utf-8")

        job_id = f"job_{uuid.uuid4().hex[:8]}"
        payload = {
            "job_id": job_id,
            "image_b64": img_b64,
            "prompt": job_spec["prompt"],
            "negative_prompt": job_spec["negative_prompt"],
            "duration_sec": job_spec["duration_sec"],
            "fps": job_spec["fps"],
            "width": job_spec["resolution"]["width"],
            "height": job_spec["resolution"]["height"]
        }

        # 3. Submit
        resp = requests.post(f"{self.worker_url}/generate-i2v", json=payload, timeout=30)
        if resp.status_code != 200:
            print(f"❌ Failed to submit I2V job: {resp.text}")
            return False

        # 4. Poll
        status_url = f"{self.worker_url}/job-status/{job_id}"
        download_url = f"{self.worker_url}/download/{job_id}"
        start_t = time.time()
        while time.time() - start_t < 600:
            st = requests.get(status_url, timeout=10).json()
            state = st.get("state")
            pct = st.get("progress_percent", 0)
            print(f"  [{time.strftime('%H:%M:%S')}] GPU State: {state} ({pct}%)")

            if state == "COMPLETED":
                os.makedirs(os.path.dirname(output_video_path), exist_ok=True)
                dl = requests.get(download_url, stream=True, timeout=60)
                with open(output_video_path, "wb") as f:
                    for chunk in dl.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"✅ Downloaded GPU video to: {output_video_path}")
                return True
            elif state == "FAILED":
                print(f"❌ Worker job failed: {st.get('error')}")
                return False
            time.sleep(5)

        return False

    def validate_artifact(self, video_path: str, require_audio: bool = False) -> Dict[str, Any]:
        """Runs the 15-Gate automated validator."""
        validator_script = os.path.join("scripts", "ai_training", "media", "validate_video.py")
        cmd = [sys.executable, validator_script, "--video", video_path]
        if require_audio:
            cmd.append("--require-audio")

        res = subprocess.run(cmd, capture_output=True, text=True)
        try:
            return json.loads(res.stdout)
        except Exception:
            return {"valid": False, "status": "VALIDATOR_ERROR", "output": res.stdout, "stderr": res.stderr}


def main():
    parser = argparse.ArgumentParser(description="CHATR Video Job Controller")
    parser.add_argument("--prompt", required=True, help="Performance prompt")
    parser.add_argument("--dialogue", help="Optional speech dialogue")
    parser.add_argument("--anchor", default="public/characters/meera/master_face.jpg", help="Reference image path")
    parser.add_argument("--output", default="data/worker_scratch/output_master.mp4", help="Output MP4 path")
    parser.add_argument("--worker-url", default="http://localhost:8000", help="Colab/Kaggle worker URL")

    args = parser.parse_args()

    controller = ChatrVideoJobController(worker_url=args.worker_url)
    dna = {
        "id": "meera",
        "handle": "@meera_wtf",
        "master_image": args.anchor,
        "voice": "hi-IN-SwaraNeural"
    }

    spec = controller.compile_performance_spec(dna, args.prompt, args.dialogue)
    print("📋 Compiled Performance Spec:", json.dumps(spec, indent=2))


if __name__ == "__main__":
    main()
