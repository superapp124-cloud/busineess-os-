#!/usr/bin/env python3
import os
import sys
import json
import time
import urllib.request
import urllib.error
import subprocess

def poll_and_verify(worker_url: str, job_id: str):
    worker_url = worker_url.rstrip('/')
    print('=' * 70, flush=True)
    print(f'⏳ CONTINUOUS GPU POLLER & VALIDATOR FOR JOB: {job_id}', flush=True)
    print(f'   Worker URL: {worker_url}', flush=True)
    print('=' * 70, flush=True)

    status_url = f'{worker_url}/job-status/{job_id}'
    download_url = f'{worker_url}/download/{job_id}'
    manifest_url = f'{worker_url}/manifest/{job_id}'

    os.makedirs('data/worker_scratch', exist_ok=True)
    out_mp4 = 'data/worker_scratch/wan_raw_output.mp4'
    out_manifest = 'data/worker_scratch/wan_manifest.json'

    start_time = time.time()
    last_state = ''

    while True:
        try:
            req = urllib.request.Request(status_url, headers={'User-Agent': 'chatr-director/1.0'})
            with urllib.request.urlopen(req, timeout=15) as res:
                st = json.loads(res.read().decode('utf-8'))
                state = st.get('state', 'UNKNOWN')
                pct = st.get('progress_percent', 0)
                elapsed = int(time.time() - start_time)

                if state != last_state or elapsed % 30 == 0:
                    print(f'[{time.strftime("%H:%M:%S")}] Elapsed: {elapsed//60}m {elapsed%60}s | GPU State: {state} ({pct}%)', flush=True)
                    last_state = state

                if state == 'COMPLETED':
                    print('\n' + '=' * 70, flush=True)
                    print(f'🎉 REAL WAN 2.1 I2V DIFFUSION COMPLETED in {elapsed//60}m {elapsed%60}s!', flush=True)
                    print('=' * 70, flush=True)

                    print(f'📥 Downloading raw MP4 from {download_url}...', flush=True)
                    urllib.request.urlretrieve(download_url, out_mp4)
                    print(f'✅ Video saved: {out_mp4} ({os.path.getsize(out_mp4)} bytes)', flush=True)

                    print(f'📥 Downloading execution manifest from {manifest_url}...', flush=True)
                    urllib.request.urlretrieve(manifest_url, out_manifest)
                    print(f'✅ Manifest saved: {out_manifest}', flush=True)

                    # Run proof harness
                    print('\n🧪 Executing wan_temporal_proof.py...', flush=True)
                    cmd_proof = [sys.executable, 'scripts/chatr_creator/wan_temporal_proof.py', '--video', out_mp4, '--manifest', out_manifest]
                    p_res = subprocess.run(cmd_proof, capture_output=True, text=True)
                    print(p_res.stdout, flush=True)
                    if p_res.stderr:
                        print(p_res.stderr, file=sys.stderr, flush=True)

                    # Run 15-gate validator
                    print('\n🛡️ Executing 15-Gate Deep Media Validator...', flush=True)
                    cmd_val = [sys.executable, 'scripts/ai_training/media/validate_video.py', '--video', out_mp4, '--profile', 'walking_480p']
                    v_res = subprocess.run(cmd_val, capture_output=True, text=True)
                    print(v_res.stdout, flush=True)

                    break

                elif state == 'FAILED':
                    err = st.get('error', 'Unknown error')
                    print(f'\n❌ Job FAILED on GPU Worker: {err}', flush=True)
                    sys.exit(1)

        except urllib.error.HTTPError as he:
            print(f'  [HTTP {he.code}] Retrying...', flush=True)
        except Exception as e:
            print(f'  [Network Warning: {e}] Retrying...', flush=True)

        time.sleep(10)

if __name__ == '__main__':
    job_id = sys.argv[1] if len(sys.argv) > 1 else 'meera_m1_wan_1788149458'
    url = sys.argv[2] if len(sys.argv) > 2 else 'https://contrary-binary-invisible-offers.trycloudflare.com'
    poll_and_verify(url, job_id)
