# CHATR SI OS — Model Registry & Model Selection
**Document:** `docs/AI_OS/MODEL_REGISTRY.md`  
**Core Services:** `ModelRegistry`, `ModelSelectionEngine`, `ModelUpdateManager`  

---

## 1. Model Independence Mandate

> **Core Axiom:** "The really important part is the agent, memory, tools, and privacy layer—not the 0.5B model."

`Qwen2.5-0.5B-Instruct Q4_K_M` is the verified V1 bootstrap model (Apache-2.0). However, the platform architecture decouples the agent system from specific model weights. Future upgrades (e.g. 1B, 1.5B, 3B, Gemma, Phi, or custom CHATR weights) can be hot-swapped without altering agent logic.

---

## 2. Dynamic Model Catalog

| Model ID | Runtime | Format | Quant | Size | Min RAM | Tool Calling | Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`CHATR-LOCAL-0.5B-V1`** | `llama.cpp` | GGUF v3 | `Q4_K_M` | 491.4 MB | 4.0 GB | Yes | **Production Bootstrap** |
| **`CHATR-LOCAL-1B-FUTURE`**| `llama.cpp` | GGUF v3 | `Q4_K_M` | ~986 MB | 8.0 GB | Yes | Flagship High-Reasoning |
| **`ANDROID-AICORE-NANO`** | `aicore` | System API | `INT4` | 0 MB (OS) | 8.0 GB | Basic | System Fast-Path |
| **`CHATR-CLOUD-GATEWAY`** | `cloud` | Managed | `FP16` | 0 MB (Cloud)| 0 GB | Yes | Public Extended Intel |

---

## 3. Dynamic Model Selection Logic

The `ModelSelectionEngine` evaluates:
1. **Available RAM & Thermal Throttle**: If RAM $< 800\text{ MB}$ or device is warm, defaults to 0.5B or AICore.
2. **Task Complexity**:
   - `CRITICAL_SAFETY`: Handled by deterministic Health OS with local explanation.
   - `SENSITIVE` / `PRIVATE`: Strictly routes to on-device models.
   - `COMPLEX_REASONING`: Routes to cloud gateway only if privacy is `PUBLIC`.
