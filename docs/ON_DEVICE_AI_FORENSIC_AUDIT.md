# CHATR — On-Device AI Forensic Audit
**Document Version:** 1.0.0  
**Audit Timestamp:** 2026-09-28  
**Scope:** Complete repository inspection of Android native, Capacitor, TypeScript services, agent contracts, models, permissions, and inference runtimes.

---

## 1. Executive Summary

This forensic audit analyzes the entire CHATR / CHATR+ codebase to establish the exact baseline for on-device AI integration.

### Core Finding
**CHATR already contains well-architected agent contracts, intent routers, action dispatchers, and native Android modules, but it does NOT currently have an operational on-device generative Large Language Model (LLM) installed.**

- The current installed app size (~267–277 MB) consists of native WebRTC engines, Capacitor plugins, media assets, resources, and one real local speech-to-text neural network: **Whisper Tiny English ONNX (~39 MB)**.
- The existing on-device agent subsystem (`src/services/chatrBrain/`) currently executes via **regex pattern matching, keyword scoring, and template responses**.
- The existing native Google MediaPipe Gemma bridge (`com.google.mediapipe:tasks-genai:0.10.21`) exists in code, but **no model file is bundled or downloaded**; on execution, it immediately falls back to heuristic string truncations.
- Cloud AI (OpenAI, Groq, Gemini) is accessible via Supabase Edge Functions.

---

## 2. Forensic Findings Across 14 Architectural Dimensions

### 2.1 Existing AI Architecture
- **Location:** [`src/services/chatrBrain/`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/)
- **Core Orchestrators:**
  - [`brain.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/brain.ts): Main pipeline coordinating intent detection, master routing, agent processing, and action execution.
  - [`masterRouter.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/masterRouter.ts): Evaluates query urgency and keyword weights across six agent domains (`personal`, `work`, `search`, `local`, `jobs`, `health`).
  - [`intentRouter.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/intentRouter.ts): Regex and pattern-based classification of user intent into primary categories and required actions.
  - [`interAgentBus.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/interAgentBus.ts): Event bus facilitating inter-agent handoffs, multi-agent collaboration, and shared message dispatch.
- **Limitation:** The agents themselves currently lack neural reasoning. They output hardcoded string responses (e.g. `PersonalAIAgent.buildMessage()`).

### 2.2 Existing Agent Contracts
- **Location:** [`src/services/chatrBrain/agentContracts.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/agentContracts.ts)
- Every agent is governed by an explicit `AgentContract`:
  - **`personal`**: Habits, preferences, reminders, daily routines (`friendly` tone, max 500 chars).
  - **`work`**: Meetings, calendar, deadlines, documents (`professional` tone, max 800 chars).
  - **`search`**: Facts, explanation, research, news (`neutral` tone, sources required).
  - **`local`**: Nearby businesses, services, plumbers, restaurants (`helpful` tone).
  - **`jobs`**: Vacancies, salaries, interview prep, resumes (`professional` tone).
  - **`health`**: Doctor appointments, vital triage, medication reminders (`empathetic` tone, safety escalation).
- **Audit Assessment:** These contracts are already production-grade. They define `allowedActions`, `vocabulary.mustUse`, `vocabulary.mustAvoid`, `responseLimits`, `escalationRules`, and `handoffRules`. They are ready to serve directly as system prompts and JSON schema constraints for a single local GGUF model.

### 2.3 Existing Tool Contracts & Action Dispatcher
- **Location:** [`src/services/chatrBrain/actionDispatcher.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/actionDispatcher.ts) and [`actionsEngine.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/actionsEngine.ts)
- Defined Action Types:
  - `book_appointment` (`/chatr-world/healthcare`)
  - `apply_job` (`/chatr-world/jobs`)
  - `order_food` (`/chatr-world/food`)
  - `make_payment` (`/chatr-wallet`)
  - `save_contact` (`/contacts`)
  - `set_reminder` (`/reminders`)
  - `file_complaint` (`/support`)
  - `call_service` (`/call`)
  - `navigate` (`/maps`)
- **Security Boundary:** The action dispatcher validates `requiredFields` and prepares transactions for user approval. The AI generates the proposed action, but **never directly mutates funds or executes without user confirmation**.

### 2.4 Existing Local Inference Interfaces
- **TypeScript Layer:** [`src/lib/onDeviceAI.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/lib/onDeviceAI.ts) defines `OnDeviceAiPlugin` with `checkAvailability()` and `generate()`.
- **Android Native Plugin:** [`OnDeviceAiPlugin.kt`](file:///c:/Users/Arshid.Wani/chatrchat/android/app/src/main/java/com/chatr/app/plugins/OnDeviceAiPlugin.kt) connects Capacitor to native `ChatrAIRouter`.
- **Audit Assessment:** The bridge between TypeScript and Android native Java/Kotlin is clean and functioning. It provides the exact hook where `LocalAIEngine` will interface.

### 2.5 Existing Cloud AI Interfaces
- **Web App Assist:** [`src/pages/AIAssistant.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/AIAssistant.tsx) invokes Supabase edge function `ai-health-assistant`.
- **Chat Helpers:** Smart reply generation and chat summarization call Supabase edge functions or fall back to extractive heuristic rules.
- **Provider Multi-Tenancy:** Backed by OpenAI, Groq, and Gemini API keys configured in Supabase environment secrets.

### 2.6 Existing Whisper Speech-to-Text Implementation
- **Assets:** `android/app/src/main/assets/whisper/whisper-tiny-en.onnx` (~39 MB).
- **Download Automation:** `scripts/download-whisper.js` handles local postinstall verification.
- **Usage:** Voice vitals logging ([`HealthVoiceParser.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/health/HealthVoiceParser.ts)) and phone call transcription ([`GsmAiAssistant.kt`](file:///c:/Users/Arshid.Wani/chatrchat/android/chatrai/src/main/kotlin/ai/chatr/gsm/ai/GsmAiAssistant.kt)).
- **Audit Assessment:** Whisper is fully operational offline and should be preserved as the front-end speech input layer for the local LLM.

### 2.7 Existing Gemma Implementation
- **Dependencies:** `com.google.mediapipe:tasks-genai:0.10.21` in [`android/app/build.gradle.kts`](file:///c:/Users/Arshid.Wani/chatrchat/android/app/build.gradle.kts#L158).
- **Native Implementation:** [`OnDeviceGemma.kt`](file:///c:/Users/Arshid.Wani/chatrchat/android/app/src/main/java/com/chatr/app/ondeviceai/OnDeviceGemma.kt) wraps `LlmInference.createFromOptions(context, options)`.
- **Router Hook:** [`ChatrAIRouter.kt`](file:///c:/Users/Arshid.Wani/chatrchat/android/app/src/main/java/com/chatr/app/ondeviceai/ChatrAIRouter.kt#L17) checks for `File(context.filesDir, "llm/gemma3-1b-it-int4-v1.task")`.
- **Why It Fails Today:**
  1. The `.task` file (~1.5 GB) is not bundled (which is correct—bundling it would make the APK 1.8 GB).
  2. No dynamic download manager exists to pull the file after installation.
  3. `checkNanoAvailability()` hardcodes `return false`.
  4. MediaPipe `.task` format is proprietary and incompatible with standard GGUF or open fine-tuning toolchains.

### 2.8 Existing Android Native Architecture
- **Compilation:** Gradle 8.x with Kotlin 1.9, Java 17 compatibility.
- **11 Native Compiled Modules:**
  1. `:gsmcore` (GSM telephony abstraction)
  2. `:audioprocessing` (Call audio filtering)
  3. `:calloverlay` (System alert window UI)
  4. `:callscreening` (Active call interception)
  5. `:callsummary` (Post-call analysis)
  6. `:calltranscription` (Real-time audio streaming)
  7. `:chatrai` (SI Assistant hooks)
  8. `:chatrshield` (Real-time scam scoring)
  9. `:gsmsettings` (Telephony preferences)
  10. `:scamdetection` (Number and caller heuristic analysis)
  11. `:smartdialer` (In-call T9 and dialer engine)
- **NDK Readiness:** Modern Android NDK with `jniLibs.useLegacyPackaging = true` already configured in Gradle.

### 2.9 Existing Model Loading Paths & Filesystem
- **App Private Storage:** `context.filesDir` (e.g., `/data/user/0/com.chatr.app/files/`).
- **Asset Directory:** `android/app/src/main/assets/` contains Whisper models.
- **Audit Assessment:** The local LLM must be placed in `context.filesDir/models/` to respect Android 10+ scoped storage restrictions and prevent external tampering.

### 2.10 Existing Permissions
- **Manifest:** [`AndroidManifest.xml`](file:///c:/Users/Arshid.Wani/chatrchat/android/app/src/main/AndroidManifest.xml)
- **Key Permissions Already Granted:**
  - `RECORD_AUDIO` (Required for voice input)
  - `FOREGROUND_SERVICE` and `FOREGROUND_SERVICE_PHONE_CALL`
  - `INTERNET` and `ACCESS_NETWORK_STATE` (For model download and cloud fallback)
  - `WAKE_LOCK` (To prevent sleep during local token generation)
  - `android:largeHeap="true"` (Crucial: gives JVM/NDK heap up to 512 MB+)
- **Audit Assessment:** Zero new dangerous permissions are required to introduce `llama.cpp` and local GGUF execution.

### 2.11 Existing Storage Subsystems
- **Local SQLite:** `better-sqlite3` on desktop, `RoomDatabase` (`androidx.room:room-runtime:2.6.1`) on Android.
- **Local Store:** `LocalHealthStore.ts` (localStorage / memory backed).
- **Audit Assessment:** Memory and cache systems are decoupled from network connectivity.

### 2.12 Existing Notification Architecture
- **Engine:** [`AttentionEngine.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/health/AttentionEngine.ts) + [`NotificationDecisionEngine`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/health/AttentionEngine.ts#L228).
- **Fatigue Tracking:** Daily budget, quiet hours, cooldowns, urgency bypass ($P0$ safety bypasses quiet hours).
- **Integration Point:** The local LLM will act as an evaluator for ambiguous notifications, summarizing them without cloud transmission.

### 2.13 Existing Memory Architecture
- **Location:** [`src/services/chatrBrain/memoryLayer.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/memoryLayer.ts) and [`HealthMemoryService.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/health/HealthMemoryService.ts).
- Provides short-term session recall, long-term preference storage (`memoryLayer.inferPreference`), and factual longitudinal timelines.
- **Audit Assessment:** The local model will NOT store personal user facts in its weights; it queries `memoryLayer` and `LocalHealthStore` via tool-calling.

### 2.14 Existing Health OS Integration
- **Contracts:** [`HealthOSContract.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/health/core/HealthOSContract.ts) (v1.0.0 Frozen).
- **Safety Spec:** Engineered Clinical Guideline Spec `2026.1`.
- **Audit Assessment:** Health state calculation, anomaly triage, and clinical overrides remain 100% deterministic inside `HealthEventEvaluator` and `HealthStateEngine`. The local LLM will interpret and explain these results, but will **never override clinical safety flags**.

---

## 3. Forensic Conclusion

| Target Capability | Feasibility | Selected Technology |
| :--- | :--- | :--- |
| **Local LLM Model** | Verified Feasible | **Qwen2.5-0.5B-Instruct (Q4_K_M)** (~491 MB file, ~550 MB RAM) |
| **Development Environment** | Verified Feasible | **Ollama** (Desktop/Dev only for fine-tuning, prompt testing, GGUF export) |
| **Production Mobile Engine** | Verified Feasible | **llama.cpp** (Compiled via Android NDK as `libllama.so` with ARM NEON) |
| **Model Distribution** | Verified Feasible | **On-demand resumeable download** to `context.filesDir/models/` with SHA-256 validation |
| **Agent Integration** | Verified Feasible | **ONE Master Local Model** serving all 6 ChatrBrain agents via structured JSON tool routing |
