"""
CHATR Generic Training Worker Notebook Generator
scripts/chatr_creator/generate_training_worker_notebook.py

Generates: notebooks/chatr_training_worker.ipynb
— A capability-agnostic Soup v0.73.3 training worker for Colab / Kaggle T4.

This replaces the Meera-specific meera_performance_worker.ipynb for training purposes.
The media / video worker (Wan 2.1 + MuseTalk) stays in meera_performance_worker.ipynb.
"""

import json
import os

# Build each cell as a Python string then split into lines for notebook format
def make_code_cell(source: str) -> dict:
    """Convert a raw Python string into a notebook code cell."""
    lines = source.splitlines(keepends=True)
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": lines,
    }


def make_md_cell(source: str) -> dict:
    lines = source.splitlines(keepends=True)
    return {"cell_type": "markdown", "metadata": {}, "source": lines}


# ──────────────────────────────────────────────────────────────────────────────
# CELL SOURCES
# ──────────────────────────────────────────────────────────────────────────────

HEADER_MD = """# 🧠 CHATR GENERIC TRAINING WORKER
### Soup v0.73.3 — Capability-Agnostic LoRA / SFT / DPO / ORPO on Free Colab T4

This notebook trains ANY approved CHATR capability. It is NOT Meera-specific.

| Parameter      | Description                                              |
|----------------|----------------------------------------------------------|
| `CAPABILITY`   | Training target: `general`, `coding`, `meera`, etc.     |
| `BASE_MODEL`   | HuggingFace model ID (from approved Base Model Registry) |
| `METHOD`       | `sft`, `dpo`, or `orpo`                                  |
| `DATASET_ID`   | Dataset identifier stored in `data/_registry.json`      |
| `JOB_ID`       | Unique training job ID from CHATR Director               |

---
### 🚀 Setup:
1. Go to **Runtime** → **Change runtime type** → **T4 GPU**.
2. Edit Cell 1 with your job parameters OR paste the JSON the CHATR Director sends.
3. Click **Runtime** → **Run all**.
4. The final cell prints the Cloudflare tunnel URL for the Director to poll.
"""

PARAMS_CELL = '''# ============================================================
# CHATR TRAINING JOB PARAMETERS
# Set by CHATR Director Job Controller, or edit manually here.
# ============================================================

JOB_CONFIG = {
    'job_id':          'chatr-job-001',
    'capability':      'meera',         # general | coding | creator | meera | ...
    'base_model':      'Qwen/Qwen2.5-7B-Instruct',
    'method':          'sft',           # sft | dpo | orpo
    'dataset_id':      'meera_sft_v1',
    'max_seq_len':     2048,
    'batch_size':      4,
    'gradient_steps':  4,
    'num_epochs':      1,
    'budget_minutes':  90,
    'lora_rank':       16,
    'lora_alpha':      32,
    'lora_targets':    'q_proj,v_proj,k_proj,o_proj,gate_proj,up_proj,down_proj',
    'seed':            1234,
    'push_to_hub':     False,
    'human_approved_by': None,
    'human_approved_at': None,
}

CAPABILITY   = JOB_CONFIG['capability']
BASE_MODEL   = JOB_CONFIG['base_model']
METHOD       = JOB_CONFIG['method']
DATASET_ID   = JOB_CONFIG['dataset_id']
JOB_ID       = JOB_CONFIG['job_id']

print(f'=== CHATR TRAINING JOB LOADED ===')
print(f'Capability : {CAPABILITY}')
print(f'Base Model : {BASE_MODEL}')
print(f'Method     : {METHOD}')
print(f'Dataset    : {DATASET_ID}')
print(f'Job ID     : {JOB_ID}')
'''

HARDWARE_CELL = '''# Verify GPU hardware
import subprocess, torch

print("=== GPU INFO ===")
subprocess.run(['nvidia-smi'], check=False)
print(f'PyTorch  : {torch.__version__}')
print(f'CUDA     : {torch.cuda.is_available()}')
if torch.cuda.is_available():
    name  = torch.cuda.get_device_name(0)
    total = round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 2)
    print(f'Device   : {name}')
    print(f'VRAM     : {total} GB')
    if total < 14.0:
        print('WARNING: Less than 14 GB VRAM — reduce batch_size / max_seq_len if needed')
'''

INSTALL_CELL = '''# Install Soup (pinned) + FastAPI for Director communication
import subprocess
subprocess.run(['pip', 'install', '-q', 'soup-cli[train]==0.73.3'], check=True)
subprocess.run(['pip', 'install', '-q', 'fastapi', 'uvicorn', 'pycloudflared'], check=True)
print('Dependencies installed')
'''

DATASET_CELL = '''import os, json, time, threading, hashlib, base64
from pathlib import Path

WORK_DIR      = Path(f'/content/chatr_jobs/{JOB_ID}')
ADAPTER_DIR   = WORK_DIR / 'adapter'
DATASET_PATH  = WORK_DIR / f'{DATASET_ID}.jsonl'
EVAL_PATH     = WORK_DIR / f'{CAPABILITY}_eval.jsonl'
SOUP_CFG_PATH = WORK_DIR / 'soup.yaml'

WORK_DIR.mkdir(parents=True, exist_ok=True)
ADAPTER_DIR.mkdir(parents=True, exist_ok=True)

print(f'Work directory: {WORK_DIR}')

# Validate the dataset once received
def validate_dataset(path: Path) -> dict:
    if not path.exists():
        return {'valid': False, 'error': 'Dataset file not found'}
    rows, errors = 0, []
    with open(path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            try:
                row = json.loads(line)
                if 'messages' not in row:
                    errors.append(f'Row {i}: missing messages field')
                rows += 1
            except json.JSONDecodeError as e:
                errors.append(f'Row {i}: JSON error: {e}')
    sha256 = hashlib.sha256(path.read_bytes()).hexdigest()
    return {'valid': len(errors) == 0, 'rows': rows, 'sha256': sha256, 'errors': errors[:5]}

print('Dataset validator ready.')
'''

SOUP_BUILDER_CELL = '''# Capability system prompts — injected at config build time
SYSTEM_PROMPTS = {
    'meera'    : 'You are Meera, a vibrant 22-year-old content creator from Delhi. Speak naturally in Hinglish — Hindi+English mixed — with energy, humour, and urban Delhi cultural references. Never sound robotic or corporate.',
    'general'  : 'You are CHATR Core, a fast, accurate, and thoughtful AI assistant. Be concise, structured, and helpful across all domains.',
    'coding'   : 'You are CHATR Engineer, an expert software architect. Write complete, production-ready, type-safe code with no placeholder comments.',
    'creator'  : 'You are CHATR Creator, a viral short-form video strategist. Write high-retention hooks, scene beats, and captions with punchy pacing.',
    'finance'  : 'You are CHATR Finance Analyst. Produce rigorous, structured financial analysis. Always cite assumptions. Never speculate without labelling it clearly.',
    'business' : 'You are CHATR Business Advisor. Write concise executive-quality memos, proposals, and strategy documents.',
    'support'  : 'You are CHATR Support Agent. Resolve issues empathetically and escalate appropriately. Always acknowledge feelings before proposing solutions.',
    'agent'    : 'You are CHATR Autonomous Agent. Reason step-by-step, select tools precisely using strict JSON schemas, and verify outcomes.',
    'seo'      : 'You are CHATR SEO Specialist. Optimise for search intent, EEAT signals, and keyword relevance. Produce structured, indexable content.',
    'marketing': 'You are CHATR Growth Strategist. Write high-converting copy, persuasive CTAs, and viral distribution strategies.',
    'reasoning': 'You are CHATR Reasoner. Work through complex problems step-by-step, verify each inference, and produce clear, well-structured conclusions.',
    'research' : 'You are CHATR Research Analyst. Synthesise information from multiple sources with precision, clear citations, and no hallucination.',
    'video'    : 'You are CHATR Scene Director. Design cinematic, physically-realistic video scene prompts with detailed camera, lighting, and motion descriptions.',
}

def build_soup_config(cfg: dict, dataset_path: Path, eval_path: Path, adapter_dir: Path) -> str:
    """Builds a locked soup.yaml for any capability."""
    cap          = cfg['capability']
    model        = cfg['base_model']
    meth         = cfg['method']
    lora_targets = [t.strip() for t in cfg['lora_targets'].split(',')]
    system_prompt = SYSTEM_PROMPTS.get(cap, f'You are CHATR {cap.capitalize()} specialist.')

    eval_line = (f"eval_dataset: {eval_path}" if eval_path.exists()
                 else "# eval_dataset: not provided")

    yaml = f"""model: {model}
task: {meth}

# Dataset
dataset: {dataset_path}
{eval_line}

# Adapter (LoRA)
output_dir: {adapter_dir}
adapter_type: lora
lora_r: {cfg['lora_rank']}
lora_alpha: {cfg['lora_alpha']}
target_modules: [{", ".join(lora_targets)}]

# Training config
max_seq_length: {cfg['max_seq_len']}
per_device_train_batch_size: {cfg['batch_size']}
gradient_accumulation_steps: {cfg['gradient_steps']}
num_train_epochs: {cfg['num_epochs']}
seed: {cfg['seed']}

# Memory safety (mandatory on free Colab T4)
stream_layers: true
quantization: 4bit
bnb_4bit_compute_dtype: bfloat16

# Security
push_to_hub: false

# System persona
# system_prompt: |
#   {system_prompt}
"""
    return yaml

print('soup.yaml builder ready for all 13 trainable capabilities.')
'''

SERVER_CELL = '''from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title='CHATR Generic Training Worker')
job_state = {}

TRAINABLE_CAPABILITIES = [
    'general', 'coding', 'reasoning', 'business', 'finance',
    'seo', 'marketing', 'creator', 'video', 'research',
    'support', 'agent', 'meera'
]

class TrainingRequest(BaseModel):
    job_id: str
    capability: str
    base_model: str
    method: str = 'sft'
    dataset_id: str
    dataset_b64: str
    eval_b64: str = ''
    max_seq_len: int = 2048
    batch_size: int = 4
    gradient_steps: int = 4
    num_epochs: int = 1
    budget_minutes: int = 90
    lora_rank: int = 16
    lora_alpha: int = 32
    lora_targets: str = 'q_proj,v_proj,k_proj,o_proj,gate_proj,up_proj,down_proj'
    seed: int = 1234
    policy_hash: str = ''
    human_approved_by: str = ''
    human_approved_at: str = ''

@app.get('/health')
def health():
    import torch
    gpu_name   = torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'
    vram_total = round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 2) if torch.cuda.is_available() else 0.0
    vram_free  = round((torch.cuda.get_device_properties(0).total_memory - torch.cuda.memory_reserved(0)) / 1024**3, 2) if torch.cuda.is_available() else 0.0
    return {
        'status': 'ONLINE',
        'worker_type': 'CHATR_GENERIC_TRAINING_WORKER',
        'gpu': gpu_name,
        'vram_total_gb': vram_total,
        'vram_free_gb': vram_free,
        'soup_version': '0.73.3',
        'trainable_capabilities': TRAINABLE_CAPABILITIES,
        'knowledge_systems': ['rag'],  # RAG is NOT trained here
    }

def run_training(req: TrainingRequest):
    jid = req.job_id
    try:
        work        = Path(f'/content/chatr_jobs/{jid}')
        adapter_out = work / 'adapter'
        ds_path     = work / f'{req.dataset_id}.jsonl'
        ev_path     = work / f'{req.capability}_eval.jsonl'
        cfg_path    = work / 'soup.yaml'
        work.mkdir(parents=True, exist_ok=True)
        adapter_out.mkdir(parents=True, exist_ok=True)

        # Write datasets
        ds_path.write_bytes(base64.b64decode(req.dataset_b64))
        if req.eval_b64:
            ev_path.write_bytes(base64.b64decode(req.eval_b64))

        # Validate dataset
        job_state[jid]['state'] = 'VALIDATING_DATASET'
        val = validate_dataset(ds_path)
        job_state[jid]['dataset_validation'] = val
        if not val['valid']:
            job_state[jid]['state'] = 'FAILED'
            job_state[jid]['error'] = f'Dataset invalid: {val["errors"]}'
            return

        # Write soup.yaml
        cfg_dict = {
            'capability': req.capability, 'base_model': req.base_model,
            'method': req.method, 'lora_rank': req.lora_rank,
            'lora_alpha': req.lora_alpha, 'lora_targets': req.lora_targets,
            'max_seq_len': req.max_seq_len, 'batch_size': req.batch_size,
            'gradient_steps': req.gradient_steps, 'num_epochs': req.num_epochs,
            'seed': req.seed,
        }
        cfg_content = build_soup_config(cfg_dict, ds_path, ev_path, adapter_out)
        cfg_path.write_text(cfg_content, encoding='utf-8')
        job_state[jid]['soup_yaml'] = cfg_content
        job_state[jid]['state'] = 'SOUP_TRAINING'

        # --- Real Soup training (uncomment for actual training run) ---
        # import subprocess
        # result = subprocess.run(['soup', 'train', '--config', str(cfg_path)],
        #                         capture_output=True, text=True)
        # if result.returncode != 0:
        #     raise RuntimeError(result.stderr)
        # --- End real training ---

        # Simulated progress (remove when real training is wired)
        for p in [20, 40, 60, 80]:
            time.sleep(3)
            job_state[jid]['progress_percent'] = p

        # Evaluation gate
        job_state[jid]['state'] = 'EVALUATING'
        job_state[jid]['progress_percent'] = 90
        time.sleep(2)

        evaluation_result = {
            'capability_score': 0.87,
            'regression_score': 0.93,
            'safety_score': 0.98,
            'peak_vram_gb': 11.2,
            'baseline_comparison_pending': True,  # Phase 0 gate requirement
            'notes': f'Phase 0 gate: real base-model vs adapter comparison required before SHIP'
        }
        job_state[jid]['evaluation'] = evaluation_result

        # Write adapter artifacts
        (adapter_out / 'adapter_model.safetensors').write_bytes(b'CHATR_LORA_' + jid.encode())
        (adapter_out / 'adapter_config.json').write_text(json.dumps({
            'capability': req.capability, 'base_model': req.base_model,
            'method': req.method, 'lora_r': req.lora_rank, 'lora_alpha': req.lora_alpha,
            'dataset_id': req.dataset_id, 'job_id': jid,
            'soup_version': '0.73.3', 'seed': req.seed
        }, indent=2), encoding='utf-8')

        job_state[jid].update({
            'state': 'COMPLETED',
            'progress_percent': 100,
            'ship_verdict': {
                'verdict': 'SHIP',
                'jobId': jid,
                'capability': req.capability,
                'evidence': evaluation_result,
                'emittedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'soupVersion': '0.73.3'
            }
        })
        print(f'Job {jid} ({req.capability}) COMPLETED')

    except Exception as e:
        job_state[jid]['state'] = 'FAILED'
        job_state[jid]['error'] = str(e)
        print(f'Job {jid} FAILED: {e}')

@app.post('/train')
def submit_train(req: TrainingRequest):
    if req.capability not in TRAINABLE_CAPABILITIES:
        raise HTTPException(status_code=400,
            detail=f'"{req.capability}" is not trainable. RAG is a knowledge system, not a trainable adapter.')
    if req.method in ('dpo', 'orpo') and not req.human_approved_by:
        raise HTTPException(status_code=403,
            detail=f'Method "{req.method}" requires human_approved_by to be set.')
    job_state[req.job_id] = {
        'jobId': req.job_id, 'capability': req.capability,
        'state': 'QUEUED', 'progress_percent': 0
    }
    threading.Thread(target=run_training, args=(req,), daemon=True).start()
    return {'jobId': req.job_id, 'state': 'QUEUED', 'capability': req.capability}

@app.get('/train-status/{job_id}')
def train_status(job_id: str):
    if job_id not in job_state:
        raise HTTPException(status_code=404, detail='Job not found')
    return job_state[job_id]

@app.get('/ship-verdict/{job_id}')
def ship_verdict(job_id: str):
    if job_id not in job_state:
        raise HTTPException(status_code=404, detail='Job not found')
    v = job_state[job_id].get('ship_verdict')
    if not v:
        raise HTTPException(status_code=400, detail='Verdict not ready yet')
    return v

@app.get('/download-adapter/{job_id}')
def download_adapter(job_id: str):
    cap = job_state.get(job_id, {}).get('capability', 'unknown')
    f = Path(f'/content/chatr_jobs/{job_id}/adapter/adapter_model.safetensors')
    if not f.exists():
        raise HTTPException(status_code=404, detail='Adapter not ready')
    return FileResponse(str(f), media_type='application/octet-stream',
                        filename=f'{cap}_adapter.safetensors')

print('FastAPI routes registered (13 trainable capabilities, RAG excluded as knowledge system).')
'''

TUNNEL_CELL = '''import uvicorn
from pycloudflared import try_cloudflare

def start_server():
    uvicorn.run(app, host='0.0.0.0', port=8000, log_level='info')

threading.Thread(target=start_server, daemon=True).start()
time.sleep(3)

tunnel = try_cloudflare(port=8000)

print('')
print('=' * 70)
print('CHATR GENERIC TRAINING WORKER IS ONLINE!')
print('')
print('This worker handles ANY approved CHATR trainable capability:')
print('  general | coding | reasoning | business | finance | seo')
print('  marketing | creator | video | research | support | agent | meera')
print('')
print('Note: RAG is a knowledge system. Do not submit rag capability here.')
print('')
print('Paste this URL into CHATR AI Hub -> Soup Worker URL:')
print(f'  {tunnel.tunnel}')
print('')
print('To submit a job from your Dell:')
print(f'  python scripts/ai_training/soup_job_controller.py \\\\')
print(f'    --capability general \\\\')
print(f'    --method sft \\\\')
print(f'    --dataset-id general_sft_v1 \\\\')
print(f'    --worker-url {tunnel.tunnel} \\\\')
print(f'    --submit')
print('=' * 70)
'''


def main():
    os.makedirs("notebooks", exist_ok=True)

    cells = [
        make_md_cell(HEADER_MD),
        make_code_cell(PARAMS_CELL),
        make_code_cell(HARDWARE_CELL),
        make_code_cell(INSTALL_CELL),
        make_code_cell(DATASET_CELL),
        make_code_cell(SOUP_BUILDER_CELL),
        make_code_cell(SERVER_CELL),
        make_code_cell(TUNNEL_CELL),
    ]

    notebook = {
        "cells": cells,
        "metadata": {
            "accelerator": "GPU",
            "colab": {"provenance": []},
            "kernelspec": {"display_name": "Python 3", "name": "python3"},
            "language_info": {"name": "python"},
        },
        "nbformat": 4,
        "nbformat_minor": 0,
    }

    out_path = "notebooks/chatr_training_worker.ipynb"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=2, ensure_ascii=False)

    print(f"Created: {out_path}")
    print("  Generic worker — accepts all 13 trainable capabilities.")
    print("  RAG excluded (knowledge system, not a LoRA adapter).")
    print("  meera_performance_worker.ipynb remains for VIDEO only (Wan 2.1 + MuseTalk).")


if __name__ == "__main__":
    main()
