import json

path = r'notebooks/meera_performance_worker.ipynb'
with open(path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Update Step 2 cleanup code
for cell in nb['cells']:
    if cell['cell_type'] == 'code' and any('Step 2' in line for line in cell['source']):
        cell['source'] = [
            '# Step 2: Clean Disk Space (Free up 40GB+) & Install Dependencies\n',
            'import os, shutil, glob\n',
            '!rm -rf /usr/local/share/boost /usr/share/dotnet /sample_data\n',
            '!rm -rf /usr/local/cuda-11* /usr/local/cuda-12.0* /usr/local/cuda-12.1*\n',
            '!rm -rf /usr/local/lib/python3.*/dist-packages/tensorflow* /usr/local/lib/python3.*/dist-packages/tensorboard*\n',
            '!apt-get clean -y && apt-get autoremove -y > /dev/null 2>&1\n',
            '!df -h /\n',
            '!pip install -q fastapi uvicorn pycloudflared diffusers transformers accelerate imageio[ffmpeg] torchvision hf_transfer\n',
            'os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"\n',
            'os.environ["HF_HUB_DISABLE_XET"] = "1"\n'
        ]
        print('✅ Enhanced Step 2 disk cleaner installed (frees 40GB+ in Colab)!')

with open(path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)
print('Notebook updated successfully.')
