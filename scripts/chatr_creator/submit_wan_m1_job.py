#!/usr/bin/env python3
import os
import sys
import json
import time
import base64
import argparse
import subprocess
import urllib.request
import urllib.error

def submit_and_prove_m1(worker_url: str):
    worker_url = worker_url.rstrip('/')
    print('=' * 70)
    print('🚀 CHATR MILESTONE 1: SUBMITTING REAL WAN 2.1 I2V-14B INFERENCE JOB')
    print(f'   Worker URL: {worker_url}')
    print('=' * 70)

    # 1. Health Check
    health_url = f'{worker_url}/health'
    try:
        req = urllib.request.Request(health_url, headers={'User-Agent': 'chatr-director/1.0'})
        with urllib.request.urlopen(req, timeout=15) as res:
            health = json.loads(res.read().decode('utf-8'))
            print(f'⚡ GPU Worker Connected: {health.get("gpu_name")} | VRAM: {health.get("vram_total_gb")}GB | Backend: {health.get("backend")}')
    except Exception as e:
        print(f'❌ Failed to reach GPU worker at {health_url}: {e}')
        sys.exit(1)

    # 2. Prepare Reference Image
    ref_image_path = 'public/characters/meera/master_face.jpg'
    if not os.path.exists(ref_image_path):
        ref_image_path = 'public/characters/meera/master_creator.jpg'
    if not os.path.exists(ref_image_path):
        print(f'❌ Reference image not found at {ref_image_path}')
        sys.exit(1)

    with open(ref_image_path, 'rb') as f:
        img_b64 = base64.b64encode(f.read()).decode('utf-8')

    job_id = f'meera_m1_wan_{int(time.time())}'
    payload = {
        'job_id': job_id,
        'image_b64': img_b64,
        'prompt': 'A highly realistic cinematic shot of Meera Kapoor, 23yo Delhi Indian female, walking toward handheld smartphone camera on a bustling Delhi street in late afternoon, natural hair breeze, authentic facial expression change, looking around, subtle warm smile, organic body motion, 9:16 vertical format',
        'negative_prompt': 'static image, 2d cartoon, cutout, slideshow, warped face, blurry, extra limbs, mannequin, CGI render',
        'duration_sec': 8,
        'fps': 24,
        'width': 480,
        'height': 832,
        'seed': 42
    }

    # 3. Submit Job
    submit_url = f'{worker_url}/generate-i2v'
    print(f'\n📡 Submitting Job {job_id} to Wan 2.1 I2V Pipeline...')
    req_data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(submit_url, data=req_data, headers={'Content-Type': 'application/json', 'User-Agent': 'chatr-director/1.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            sub_res = json.loads(res.read().decode('utf-8'))
            print(f'✅ Job Queued: {sub_res}')
    except Exception as e:
        print(f'❌ Failed to submit job: {e}')
        sys.exit(1)

    # 4. Poll for completion
    status_url = f'{worker_url}/job-status/{job_id}'
    download_url = f'{worker_url}/download/{job_id}'
    manifest_url = f'{worker_url}/manifest/{job_id}'

    os.makedirs('data/worker_scratch', exist_ok=True)
    out_mp4 = 'data/worker_scratch/wan_raw_output.mp4'
    out_manifest = 'data/worker_scratch/wan_manifest.json'

    print('\n⏳ Polling GPU Worker for Diffusion Execution...', flush=True)
    start_time = time.time()
    last_state = ''

    while time.time() - start_time < 7200:
        try:
            status_req = urllib.request.Request(status_url, headers={'User-Agent': 'chatr-director/1.0'})
            with urllib.request.urlopen(status_req, timeout=15) as res:
                st = json.loads(res.read().decode('utf-8'))
                state = st.get('state', 'UNKNOWN')
                pct = st.get('progress_percent', 0)
                
                if state != last_state or int(time.time() - start_time) % 20 == 0:
                    elapsed = int(time.time() - start_time)
                    print(f'  [{elapsed:3d}s] Worker State: {state} ({pct}%)', flush=True)
                    last_state = state

                if state == 'COMPLETED':
                    print(f'\n🎉 Wan 2.1 I2V Diffusion Inference COMPLETED in {time.time() - start_time:.1f}s!')
                    
                    print(f'📥 Downloading raw MP4 from {download_url}...')
                    urllib.request.urlretrieve(download_url, out_mp4)
                    print(f'✅ Saved raw video to {out_mp4} ({os.path.getsize(out_mp4)} bytes)')

                    print(f'📥 Downloading manifest from {manifest_url}...')
                    urllib.request.urlretrieve(manifest_url, out_manifest)
                    print(f'✅ Saved manifest to {out_manifest}')

                    break
                elif state == 'FAILED':
                    err = st.get('error', 'Unknown error')
                    print(f'\n❌ GPU Worker Job FAILED: {err}')
                    sys.exit(1)

        except urllib.error.HTTPError as he:
            if he.code == 404:
                print(f'  [Waiting for worker job init...] ({int(time.time() - start_time)}s)')
            else:
                print(f'  [HTTP Error {he.code}] Retrying...')
        except Exception as ex:
            print(f'  [Poll Warning: {ex}] Retrying...')

        time.sleep(6)
    else:
        print('\n❌ Job timed out after 15 minutes.')
        sys.exit(1)

    # 5. Run Temporal Proof Harness
    print('\n' + '=' * 70)
    print('🧪 RUNNING MILESTONE 1 TEMPORAL PROOF HARNESS')
    print('=' * 70)
    proof_cmd = [
        sys.executable,
        'scripts/chatr_creator/wan_temporal_proof.py',
        '--video', out_mp4,
        '--manifest', out_manifest
    ]
    res_proof = subprocess.run(proof_cmd, capture_output=True, text=True)
    print(res_proof.stdout)
    if res_proof.stderr:
        print(res_proof.stderr, file=sys.stderr)

    # 6. Run 15-Gate Validator
    print('\n' + '=' * 70)
    print('🛡️ RUNNING 15-GATE DEEP MEDIA VALIDATOR')
    print('=' * 70)
    val_cmd = [
        sys.executable,
        'scripts/ai_training/media/validate_video.py',
        '--video', out_mp4,
        '--profile', 'walking_480p'
    ]
    res_val = subprocess.run(val_cmd, capture_output=True, text=True)
    print(res_val.stdout)

    print('\n' + '=' * 70)
    print('🏁 MILESTONE 1 PROOF EXECUTION COMPLETE')
    print('=' * 70)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--worker-url', default='https://contrary-binary-invisible-offers.trycloudflare.com', help='Worker URL')
    args = parser.parse_args()
    submit_and_prove_m1(args.worker_url)
