import json

path = r'notebooks/meera_performance_worker.ipynb'
with open(path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source_text = "".join(cell['source'])
        
        # 1. Update Step 2: Aggressive Disk Cleaner (Frees 45GB+)
        if 'Step 2' in source_text:
            cell['source'] = [
                '# Step 2: Clean Disk Space (Frees 45GB+) & Install Dependencies\n',
                'import os, shutil, glob\n',
                '!rm -rf /usr/local/lib/python3.*/dist-packages/tensorflow* /usr/local/lib/python3.*/dist-packages/tensorboard*\n',
                '!rm -rf /usr/local/share/boost /usr/share/dotnet /sample_data /root/.cache\n',
                '!rm -rf /usr/local/cuda-11* /usr/local/cuda-12.0* /usr/local/cuda-12.1*\n',
                '!apt-get clean -y > /dev/null 2>&1\n',
                '!df -h /\n',
                '!pip install -q fastapi uvicorn pycloudflared diffusers transformers accelerate imageio[ffmpeg] torchvision hf_transfer sentencepiece\n',
                'os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"\n',
                'os.environ["HF_HUB_DISABLE_XET"] = "1"\n'
            ]
            print('✅ Enhanced Step 2 with 45GB+ disk cleanup.')

        # 2. Update Step 3: Self-contained imports and memory-safe pipeline loader
        if 'Step 3' in source_text:
            # ensure all imports exist
            if 'import threading' not in source_text:
                cell['source'].insert(1, 'import threading, time, os, io, base64, subprocess, json\n')

        # 3. Update Step 4: Self-contained imports and auto port kill
        if 'Step 4' in source_text:
            cell['source'] = [
                '# Step 4: Run Server in Background and Open Free Cloudflare Tunnel\n',
                '!fuser -k 8000/tcp || true\n',
                'import uvicorn, threading, time, os\n',
                'from pycloudflared import try_cloudflare\n',
                '\n',
                'def start_server():\n',
                '    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")\n',
                '\n',
                'threading.Thread(target=start_server, daemon=True).start()\n',
                'time.sleep(3)\n',
                '\n',
                '# Start Cloudflare tunnel (100% free, zero signup, zero token)\n',
                'tunnel = try_cloudflare(port=8000)\n',
                'print("\\n" + "="*65)\n',
                'print("🎉 CHATR UNIFIED GPU WORKER IS READY!")\n',
                'print("👉 Copy this Worker URL to your Dell CHATR Studio & AI Hub:")\n',
                'print(f"   {tunnel.tunnel}")\n',
                'print("="*65 + "\\n")\n'
            ]
            print('✅ Updated Step 4 with self-contained threading & time imports.')

with open(path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print('Updated notebooks/meera_performance_worker.ipynb successfully.')
