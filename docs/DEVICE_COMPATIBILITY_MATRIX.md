# CHATR — Device Hardware Compatibility & Execution Matrix
**Version:** 1.0.0  
**Target:** Android (arm64-v8a) via `llama.cpp` + `libllama.so`  
**Base Model:** `CHATR-Local-0.5B-v1` (`Qwen2.5-0.5B-Instruct` Q4_K_M, ~491 MB)

> [!IMPORTANT]
> **Operating Mandate (Phase 11 & 12):**  
> *"CHATR SI OS has completed architectural design and physical proof. Phase 11 is exclusively an evidence-gathering exercise across real Android hardware and real human interaction. No new architecture will be introduced unless empirical evidence demonstrates that the existing architecture cannot satisfy a required production criterion."*

---

## 1. Hardware Tier Classification & Empirical Baseline

To ensure a fluid user experience across both premium flagships and budget smartphones across India and emerging markets, the CHATR SI Engine dynamically configures its runtime parameters into hardware tiers.

### Empirical Minimum-Hardware Baseline (Live Motorola moto e(7) power Run):
- **SoC:** MediaTek MT6762/MT6765 (Octa-Core Cortex-A53 @ 2.0 GHz)
- **RAM:** 3,864 MB (~3.77 GB) | Available under load: 1,825 MB
- **Model:** `CHATR-Local-0.5B-v1` (Qwen2.5-0.5B-Instruct Q4_K_M, 491,400,032 bytes)
- **Measured Cold Load:** 2,223 ms
- **Measured Throughput:** **1.89 tok/s**
- **Empirical Status:**
  - **`Physical Inference: VERIFIED`** (Loaded weights into RAM, ran token generation loop on ARM64 CPU with 0 cloud egress and 0 fallback triggers).
  - **`Performance Target: NOT MET on this device`** (1.89 tok/s vs original target of $\ge 15\text{ tok/s}$).

> [!NOTE]
> **Engineering Characterization:**  
> The 1.89 tok/s result is not an architectural failure—it establishes the empirical lower boundary of the Android hardware ecosystem. On entry-tier Cortex-A53 silicon, CPU-only local LLMs are feasible for selective background tasks and short private queries, but interactive conversational tasks are augmented via fast deterministic logic or cloud models where connectivity and privacy policies permit.

| Hardware Tier | Typical SoCs | RAM Range | Local AI Mode | Expected Throughput | Role in CHATR OS |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier A: Flagship** | Snapdragon 8 Gen 2/3/4<br>Dimensity 9300/9400<br>Tensor G3/G4 | $\ge 12\text{ GB}$ | **Larger Local Model (1.5B–3B)**<br>+ Persistent Cache | $25 - 45\text{ tok/s}$ | Full local reasoning, instant multi-turn dialogue, zero cloud needed |
| **Tier B: Upper-Mid** | Snapdragon 7+ Gen 2 / 7 Gen 3<br>Dimensity 8200 / 8300 | $8\text{ GB} - 12\text{ GB}$ | **Standard Local (0.5B–1B)**<br>3 min keep-alive | $18 - 30\text{ tok/s}$ | Primary local engine for all personal intents & summaries |
| **Tier C: Mid-Range** | Snapdragon 695 / 4 Gen 2<br>Helio G99 / Dimensity 6080 | $6\text{ GB} - 8\text{ GB}$ | **Small Local (0.5B)**<br>60s keep-alive | $8 - 15\text{ tok/s}$ | Fast local summarization & private routing |
| **Tier D: Entry (Characterized)** | Helio P22 / G25 / G85<br>Unisoc T606 / T616 | $4\text{ GB}$ | **Selective / Small Local (0.5B)**<br>Immediate unload | **$1.89\text{ tok/s}$ (Empirical)** | Minimum boundary; background processing, selective offline tasks |
| **Tier S: System AI** | Pixel 8/9, Galaxy S24 (AICore) | Varies | **Google AICore / Gemini Nano** | Hardware NPU accelerated | System-level on-device intelligence via native Android API |
| **Tier E: Unsupported** | 32-bit SoCs (`armeabi-v7a`)<br>Devices with $< 4\text{ GB}$ RAM | $< 4\text{ GB}$ | **Cloud / Heuristic Only** | N/A (Local LLM disabled) | Deterministic regex heuristics + cloud API when online |

---

### Empirical Fleet Hardware Database (Multi-Device Intelligence Runtime Schema)

This table maintains measured empirical evidence across physical devices tested across both **Android System AI (AICore / Gemini Nano)** and **CHATR Native AI (llama.cpp)**:

| # | Physical Device Model | Android OS / API | RAM | SoC / CPU Silicon | AICore Available | Gemini Nano Ready | Native llama.cpp | Selected Runtime Path | TTFT (AICore / Native) | tok/s (Native) | Peak RSS / ΔT | Isolation & Egress |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **Motorola moto e(7) power** | Android 10 (API 29) | 3,864 MB (~3.77 GB) | MediaTek MT6762 (8x A53 @ 2.0GHz) | Unsupported (< API 34) | N/A | **VERIFIED (0.5B GGUF)** | **Path B: Native / Path D: Determ.** | N/A / ~1,200 ms | **1.89 – 2.01 tok/s** | 265 MB PSS (+50MB)<br>ΔT: **+0.6°C** (36.2°C) | Zero Egress ✓ • Airplane Mode ✓ |
| **02** | *Mid-Range (Queue)* | Android 13/14 | 6 GB | Helio G99 / Snapdragon 695 | *Detecting* | *Detecting* | *Supported (0.5B)* | *AICore if avail, else Native* | *Queue* | *Target ≥ 8* | *Queue* | *Pending Test* |
| **03** | *Upper-Mid (Queue)* | Android 14 | 8 GB | Dimensity 7200 / Snapdragon 7 Gen 3 | *Detecting* | *Detecting* | *Supported (0.5B/1B)* | *AICore / Native Hybrid* | *Queue* | *Target ≥ 18* | *Queue* | *Pending Test* |
| **04** | *Flagship (Queue)* | Android 14/15 | 12+ GB | Snapdragon 8 Gen 2/3 / Tensor G3 | *Detecting* | *Detecting* | *Supported (1.5B–3B)* | *AICore / Native Persistent* | *Queue* | *Target ≥ 25* | *Queue* | *Pending Test* |
| **05** | *Pixel 8 / Galaxy S24* | Android 14+ (API 34+) | 8–12 GB | Tensor G3 / Snapdragon 8 Gen 3 | **Supported (AICore)** | **Ready (Gemini Nano)** | **Supported (Fallback)** | **Path A: System AI (Preferred)** | *Hardware NPU* | *NPU Accel.* | 0 MB app RAM | Zero Egress ✓ • OS Managed |

---

## 2. Dynamic Runtime Tuning Parameters

The native Kotlin `LlamaCppEngine` inspects `ActivityManager.MemoryInfo` and `Runtime.getRuntime().availableProcessors()` at runtime to apply these tuning configurations:

```
┌────────────────────────────────────────────────────────┐
│                   DEVICE INITIALIZATION                │
└───────────────────────────┬────────────────────────────┘
                            │ Read SoC, RAM & Thermals
                            ▼
┌────────────────────────────────────────────────────────┐
│             TIER ADAPTATION ENGINE (Native)            │
├─────────────────┬───────────────────┬──────────────────┤
│ Tier A/B        │ Tier C            │ Tier D           │
├─────────────────┼───────────────────┼──────────────────┤
│ Threads: 3 - 4  │ Threads: 2        │ Threads: 1 - 2   │
│ Context: 2048   │ Context: 1536     │ Context: 1024    │
│ Keep-Alive: 180s│ Keep-Alive: 60s   │ Keep-Alive: 0s   │
│ Batch size: 512 │ Batch size: 256   │ Batch size: 128  │
└─────────────────┴───────────────────┴──────────────────┘
```

### Configuration Details:

1. **CPU Thread Allocation**:
   - Never monopolize all CPU cores. A standard 8-core CPU uses at most 4 performance cores for inference to keep UI rendering at 60/120 Hz.
   - On budget devices, inference is restricted to 2 cores to prevent system UI stuttering.

2. **Context Window Scaling**:
   - Tier A/B: Full 2048 tokens ($\sim 48\text{ MB}$ KV Cache).
   - Tier C: 1536 tokens ($\sim 36\text{ MB}$ KV Cache).
   - Tier D: 1024 tokens ($\sim 24\text{ MB}$ KV Cache).

3. **Memory Management & mmap**:
   - On Android, `llama.cpp` maps the GGUF file using `mmap()` with `MAP_SHARED`. The Linux kernel manages paging automatically.
   - When the Android OS experiences memory pressure (`onTrimMemory(TRIM_MEMORY_RUNNING_CRITICAL)`), the engine immediately releases the KV cache and unloads the native context.

---

## 3. Battery, Thermal & Power Safeguards

Running continuous LLM inference can heat the device and rapidly drain battery if unmanaged. The following safeguards are enforced by `OnDeviceAiPlugin.kt`:

### 1. Thermal Throttling Matrix:
| Device Battery / CPU Temp | Action Taken |
| :--- | :--- |
| **$< 38^\circ\text{C}$ (Nominal)** | Full performance allowed at configured tier threads. |
| **$38^\circ\text{C} - 42^\circ\text{C}$ (Warm)** | Drop inference threads by 1. Throttle background agent polling. |
| **$> 42^\circ\text{C}$ (Hot)** | Immediately suspend background SI processing. If user is online, route queries to Cloud AI. If offline, execute deterministic rules. |

### 2. Battery State Management:
- **Battery $< 15\%$ (Low Battery)**:
  - Background call screening and notification interpretation fall back to deterministic regex heuristics.
  - Interactive user queries in chat prompt a warning: *"Running on low battery"*.
- **Android Battery Saver Enabled**:
  - Keep-alive timer forced to 0 seconds (model unloads immediately after answer generation).
  - Background preloading completely disabled.
- **Charging State (AC / Wireless)**:
  - If plugged into power and connected to Wi-Fi, background model updates and embedding index refreshes are permitted.

---

## 4. Storage Space Verification

Before downloading the 491 MB GGUF model, the CHATR application performs a strict free space check:

- **Minimum Required Storage**: **$1.5\text{ GB}$ free internal storage** (3x model size to allow headroom for Android OS operations, app updates, and database indexing).
- If free storage is $< 1.5\text{ GB}$, the download button in Settings shows:  
  *"Requires 1.5 GB free space (Current: X MB). Free up storage to enable offline AI."*

---

## 5. Graceful Degradation & Fallback Hierarchy

At all times, CHATR guarantees that user operations **never fail with a blank screen or crash**:

```
                       USER QUERY / COMMAND
                                │
                                ▼
                   Is Local Model Installed & Ready?
                                │
                    ┌───────────┴───────────┐
                   YES                      NO
                    │                       │
         Are Thermals/RAM Safe?     Is Network Connected?
                    │                       │
            ┌───────┴───────┐        ┌──────┴──────┐
           YES              NO      YES            NO
            │               │        │             │
            ▼               └────► Cloud AI    Regex Heuristic
      Local llama.cpp              (Supabase/     (ChatrBrain
      On-Device Inference          Groq/Gemini)   V1 Fallback)
```

This ensures that whether a user has a ₹6,000 entry smartphone in rural offline mode or a ₹1,20,000 flagship in 5G mode, CHATR responds reliably every time.

---

## 6. Layered Android Intelligence Strategy (The 4 Execution Paths)

A core architectural principle of CHATR is:
> **"The model is replaceable; the user's agent, memory, context graph, tools, and privacy layer are the durable platform."**

Instead of forcing a ~491 MB download on every device, CHATR operates as an **intelligence orchestration layer** that dynamically selects the optimal runtime:

```
                    CHATR PERSONAL AGENT
                           │
                    INTELLIGENCE ROUTER
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   Android AICore     CHATR Native        Cloud AI
   Gemini Nano        llama.cpp          Gemini/OpenAI/etc.
        │                  │                  │
   IF AVAILABLE       IF NEEDED          IF ALLOWED
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    PRIVACY / POLICY
                           │
                    ACTION OS
```

### The Final 4-Runtime Taxonomy:

| Path | Runtime | Purpose |
| :--- | :--- | :--- |
| **Path D** | **Deterministic** | Simple commands, safety logic, and Health OS decisions (No LLM inference required; negligible incremental compute/memory for the specific deterministic operation) |
| **Path A** | **Android System AI** | Gemini Nano / AICore when dynamically detected as actually available and capable |
| **Path B** | **CHATR Native Local Intelligence** | Private / offline local AI via `llama.cpp` when System AI isn't suitable or available |
| **Path C** | **Cloud AI** | Complex / current tasks when permitted by privacy policy and user consent |

### Dynamic Runtime Discovery Pipeline:

> [!IMPORTANT]
> **No Hardcoded Assumptions:**  
> The runtime **never assumes** that a particular Android version (e.g. Android 14+) or specific OEM device always has Gemini Nano ready. It discovers capability dynamically via runtime probing (`AICoreBridge.isAvailable()` and task capability probing).

```
                      Can Android System AI actually execute this task?
                                              │
                                             YES ──► Path A: Android System AI
                                              │      (Gemini Nano / AICore)
                                             NO
                                              ▼
                      Can CHATR Native execute it privately?
                                              │
                                             YES ──► Path B: CHATR Native Local Intelligence
                                              │      (llama.cpp GGUF 0.5B–3B)
                                             NO
                                              ▼
                      Is cloud processing permitted by policy & user?
                                              │
                                             YES ──► Path C: Cloud AI
                                              │      (Sanitized & audited)
                                             NO
                                              ▼
                      Path D: Deterministic / Unavailable Response
```

> [!CAUTION]
> **Inviolable Health OS Boundary:**  
> **Health OS sits strictly above this routing decision for clinical logic.** The LLM provider (whether Gemini Nano, CHATR Native, or Cloud) must never become the authority for a health state. Clinical baseline evaluations, triage algorithms, and emergency P0 alerts are executed deterministically before any natural language formatting occurs.

---

## 7. Human Experience Pilot Protocol (The "Does it Feel Different?" Test)

Now that physical local AI is proven on silicon, CHATR transitions to **empirical human experience validation**.

### The Pilot Directive:
> **Give a real user the phone. Do NOT explain the architecture. Do NOT mention LLMs, GGUF, or ARM64.**

### 5 Real-World Pilot Tasks:
1. **Task 1 (Communication):** *"Tell Rahul we'll meet tomorrow at four."*
2. **Task 2 (Voice Synthesis):** *"Summarize this voice note."*
3. **Task 3 (Health):** *"How has my BP been recently?"*
4. **Task 4 (Caller Screening):** *"Who is calling me?"* (Trigger simulated or incoming unknown call).
5. **Task 5 (Cross-Domain):** *"I'm going to Mumbai next week."*

### 9 Human Observation Vectors (Observational Framework):
The 9 observation vectors are designed to gather real-world behavioral evidence without imposing artificial pass/fail thresholds in this initial pilot cycle:

| Vector | Focus Area | Behavioral Observations Recorded |
| :--- | :--- | :--- |
| **O1** | **Intuitive Input** | Did the user speak/type naturally, or did they hesitate and ask how to prompt? |
| **O2** | **Comprehension** | Did the user understand what CHATR was doing in real time? |
| **O3** | **Suggestion Trust** | Did the user accept, modify, or reject suggested action cards? Record corrections made. |
| **O4** | **Permission Transparency** | Did the user understand why confirmation or biometric access was requested? |
| **O5** | **Friction & Interventions** | Did the user experience unnecessary friction, interruptions, or clarification prompts? |
| **O6** | **App Elimination** | Did the user accomplish the goal within CHATR, or did they open Calendar/WhatsApp/Practo? |
| **O7** | **Privacy Awareness** | Did the user notice and value the on-device local execution badge? |
| **O8** | **Time to Completion** | Exact elapsed seconds from intent to completion vs. traditional multi-app navigation. |
| **O9** | **Voluntary Reuse & Adoption** | Did the user voluntarily return to CHATR for subsequent tasks and begin saying *"CHATR, handle this"*?

### Quantitative Telemetry Logged per Participant:
1. **Task Completion**: `Completed` / `Partially Completed` / `Abandoned`
2. **Time to Completion**: Elapsed seconds per task
3. **Number of Corrections**: Edits made to proposed parameters
4. **Clarification Requests**: Instances where CHATR asked for more info
5. **Unnecessary Interventions**: Moments where user friction was introduced unnecessarily
6. **Permission Understanding**: Binary (`Understood` / `Confused`)
7. **External App Invocations**: Count of external apps opened
8. **Voluntary Reuse**: Count of unprompted subsequent intents
9. **Qualitative User Comments**: Direct verbatim feedback recorded

---

## 8. Permanent Minimalist Front Door: The $\le 3$ Card Invariant

To ensure CHATR never degenerates into a cluttered super-app:
- **Rule:** The front door displays **strictly $\le 3$ actionable cards**.
- **Card 1 (Work/Schedule):** Upcoming meeting briefing or commitment due.
- **Card 2 (Health Baseline):** Personal vitals stability or active alert.
- **Card 3 (Context/Life):** Contextual travel or screening card.
- **Below the Cards:** A single minimal prompt: *"What can I handle?"*
- **Everything Else:** Stays quietly underneath the operating system until summoned by user intent.
