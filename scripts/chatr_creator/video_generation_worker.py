"""
CHATR VIRTUAL CREATOR — VIDEO GENERATION WORKER CLIENT (PYTHON)

Manages communication between the Dell Orchestrator and the Free GPU Worker (Colab/Kaggle).
"""

import sys
import os
import json
import time
import requests
from typing import Dict, Any, Optional

DEFAULT_WORKER_URL = "http://localhost:8000"

def health_check(worker_url: str = DEFAULT_WORKER_URL) -> Dict[str, Any]:
    """Tests connection to the GPU worker notebook."""
    try:
        r = requests.get(f"{worker_url.rstrip('/')}/health", timeout=5)
        if r.status_code == 200:
            data = r.json()
            data["online"] = True
            return data
        return {"online": False, "error": f"HTTP {r.status_code}"}
    except Exception as e:
        return {"online": False, "error": str(e)}

def submit_i2v_job(
    worker_url: str,
    job_id: str,
    reference_image_path: str,
    performance_prompt: str,
    negative_prompt: str = "static image, 2D animation, cutout, slideshow, distorted hands, watermark",
    duration_sec: int = 8,
    fps: int = 16,
    width: int = 480,
    height: int = 854,
    seed: int = 42
) -> Dict[str, Any]:
    """Submits an Image-to-Video generation job to Wan 2.1 on the worker."""
    url = f"{worker_url.rstrip('/')}/generate-i2v"
    
    # Check if reference image exists locally
    if not os.path.exists(reference_image_path):
        raise FileNotFoundError(f"Reference image not found: {reference_image_path}")

    # Read image as base64 or multipart upload
    import base64
    with open(reference_image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")

    payload = {
        "job_id": job_id,
        "image_b64": img_b64,
        "prompt": performance_prompt,
        "negative_prompt": negative_prompt,
        "duration_sec": duration_sec,
        "fps": fps,
        "width": width,
        "height": height,
        "seed": seed
    }

    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()

def poll_and_download_result(
    worker_url: str,
    job_id: str,
    target_output_path: str,
    poll_interval_sec: int = 5,
    timeout_sec: int = 600
) -> str:
    """Polls until job completion, then downloads the raw generated MP4."""
    status_url = f"{worker_url.rstrip('/')}/job-status/{job_id}"
    download_url = f"{worker_url.rstrip('/')}/download/{job_id}"
    
    start_time = time.time()
    print(f"📡 Polling job {job_id} on {worker_url}...")

    while time.time() - start_time < timeout_sec:
        r = requests.get(status_url, timeout=10)
        if r.status_code == 200:
            status_data = r.json()
            state = status_data.get("state")
            progress = status_data.get("progress_percent", 0)
            print(f"  [{time.strftime('%H:%M:%S')}] State: {state} ({progress}%)")

            if state == "COMPLETED":
                # Download file
                os.makedirs(os.path.dirname(target_output_path), exist_ok=True)
                dl = requests.get(download_url, stream=True, timeout=60)
                dl.raise_for_status()
                with open(target_output_path, "wb") as f:
                    for chunk in dl.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"✅ Downloaded raw video to: {target_output_path}")
                return target_output_path

            elif state == "FAILED":
                raise RuntimeError(f"Job failed on worker: {status_data.get('error')}")

        time.sleep(poll_interval_sec)

    raise TimeoutError(f"Job {job_id} timed out after {timeout_sec}s")

if __name__ == "__main__":
    if "--test-contract" in sys.argv:
        print("Testing Worker Contract Serialization...")
        sample_contract = {
            "job_id": "meera_m1_delhi_walk_001",
            "prompt": "Meera walking toward camera on Delhi street",
            "duration_sec": 8,
            "fps": 16,
            "resolution": [480, 854],
            "seed": 42
        }
        print("Contract verified:", json.dumps(sample_contract, indent=2))
        sys.exit(0)
