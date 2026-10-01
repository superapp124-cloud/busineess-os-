# CHATR — On-Device AI Architecture Specification
**Document Version:** 1.0.0  
**Status:** Approved Architecture Baseline  
**Target Runtime:** Android (arm64-v8a) via `llama.cpp` + GGUF (Q4_K_M)

---

## 1. Architectural Philosophy

CHATR adopts a hybrid AI paradigm:

```
                    CHATR SI OS
                         │
                ┌────────┴────────┐
                │                 │
             ONLINE             OFFLINE
                │                 │
        Cloud AI Router      Local AI Router
                │                 │
       OpenAI/Gemini/etc.       llama.cpp (libllama.so)
                                  │
                             CHATR GGUF (~491 MB)
                                  │
                        ┌─────────┴─────────┐
                        │                   │
                  Agent Router         Local Memory
                        │                   │
       ┌────────┬───────┼───────┬──────────┤
       │        │       │       │          │
    Personal  Work   Health   Jobs     Shield
       │        │       │       │          │
       └────────┴───────┴───────┴──────────┘
                        │
                  Structured Tools
                        │
       ┌────────────────┼─────────────────┐
       │                │                 │
   Health OS        Messages          Device OS
       │                │                 │
   Health data       Contacts          Watch/Ring
   Labs              Calendar          BP/Glucose
   Medicines         Files             Scale
```

### Core Invariants:
1. **Ollama on Desktop, llama.cpp on Device**:
   - **Ollama** is exclusively the developer and model management environment on desktop/workstation (used for dataset fine-tuning, prompt iteration, and GGUF packaging).
   - **llama.cpp** compiled natively with the Android NDK (`libllama.so`) is the production on-device execution engine.
2. **One Model, Many Agents**:
   - We do NOT package six separate 400 MB neural networks.
   - We package **ONE master 0.5B model** (~491 MB). Agents (`Personal`, `Work`, `Health`, `Jobs`, `Shield`, `Search`, `Local`) are specialized prompt, tool, schema, and security contexts running through the single inference pipeline.
3. **Knowledge Stored Outside the Model**:
   - The LLM does NOT memorize private user data in its weights.
   - The LLM acts as an **orchestration brain**:
     $$\text{User Utterance} \longrightarrow \text{LLM Detects Intent} \longrightarrow \text{App Executes Local Tool} \longrightarrow \text{LLM Summarizes Result}$$

---

## 2. Component Blueprint

### 2.1 The Four-Stage Local Processing Loop
$$\text{UNDERSTAND} \longrightarrow \text{DECIDE} \longrightarrow \text{CALL TOOL} \longrightarrow \text{EXPLAIN}$$

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. UNDERSTAND                                                          │
│    User speaks or types: "How did I sleep this week?"                  │
│    (Voice is locally transcribed via Whisper Tiny ONNX ~39 MB)         │
├────────────────────────────────────────────────────────────────────────┤
│ 2. DECIDE & CALL TOOL                                                  │
│    Local LLM generates structured JSON:                                │
│    {                                                                   │
│      "targetAgent": "health",                                          │
│      "tool": "getSleepSummary",                                        │
│      "parameters": { "days": 7 }                                       │
│    }                                                                   │
├────────────────────────────────────────────────────────────────────────┤
│ 3. TOOL EXECUTION (Application Layer)                                  │
│    Health OS queries LocalHealthStore:                                 │
│    --> Sleep average: 6.2 hrs, deficit: -1.3 hrs vs 7.5 hr baseline    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. EXPLAIN                                                             │
│    Local LLM formats calm, natural language response:                  │
│    "Your sleep averaged 6.2 hours this week, which is 1.3 hours below  │
│     your usual 7.5-hour baseline."                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Subsystem Breakdown

### 3.1 LocalAIEngine (TypeScript Abstraction)
- Single facade exposed to the React / Capacitor application.
- Decouples all native NDK and `llama.cpp` bindings from UI components.
- Lifecycle:
  - `initialize()`
  - `loadModel(modelPath: string)`
  - `unloadModel()`
  - `isModelAvailable()`
  - `generate(prompt: string, options?: GenerateOptions)`
  - `generateStructured<T>(prompt: string, schema: object)`
  - `cancel()`
  - `getModelInfo()`
  - `getRuntimeInfo()`

### 3.2 LlamaCppEngine (Android Native Layer)
- Compiled via Android NDK for `arm64-v8a`.
- Uses `llama.cpp` official C++ shared library with ARM NEON SIMD vector extensions.
- Loads model file via **`mmap` (memory-mapped file I/O)** from app-private storage (`context.filesDir/models/`).
- Enforces context limit conservatively: Default 2048 tokens to keep RAM consumption $\le 550\text{ MB}$.

### 3.3 ModelManager (On-Demand Lifecycle)
- The ~491 MB GGUF file is **NOT bundled inside the APK**.
- ModelManager handles:
  - Background resumeable download with chunking
  - Wi-Fi only toggle
  - SHA-256 cryptographic verification prior to loading
  - State machine: `NOT_INSTALLED` $\rightarrow$ `DOWNLOADING` $\rightarrow$ `VERIFYING` $\rightarrow$ `READY` $\rightarrow$ `LOADING` $\rightarrow$ `RUNNING` $\rightarrow$ `CORRUPTED` $\rightarrow$ `FAILED`
  - Right-to-deletion: Instant one-tap purge of model storage.

### 3.4 ChatrAIRouter (Hybrid Online/Offline Gateway)
```typescript
if (isLocalModelReady && userPermitsLocalAI && isTaskSupportedLocally(task)) {
  return localAIEngine.generate(task);
} else if (isNetworkAvailable) {
  return cloudAIRouter.generate(task); // Fall back to Supabase / OpenAI / Gemini
} else {
  return ruleBasedFallback(task); // Guaranteed offline fallback
}
```

---

## 4. Voice Integration Pipeline

```
Microphone Audio Stream
          │
          ▼
Whisper Tiny English ONNX (~39 MB Native Asset)
          │
          ▼
Raw Transcribed Text
          │
          ▼
ChatrAIRouter
          │
          ▼
Local LLM (Qwen2.5-0.5B Q4_K_M)
          │
          ▼
Agent Context & Structured Tool Selection
          │
          ▼
Local Execution & Speech/Text Output
```

---

## 5. Security & Action Sandboxing

The local model is strictly an **advisory and interpretation layer**. It has **zero direct permission** to mutate state, spend money, or alter settings:
1. The LLM produces an **Action Intent** (`{ type: 'make_payment', amount: 500 }`).
2. The `ActionDispatcher` intercepts the intent, validates user authentication, and renders a native confirmation dialog.
3. The transaction only executes when the **human user clicks 'Confirm'**.
