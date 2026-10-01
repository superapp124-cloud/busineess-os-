# CHATR — Local Model Technical Specification
**Model Identifier:** `CHATR-Local-0.5B-v1`  
**Base Architecture:** `Qwen/Qwen2.5-0.5B-Instruct`  
**Distribution Format:** GGUF v3 (`Q4_K_M`)  
**Target Storage Budget:** ~491 MB (400–500 MB nominal)

---

## 1. Model Metadata & Parameter Architecture

| Parameter | Specification |
| :--- | :--- |
| **Base Model** | Qwen2.5-0.5B-Instruct (Alibaba Cloud / Open Weights) |
| **Total Parameters** | 494 Million |
| **Active Parameters** | 494 Million (Dense Transformer) |
| **Hidden Dimension ($d_{\text{model}}$)** | 896 |
| **Feed-Forward Dimension ($d_{\text{ff}}$)** | 4,864 |
| **Number of Layers** | 24 |
| **Attention Heads** | 14 Query Heads, 2 Key/Value Heads (Grouped-Query Attention - GQA) |
| **Vocabulary Size** | 151,936 tokens (Byte-Pair Encoding with broad multilingual coverage) |
| **Rotary Position Embedding (RoPE)** | Base frequency 1,000,000 |

---

## 2. Quantization & Storage Envelope

| Metric | Measurement | Notes |
| :--- | :--- | :--- |
| **Quantization Method** | `Q4_K_M` | Medium 4-bit k-quant with FP16 tensor scales |
| **GGUF File Size** | **~491.5 MB** | Verified from Hugging Face `Qwen/Qwen2.5-0.5B-Instruct-GGUF` |
| **Checksum Algorithm** | SHA-256 | Required prior to local mounting |
| **APK Bundling Status** | **Excluded from base APK** | Downloaded on-demand to `context.filesDir/models/` |

---

## 3. Runtime Memory & Compute Budget

```
┌────────────────────────────────────────────────────────┐
│ TOTAL MEMORY ALLOCATION (Budget: ~550 MB RAM)          │
├────────────────────────────────────────────────────────┤
│ Model Weights (mmap file pages):           ~491 MB     │
│ Context KV Cache (2048 tokens, 16-bit):     ~48 MB     │
│ Compute Scratch Buffer (Activation tensor): ~12 MB     │
├────────────────────────────────────────────────────────┤
│ ACTIVE WORKING SET IN RAM:                 ~551 MB     │
└────────────────────────────────────────────────────────┘
```

- **Android Heap Impact**: The model is mapped into process virtual memory via `mmap` (`PROT_READ`), NOT allocated on the Java heap. `android:largeHeap="true"` accommodates the runtime without garbage collection pressure.
- **Context Length**: Capped conservatively at **2,048 tokens** (expandable to 4,096 on devices with $\ge 8\text{ GB}$ RAM).
- **Target Inference Speed**:
  - Snapdragon 8 Gen 2 / Gen 3 (Flagship): **50–75 tokens/sec**
  - Snapdragon 7 Gen 1 / Dimensity 7200 (Mid-range): **25–40 tokens/sec**
  - Helio G99 / Snapdragon 680 (Budget/Entry): **12–20 tokens/sec**

---

## 4. Prompt Template (ChatML)

The local engine formats all agent interactions into standard ChatML:

```
<|im_start|>system
You are CHATR SI, a private on-device assistant.
Current Date: 2026-09-28
Domain: Personal Assistant
Role: Manage reminders and habits.
Rules: Output structured JSON tool calls when an action is required.<|im_end|>
<|im_start|>user
Remind me to call Mom at 7 PM today<|im_end|>
<|im_start|>assistant
<tool_call>
{"targetAgent": "personal", "action": "set_reminder", "parameters": {"title": "Call Mom", "time": "19:00"}}
</tool_call>
I've scheduled a reminder to call Mom at 7:00 PM today.<|im_end|>
```

---

## 5. Model Verification & Integrity Contract

1. **Storage Path**: `context.filesDir + "/models/chatr-local-0.5b-q4km-v1.gguf"`
2. **Integrity Rule**: If the calculated SHA-256 checksum fails during `ModelManager.verify()`, the file is immediately flagged as `CORRUPTED` and purged from disk to prevent native segfaults.
3. **No Foundation Claim**: The application UI identifies the model as **CHATR Local AI (powered by Qwen2.5-0.5B)**.
