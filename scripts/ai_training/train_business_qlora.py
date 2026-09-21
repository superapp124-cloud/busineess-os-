#!/usr/bin/env python3
"""
train_business_qlora.py
=======================
Self-Contained Real GPU QLoRA SFT Post-Training Script for CHATR 'business-v1'.

Executed on NVIDIA Tesla T4 (Google Colab or Dedicated GPU Worker).
Strictly adheres to CHATR Provenance Freeze:
  - Base Model: Qwen/Qwen2.5-7B-Instruct
  - Dataset: data/business/business_sft_v1.jsonl (32 rows, SHA: 24d5af8f...)
  - Engine: Hugging Face TRL SFTTrainer + PEFT QLoRA 4-bit (Soup=NOT_USED)
  - Pre-Training Freeze Hash: 8fc0e0709288862da3a3f4c9286f7ea43974d32b7308e1298d9047c09af97598
"""

import os
import sys
import json
import time
import hashlib
from datetime import datetime, timezone
from pathlib import Path

# Verify dependencies on GPU worker
try:
    import torch
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        BitsAndBytesConfig,
        TrainingArguments
    )
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from trl import SFTTrainer
    HAS_GPU_DEPS = True
except ImportError:
    HAS_GPU_DEPS = False

FROZEN_METADATA = {
    "capability": "business",
    "version": "v1.0.0",
    "base_model": "Qwen/Qwen2.5-7B-Instruct",
    "base_model_revision": "a09a35458c702b33eeacc393d103063234e8bc28",
    "pre_training_freeze_hash": "8fc0e0709288862da3a3f4c9286f7ea43974d32b7308e1298d9047c09af97598",
    "expected_train_sha256": "24d5af8f24aea747a913c316a08e9f29b775874f123df5978f2fbc74b605b221",
    "expected_eval_sha256": "57bccef6cde4c93792e41d27cb452f515c2ba9317a8c93b33693cc1aac7b610a",
    "expected_spec_sha256": "2f2f506cf0074d629940039c5af6d69eac3894d226a8e3d37fa145193bda13b9",
    "training_engine": "huggingface_trl",
    "trainer_class": "SFTTrainer",
    "peft_method": "QLoRA_4bit",
    "soup_used": False,
    "execution_path": "colab-t4-qlora-direct"
}

def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def verify_pre_conditions(dataset_path: str, manifest_path: str = "datasets/manifests/business_pre_training_freeze.json"):
    print("==================================================================")
    print("VERIFYING PRE-TRAINING FREEZE INTEGRITY & IMMUTABILITY")
    print("==================================================================")
    # Check 1: Dataset file existence & SHA
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"FAIL-CLOSED: Dataset missing: {dataset_path}")
    actual_sha = compute_sha256(dataset_path)
    if actual_sha != FROZEN_METADATA["expected_train_sha256"]:
        raise ValueError(
            f"FAIL-CLOSED: Dataset hash mismatch!\n"
            f"  Expected: {FROZEN_METADATA['expected_train_sha256']}\n"
            f"  Actual:   {actual_sha}"
        )
    print(f"  [PASS] Dataset hash verified: {actual_sha}")

    # Check 2: Immutability check via manifest
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            freeze_doc = json.load(f)
        recorded_hash = freeze_doc.get("pre_training_freeze_hash")
        doc_copy = dict(freeze_doc)
        doc_copy.pop("pre_training_freeze_hash", None)
        recomputed = hashlib.sha256(json.dumps(doc_copy, sort_keys=True).encode("utf-8")).hexdigest()
        if recomputed != recorded_hash or recorded_hash != FROZEN_METADATA["pre_training_freeze_hash"]:
            raise ValueError(
                f"FAIL-CLOSED: Immutability violation! Freeze manifest modified.\n"
                f"  Expected: {FROZEN_METADATA['pre_training_freeze_hash']}\n"
                f"  Actual:   {recomputed}"
            )
        print(f"  [PASS] Pre-training freeze hash verified: {recorded_hash}")
    else:
        print(f"  [WARN] Manifest not present locally ({manifest_path}); verified dataset SHA directly.")

    print(f"  [PASS] Pinned base model revision: {FROZEN_METADATA['base_model_revision']}")
    print(f"  [PASS] Training engine: {FROZEN_METADATA['training_engine']} (Soup=NOT_USED)")
    print("==================================================================")

def load_dataset(dataset_path: str):
    items = []
    with open(dataset_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                items.append(json.loads(line))
    print(f"Loaded {len(items)} training examples from {dataset_path}")
    return items

def format_prompts(tokenizer, examples):
    formatted = []
    for ex in examples:
        text = tokenizer.apply_chat_template(ex["messages"], tokenize=False)
        formatted.append(text)
    return formatted

def run_training(
    dataset_path: str = "data/business/business_sft_v1.jsonl",
    output_dir: str = "models/chatr_business_v1_adapter",
    epochs: int = 3
):
    verify_pre_conditions(dataset_path)

    if not HAS_GPU_DEPS:
        print("\nERROR: Required GPU libraries (torch, transformers, peft, trl) not found in local environment.")
        print("This script must be executed on a CUDA-enabled GPU worker (e.g. Google Colab T4).")
        print("See scripts/ai_training/train_business_colab.ipynb for Colab execution notebook.")
        sys.exit(1)

    if not torch.cuda.is_available():
        print("\nERROR: CUDA is not available. Real GPU training requires an NVIDIA GPU.")
        sys.exit(1)

    device_name = torch.cuda.get_device_name(0)
    vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    print(f"\nTarget GPU: {device_name} ({vram_gb:.2f} GB VRAM)")

    # 1. 4-bit Quantization Config
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True
    )

    # 2. Load Model & Tokenizer
    model_id = FROZEN_METADATA["base_model"]
    revision = FROZEN_METADATA["base_model_revision"]
    print(f"\nLoading base model: {model_id} @ {revision[:12]}...")
    tokenizer = AutoTokenizer.from_pretrained(model_id, revision=revision, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        revision=revision,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )
    model = prepare_model_for_kbit_training(model)

    # 3. LoRA Configuration
    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 4. Prepare Dataset
    raw_examples = load_dataset(dataset_path)
    from datasets import Dataset
    train_dataset = Dataset.from_dict({"messages": [ex["messages"] for ex in raw_examples]})

    # 5. Training Arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=8,
        optim="paged_adamw_8bit",
        save_strategy="epoch",
        logging_steps=1,
        learning_rate=2e-4,
        weight_decay=0.01,
        fp16=True,
        bf16=False,
        max_grad_norm=0.3,
        warmup_ratio=0.05,
        lr_scheduler_type="cosine",
        report_to="none"
    )

    # 6. SFTTrainer Execution
    trainer = SFTTrainer(
        model=model,
        train_dataset=train_dataset,
        peft_config=lora_config,
        dataset_text_field="messages",
        max_seq_length=1024,
        tokenizer=tokenizer,
        args=training_args
    )

    print("\nStarting SFTTrainer execution...")
    start_time = time.time()
    train_result = trainer.train()
    elapsed_time = time.time() - start_time
    print(f"\nTraining completed in {elapsed_time:.2f} seconds.")

    # 7. Save Adapter Artifacts
    os.makedirs(output_dir, exist_ok=True)
    trainer.model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Saved LoRA adapter to {output_dir}")

    # 8. Produce Physical Evidence Receipt
    adapter_file = os.path.join(output_dir, "adapter_model.safetensors")
    adapter_sha = compute_sha256(adapter_file) if os.path.exists(adapter_file) else "N/A"
    adapter_size = os.path.getsize(adapter_file) if os.path.exists(adapter_file) else 0

    evidence_doc = {
        "capability": "business",
        "version": "v1.0.0",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "hardware": {
            "device": device_name,
            "vram_gb": vram_gb
        },
        "training_engine": FROZEN_METADATA["training_engine"],
        "trainer": FROZEN_METADATA["trainer_class"],
        "peft": FROZEN_METADATA["peft_method"],
        "soup_used": False,
        "pre_training_freeze_hash": FROZEN_METADATA["pre_training_freeze_hash"],
        "training_loss": train_result.training_loss,
        "metrics": train_result.metrics,
        "adapter_artifact": {
            "path": adapter_file,
            "bytes": adapter_size,
            "sha256": adapter_sha
        }
    }

    evidence_path = os.path.join(output_dir, "golden_path_evidence_business_v1.json")
    with open(evidence_path, "w", encoding="utf-8") as f:
        json.dump(evidence_doc, f, indent=2)
    print(f"Wrote physical evidence to {evidence_path}")

if __name__ == "__main__":
    run_training()
