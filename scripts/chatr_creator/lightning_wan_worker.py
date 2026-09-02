#!/usr/bin/env python3
"""
CHATR — Lightning AI GPU Worker (Wan 2.1 I2V-14B)
Optimized for Lightning AI Studios with A100 80GB / L4 24GB free credit allocations.
"""

import os
import sys
import time
import json
import torch
import hashlib
from typing import Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="CHATR Lightning AI Worker", version="2.0")
job_states = {}
os.makedirs("chatr_jobs", exist_ok=True)

# Load Wan 2.1 I2V-14B
print("⚡ Initializing Lightning AI GPU Backend...")
from diffusers import WanImageToVideoPipeline
from diffusers.utils import export_to_video, load_image

device = "cuda" if torch.cuda.is_available() else "cpu"
pipe = None

try:
    print("📥 Loading Wan-AI/Wan2.1-I2V-14B-480P-Diffusers...")
    pipe = WanImageToVideoPipeline.from_pretrained(
        "Wan-AI/Wan2.1-I2V-14B-480P-Diffusers",
        torch_dtype=torch.bfloat16
    )
    # If 80GB VRAM (A100), load entire model directly to GPU without CPU offload for 45s generation!
    vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3) if torch.cuda.is_available() else 0.0
    if vram_gb >= 40.0:
        print(f"🚀 High VRAM detected ({vram_gb:.1f}GB) — Moving pipeline directly to CUDA for maximum throughput!")
        pipe.to("cuda")
    else:
        print(f"⚡ Standard VRAM detected ({vram_gb:.1f}GB) — Enabling model CPU offloading...")
        pipe.enable_model_cpu_offload()
    print("✅ Pipeline loaded successfully!")
except Exception as e:
    print(f"⚠️ Deferred pipeline load: {e}")

class I2VRequest(BaseModel):
    job_id: str
    image_base64: Optional[str] = None
    prompt: str
    negative_prompt: Optional[str] = None
    num_frames: int = 192
    fps: int = 24
    guidance_scale: float = 5.0
    num_inference_steps: int = 50
    seed: int = 42

@app.get("/health")
def health():
    vram = torch.cuda.get_device_properties(0).total_memory / (1024**3) if torch.cuda.is_available() else 0.0
    return {
        "status": "ONLINE",
        "provider": "lightning",
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "vram_total_gb": round(vram, 2),
        "wan_loaded": pipe is not None,
        "job_active": any(s.get("state") == "VIDEO_MOTION_GENERATING" for s in job_states.values())
    }

@app.post("/generate-i2v")
def generate_i2v(req: I2VRequest, bt: BackgroundTasks):
    job_states[req.job_id] = {"state": "QUEUED", "progress_percent": 0}
    bt.add_task(run_inference, req)
    return {"job_id": req.job_id, "state": "QUEUED"}

@app.get("/job-status/{job_id}")
def get_status(job_id: str):
    if job_id not in job_states:
        raise HTTPException(404, "Job not found")
    return {"job_id": job_id, **job_states[job_id]}

@app.get("/download/{job_id}")
def download_video(job_id: str):
    p = f"chatr_jobs/{job_id}.mp4"
    if not os.path.exists(p):
        raise HTTPException(404, "Video not ready")
    return FileResponse(p, media_type="video/mp4", filename=f"{job_id}.mp4")

@app.get("/manifest/{job_id}")
def download_manifest(job_id: str):
    p = f"chatr_jobs/{job_id}_manifest.json"
    if not os.path.exists(p):
        raise HTTPException(404, "Manifest not ready")
    return FileResponse(p, media_type="application/json")

def run_inference(req: I2VRequest):
    try:
        job_states[req.job_id] = {"state": "VIDEO_MOTION_GENERATING", "progress_percent": 10}
        ref_path = f"chatr_jobs/{req.job_id}_ref.jpg"
        if req.image_base64:
            import base64
            with open(ref_path, "wb") as f:
                f.write(base64.b64decode(req.image_base64))

        image = load_image(ref_path)
        generator = torch.Generator(device="cuda").manual_seed(req.seed)
        t0 = time.time()
        out = pipe(
            image=image,
            prompt=req.prompt,
            negative_prompt=req.negative_prompt,
            num_frames=req.num_frames,
            height=832,
            width=480,
            guidance_scale=req.guidance_scale,
            num_inference_steps=req.num_inference_steps,
            generator=generator
        )
        elapsed = time.time() - t0
        out_mp4 = f"chatr_jobs/{req.job_id}.mp4"
        export_to_video(out.frames[0], out_mp4, fps=req.fps)

        with open(out_mp4, "rb") as f:
            sha = hashlib.sha256(f.read()).hexdigest()

        manifest = {
            "MODEL_ID": "Wan-AI/Wan2.1-I2V-14B-480P",
            "MODEL_SOURCE": "lightning_ai",
            "GPU_NAME": torch.cuda.get_device_name(0),
            "GPU_VRAM": f"{round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 1)}GB",
            "STEPS": req.num_inference_steps,
            "NUM_FRAMES": req.num_frames,
            "FPS": req.fps,
            "DURATION": round(req.num_frames / req.fps, 2),
            "GENERATION_TIME": round(elapsed, 2),
            "OUTPUT_SHA256": sha,
            "GENERATION_PASSED": True
        }
        with open(f"chatr_jobs/{req.job_id}_manifest.json", "w") as f:
            json.dump(manifest, f, indent=2)

        job_states[req.job_id] = {"state": "COMPLETED", "progress_percent": 100}
    except Exception as e:
        job_states[req.job_id] = {"state": "FAILED", "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
