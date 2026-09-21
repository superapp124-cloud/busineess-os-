# Live Model Identity & Entity Grounding Audit

**Audit Date**: September 9, 2026  
**Auditor**: Senior ML Infrastructure Engineer / Adversarial Red Team  
**Scope**: Verification of Live Model Identity, Ollama Layers, Entity Grounding, and Hallucination Resistance

---

## 1. Executive Grounding Assessment

A live terminal session testing `chatr`, `what is chatr`, and `talentxcel` produced generic, ungrounded conversational outputs.
A full runtime trace was conducted to identify the serving model, determine whether trained weights or system prompt injection was present, and evaluate the status of `chatr:general-v2`.

### Verdict:
**`WRONG_MODEL_SERVING`** (Live terminal was running vanilla `phi3:mini`; `chatr:general-v2` is NOT yet deployed or trained on GPU).

---

## 2. Live Runtime Trace & Artifact Provenance

| Parameter | Value | Assessment |
|---|---|---|
| **CLI Model Invoked** | `phi3:mini` (via interactive `ollama run`) | Terminal prompt `>>> Send a message (/? for help)` confirms interactive Ollama REPL. |
| **Ollama Model Name** | `phi3:mini` (interactive session) / `chatr:general-v1` | Historical mock model exists; v2 does not exist in Ollama. |
| **Ollama Digest** | `4f222292793889a9...` (phi3:mini) / `e186928c0e4a...` (chatr:general-v1) | Confirms zero weight difference from baseline phi3:mini. |
| **GGUF SHA-256** | `sha256-633fc5be925f9a484b61d6f9b9a78021eeb462100bd557309f01ba84cac26adf` | Exact blob hash of base `phi3:mini`. |
| **Adapter SHA-256** | None (0 bytes trained weights) | No LoRA weights merged into the model. |
| **Base Model** | `phi3:mini` (Microsoft) | Not the approved target `Qwen/Qwen2.5-7B-Instruct`. |
| **Training Provenance** | Historical Mock Simulation (`run_training_sim`) | 63-byte ASCII stub generated during legacy Phase 0. |
| **System Prompt Present** | No (in `phi3:mini`) / 122 bytes generic (in `chatr:general-v1`) | No Intent OS grounding or platform invariants injected. |
| **RAG Enabled** | False (Raw direct model prompt) | No search or document retrieval augmentation active. |
| **CHATR Grounding** | **0.0% (FAILED)** | Interpreted as typo for "chat" or "chatter". No mention of Intent OS or Business OS. |
| **TalentXcel Grounding** | **0.0% (FAILED)** | "I couldn't find any information on it." |
| **Hallucination Resistance** | **FAILED** | When queried with system prompt, hallucinated generic "TalentXcelAI" without domain knowledge. |
| **Base-vs-Trained Difference**| **0.0% (IDENTICAL)** | Physical weight tensors are bit-for-bit identical to vanilla base model. |

---

## 3. Entity Grounding Tests & Empirical Comparison

### A. Canonical Grounding: CHATR
- **Canonical Definition (from `data/general/general_sft_v2.jsonl`)**:
  > "CHATR is an Intent-First Business Operating System that translates natural-language goals into autonomous multi-app executions across communication, work, and platform capabilities."
- **Terminal Response Observed**:
  > "It seems like you meant to say 'chat'! Let's have some fun conversations or play games together: 1. 20 Questions 2. Hangman 3. Trivia..."
- **Finding**: Absolute grounding failure. Proves vanilla model without fine-tuning.

### B. Canonical Grounding: TalentXcel
- **Canonical Definition (from `data/talentxcel/talentxcel_sft_v1.jsonl`)**:
  > "TalentXcel is an enterprise recruitment and talent intelligence platform built on the CHATR Intent OS, providing automated sourcing, evaluation, and candidate matching."
- **Terminal Response Observed**:
  > "You mentioned TalentXcel earlier, and I couldn't find any information on it. It's possible that it's a new concept or initiative, a proprietary term, or a typo."
- **Finding**: Absolute grounding failure. Proves model has zero training data on TalentXcel.

---

## 4. Test Against System-Prompt-Only Injection

To verify whether system prompts alone could substitute for real weights:
- When queried without system prompt, `phi3:mini` stated it had no knowledge.
- When `chatr:general-v1` was queried with its 122-byte system prompt (`"You are CHATR Core..."`), it still failed to define CHATR as an Intent OS and hallucinated generic responses.
- **Rule Enforced**: Under `INVARIANT: REAL_MODEL_TRAINING`, system-prompt-only wrappers are explicitly classified as `SUPERSEDED_MOCK`. Only models with non-zero LoRA gradient updates and divergent weight digests can be promoted.

---

## 5. Status of `chatr:general-v2`

| Invariant Requirement | chatr:general-v2 Status | Evidence |
|---|---|---|
| Base Model | `Qwen/Qwen2.5-7B-Instruct` | Configured in `chatr_policy_engine.py` & locked |
| Dataset Validated | Yes (85 rows, 89,369 bytes) | SHA-256: `bcc08f9ad321a9b5c4f9a55600cfb777faf937f9539776312f13240f1dcfeccc` |
| Eval Set Disjoint | Yes (10 rows general, 39 rows talentxcel) | Prompt overlap: 0 (100% disjoint) |
| Physical GPU Training | **PENDING** | Local environment has NO CUDA/NVIDIA GPU; runs on Colab T4 |
| GGUF Merged File | **PENDING** | Will be produced upon completion of Colab Cell 8 |
| Registry State | `READY_FOR_REAL_TRAINING` | Programmatically locked against illegal promotion |
| Ollama Deployment | Not yet registered | Awaiting verified GGUF artifact download |

---

## 6. Audit Verdict

```
============================================================
FINAL AUDIT VERDICT: WRONG_MODEL_SERVING
============================================================
The model that produced the terminal identity failure was
empirically confirmed to be vanilla phi3:mini.

chatr:general-v2 is currently NOT deployed and remains in:
    READY_FOR_REAL_TRAINING

Production promotion is strictly BLOCKED until real GPU training
on Qwen 2.5 7B is executed and verified on Google Colab.
============================================================
```
