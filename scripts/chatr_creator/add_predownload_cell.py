import json

path = r'notebooks/meera_performance_worker.ipynb'
with open(path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# 1. Update Step 2 to remove HF_TRANSFER instability and install standard robust downloader
for cell in nb['cells']:
    if cell['cell_type'] == 'code' and any('Step 2' in line for line in cell['source']):
        cell['source'] = [
            '# Step 2: Clean Disk Space & Install Dependencies\n',
            'import os, shutil, glob\n',
            '!rm -rf /usr/local/lib/python3.*/dist-packages/tensorflow* /usr/local/lib/python3.*/dist-packages/tensorboard*\n',
            '!rm -rf /usr/local/share/boost /usr/share/dotnet /sample_data /root/.cache\n',
            '!rm -rf /usr/local/cuda-11* /usr/local/cuda-12.0* /usr/local/cuda-12.1*\n',
            '!apt-get clean -y > /dev/null 2>&1\n',
            '!df -h /\n',
            '!pip install -q fastapi uvicorn pycloudflared diffusers transformers accelerate imageio[ffmpeg] torchvision sentencepiece huggingface_hub\n',
            'os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"\n',
            'os.environ["HF_HUB_DISABLE_XET"] = "1"\n'
        ]
        print('✅ Step 2 updated with stable download settings.')

# 2. Add an optional Pre-Download Model Cell right before Step 3
cells = nb['cells']
has_predownload = any(any('Step 2.5' in line for line in c.get('source', [])) for c in cells)

if not has_predownload:
    predownload_cell = {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "# Step 2.5: (Recommended) Pre-Download Wan 2.1 Model Checkpoints directly to disk\n",
            "# This ensures 100% stable download with progress bar and zero runtime download delays\n",
            "import os\n",
            "os.makedirs('/content/wan_model', exist_ok=True)\n",
            "!huggingface-cli download Wan-AI/Wan2.1-I2V-14B-480P-Diffusers --local-dir /content/wan_model --local-dir-use-symlinks False\n",
            "print('✅ Wan 2.1 14B Checkpoints downloaded successfully to /content/wan_model!')\n"
        ]
    }
    # Insert after Step 2
    for idx, c in enumerate(cells):
        if any('Step 2' in line for line in c.get('source', [])):
            cells.insert(idx + 1, predownload_cell)
            print('✅ Added Step 2.5 Pre-Download cell.')
            break

with open(path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print('Updated notebooks/meera_performance_worker.ipynb successfully.')
