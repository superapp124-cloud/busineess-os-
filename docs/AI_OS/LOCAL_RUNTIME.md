# CHATR SI OS — Local Runtime & Provider Architecture
**Document:** `docs/AI_OS/LOCAL_RUNTIME.md`  
**Core Service:** `ChatrLocalRuntime`  

---

## 1. Architectural Mandate: Ollama vs. Production Android

> **Strict Rule:** DO NOT embed the complete Ollama desktop runtime into the mobile Android application.

- **Ollama**: Serves as a development, local-model experimentation, and desktop compatibility layer (`localhost:11434`).
- **Production Android**: Uses native C++ libraries (`libllama.so`) compiled via the Android NDK, linking directly to Linux kernel `mmap()` to load GGUF models from app-private storage (`context.filesDir/models/`).

---

## 2. Provider Plugin Architecture

`ChatrLocalRuntime` coordinates six pluggable engines via the `ChatrAIProvider` interface:

```
ChatrLocalRuntime
    ├── LlamaCppProvider          # Tier 1 Production Android (ARM64 GGUF)
    ├── AICoreProvider            # Tier 1 System Accelerated (Android Gemini Nano)
    ├── LiteRTProvider            # Lightweight Embeddings & Classification
    ├── OllamaProvider            # Desktop Dev / PC Simulation
    ├── CloudProvider             # Supabase Edge / Gemini / OpenAI Gateway
    └── HeuristicFallbackProvider # Deterministic 0ms Fallback
```

### Provider Resolution Hierarchy:
1. **LlamaCppProvider**: Activated when running natively on Android with compiled `libllama.so` and downloaded GGUF weights.
2. **AICoreProvider**: Activated on supported Android 14+ flagship devices with system `com.google.android.aicore`. Zero app RAM footprint.
3. **OllamaProvider**: Activated during desktop development when a local Ollama daemon is detected at `http://localhost:11434`.
4. **CloudProvider**: Activated only when the task is classified as `PUBLIC`, network connectivity is present, and user privacy policy allows external queries.
5. **HeuristicFallbackProvider**: Activated when offline and models are unloaded to guarantee zero crashes and 100% UI stability.

---

## 3. Native Hardware Acceleration Matrix

For `llama.cpp` builds on Android ARM64:
- **Baseline CPU**: Standard ARMv8.2-A with NEON SIMD vector extensions.
- **Dot-Product Acceleration**: `+dotprod` enables 4-bit integer matrix multiplications (INT4 / Q4_K_M) at 2.5x speedup on Cortex-A7x cores.
- **GPU / NPU Acceleration**: Modular build system allows enabling Vulkan / Adreno OpenCL or MediaTek NeuroPilot backends on validated Tier A/B hardware.
