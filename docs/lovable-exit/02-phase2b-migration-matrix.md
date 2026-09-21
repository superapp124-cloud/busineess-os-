# Phase 2B: Function Contract & Provider Migration Matrix

## 1. Executive Summary

This matrix establishes the definitive implementation roadmap for all **64 AI-related functions** in the CHATR system across both repositories.

### Primary Forensic Reality
- **Category A (54 functions):** Fully normalized and verified on the CHATR AI Router (`_core/aiProvider.ts`). Zero Lovable dependencies. 24 active in frontend, 30 internal/background.
- **Dedicated Audio Services (3 functions):** Audited and verified running direct audio models (`transcribe-voice` [OpenAI Whisper], `agent-voice-tts` [OpenAI TTS-1], `live-transcription` [Gemini multimodal audio/webm STT]). Zero Lovable dependencies.
- **Dedicated Realtime Infrastructure (1 function):** Audited and verified issuing direct OpenAI WebRTC session credentials with rate limiting and security event auditing (`realtime-token`). Zero Lovable dependencies.
- **Retired Upstream Functions (6 functions):** Legacy upstream-only functions on `lovable/main`. All confirmed obsolete with 0 local files and 0 frontend callers (`seo-gsc-sync`, `store-call-memory`, `voice-ai-stream`, `voice-stt`, `voice-translate`, `elevenlabs-tts`). Safe to retire.
- **Active Frontend AI Functions Remaining:** **0 functions** (100% migrated).
- **Automated Regression Verification:** **212 / 212 tests passing across Batches 1 to 5.**

---

## 2. Master Migration Matrix (All 64 AI Functions)

| # | Function Name | Repo Presence | Current Provider | Current Secret(s) | Current Method | Target Router Method | Modality | Frontend Callers | Internal / Background | Migration Required? | Compatibility Risk | Verification Test | Rollback Approach |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `chatr-world-ai` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 3 (ChatrWorldBrowser.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 2 | `ai-image-generator` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `generateImage` | `generateImage` | Image / Vision | 2 (AIImageGenerator.tsx) | Active Frontend | **No (Baseline)** | Low | Image URL schema validation | Revert git commit |
| 3 | `translate-message` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 2 (useAISmartReplies.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 4 | `visual-intelligence` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 2 (useVisualIntelligence.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 5 | `ai-message-insights` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (useAIChatAssistant.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 6 | `auto-translate` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (AutoTranslatedMessage.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 7 | `cc-ai-ceo` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (CommandCenter.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 8 | `cc-engineering-agent` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (EngineeringAgentPanel.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 9 | `cc-sales-agent` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (SalesAgentPanel.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 10 | `chatr-brain` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat, streamChat` | `streamChat / completeChat` | LLM (Chat/Reasoning) | 1 (index.ts) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 11 | `chatr-plus-ai-search` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (ChatrPlusSearch.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 12 | `chatr-world` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (ChatrWorld.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 13 | `detect-video-objects` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (useVideoBranding.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 14 | `generate-sticker` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `generateImage` | `generateImage` | Image / Vision | 1 (useAIStickers.tsx) | Active Frontend | **No (Baseline)** | Low | Image URL schema validation | Revert git commit |
| 15 | `health-predictions` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (HealthRiskPredictions.tsx) | Active Frontend | **No (Baseline)** | Medium (Health Prompts) | JSON schema contract test | Revert git commit |
| 16 | `medication-interactions` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (MedicationInteractionsPage.tsx) | Active Frontend | **No (Baseline)** | Medium (Health Prompts) | JSON schema contract test | Revert git commit |
| 17 | `mental-health-assistant` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (MentalHealth.tsx) | Active Frontend | **No (Baseline)** | Medium (Health Prompts) | JSON schema contract test | Revert git commit |
| 18 | `nutrition-tracker` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (NutritionTracker.tsx) | Active Frontend | **No (Baseline)** | Medium (Health Prompts) | JSON schema contract test | Revert git commit |
| 19 | `parse-prescription` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (MedicinePrescriptions.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 20 | `scrape-jobs` | Local only | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (LocalJobs.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 21 | `search-memory` | Local only | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat, generateEmbedding` | `generateEmbedding` | Embedding (Vector) | 1 (communicationMemory.ts) | Active Frontend | **No (Baseline)** | Low | Vector dimension strictly 768 | Revert git commit |
| 22 | `search-suggestions` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (Index.tsx) | Active Frontend | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 23 | `symptom-checker` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (SymptomChecker.tsx) | Active Frontend | **No (Baseline)** | Medium (Health Prompts) | JSON schema contract test | Revert git commit |
| 24 | `visual-search` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `generateImage` | Image / Vision | 1 (VisualSearchUpload.tsx) | Active Frontend | **No (Baseline)** | Low | Image URL schema validation | Revert git commit |
| 25 | `ai-chat-summary` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 26 | `ai-clone-respond` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 27 | `ai-voice-summarize` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 28 | `chatr-shield-pipeline` | Local only | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 29 | `generate-memory-embedding` | Local only | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `generateEmbedding` | `generateEmbedding` | Embedding (Vector) | 0 | Internal / Background | **No (Baseline)** | High (Vector Dimensionality) | Vector dimension strictly 768 | Revert git commit |
| 30 | `perplexity-search` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 31 | `smart-compose` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 32 | `smart-notification-orchestrator` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 33 | `smart-push-engine` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 34 | `summarize-chat` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 35 | `universal-search-engine` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 36 | `web-search-aggregator` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **No (Baseline)** | Low | JSON schema contract test | Revert git commit |
| 37 | `chatr-games-ai` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 7 (EchoChainGame.tsx) | Active Frontend | **COMPLETED (Batch 3)** | Low | JSON schema contract test | Revert git commit |
| 38 | `ai-agent-chat` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `streamChat, completeChat` | `streamChat / completeChat` | LLM (Chat/Reasoning) | 4 (VoiceConversation.tsx) | Active Frontend | **COMPLETED (Batch 2)** | Medium (SSE Streaming) | JSON schema contract test | Revert git commit |
| 39 | `ai-smart-reply` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 4 (useAISmartReplies.tsx) | Active Frontend | **COMPLETED (Batch 1)** | Low | JSON schema contract test | Revert git commit |
| 40 | `ai-chat-assistant` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 3 (useAIChatFeatures.tsx) | Active Frontend | **COMPLETED (Batch 1)** | Low | JSON schema contract test | Revert git commit |
| 41 | `transcribe-voice` | Both repos | Direct OpenAI | `OPENAI_API_KEY` | `none` | `Direct OpenAI (Whisper)` | STT (Transcription) | 3 (VoiceRecorder.tsx) | Active Frontend | **VERIFIED (Batch 3)** | Low | Audio file upload -> text match | Revert git commit |
| 42 | `ai-browser-search` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 2 (AIBrowser.tsx) | Active Frontend | **COMPLETED (Batch 4)** | Low | JSON schema contract test | Revert git commit |
| 43 | `ai-health-assistant` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 2 (AIAssistant.tsx) | Active Frontend | **COMPLETED (Batch 4)** | Medium (Health Prompts) | JSON schema contract test | Revert git commit |
| 44 | `agent-voice-tts` | Both repos | Direct OpenAI | `OPENAI_API_KEY` | `none` | `Direct OpenAI (TTS-1)` | TTS (Speech Synthesis) | 1 (VoiceConversation.tsx) | Active Frontend | **VERIFIED (Batch 3)** | Low | Text payload -> audio/mpeg stream | Revert git commit |
| 45 | `ai-answer` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (UniversalSearch.tsx) | Active Frontend | **COMPLETED (Batch 1)** | Low | JSON schema contract test | Revert git commit |
| 46 | `ai-assistant` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (PrechuAI.tsx) | Active Frontend | **COMPLETED (Batch 2)** | Low | JSON schema contract test | Revert git commit |
| 47 | `ai-coaching` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (useAICoaching.tsx) | Active Frontend | **COMPLETED (Batch 1)** | Low | JSON schema contract test | Revert git commit |
| 48 | `backfill-memory` | Local only | CHATR AI Router | `GEMINI_API_KEY, OPENROUTER_API_KEY` | `generateEmbedding` | `generateEmbedding` | Embedding (Vector) | 1 (communicationMemory.ts) | Active Frontend | **COMPLETED (Batch 4)** | Low | Vector dimension strictly 768 | Revert git commit |
| 49 | `generate-feature` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (FeatureBuilder.tsx) | Active Frontend | **COMPLETED (Batch 4)** | Low | JSON schema contract test | Revert git commit |
| 50 | `live-translate` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (useLiveTranslation.tsx) | Active Frontend | **COMPLETED (Batch 2)** | Low | JSON schema contract test | Revert git commit |
| 51 | `screen-incoming-call` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 1 (CallScreeningOverlay.tsx) | Active Frontend | **COMPLETED (Batch 2)** | Low | JSON schema contract test | Revert git commit |
| 52 | `ai-chat` | Local only | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **COMPLETED (Batch 5)** | Low | JSON schema contract test | Revert git commit |
| 53 | `call-sentiment` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **COMPLETED (Batch 5)** | Low | JSON schema contract test | Revert git commit |
| 54 | `call-summary` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **COMPLETED (Batch 5)** | Low | JSON schema contract test | Revert git commit |
| 55 | `elevenlabs-tts` | Upstream only | Upstream artifact | `None` | `none` | `none` | TTS (Speech Synthesis) | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Confirmed 0 local files & 0 callers | None needed |
| 56 | `generate-questions` | Local only | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **COMPLETED (Batch 5)** | Low | JSON schema contract test | Revert git commit |
| 57 | `live-transcription` | Both repos | Direct Gemini (Multimodal) | `GEMINI_API_KEY, GOOGLE_AI_API_KEY` | `generateContent (inline_data: audio/webm)` | `Direct Gemini (STT)` | STT (Transcription) | 0 | Internal / Background | **VERIFIED (Batch 5)** | Low | Multimodal base64 audio validation | Revert git commit |
| 58 | `realtime-token` | Both repos | Direct OpenAI Realtime API | `OPENAI_API_KEY` | `POST /v1/realtime/sessions` | `Direct OpenAI (Realtime)` | WebRTC Session Minting | 0 | Internal / Background | **VERIFIED (Batch 5)** | Low | WebRTC session token minting test | Revert git commit |
| 59 | `universal-ai-search` | Both repos | CHATR AI Router | `GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY` | `completeChat` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **COMPLETED (Batch 5)** | Low | JSON schema contract test | Revert git commit |
| 60 | `seo-gsc-sync` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | LLM / SEO | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by local `gsc-sync` | None needed |
| 61 | `store-call-memory` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | LLM (Memory) | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by triggers & `search-memory` | None needed |
| 62 | `voice-ai-stream` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | LLM (SSE Stream) | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by local `ai-agent-chat` | None needed |
| 63 | `voice-stt` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | STT (Transcription) | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by local `transcribe-voice` | None needed |
| 64 | `voice-translate` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | LLM (Translation) | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by local `live-translate` | None needed |

---

## 3. Incremental Normalization Plan (Category B: 23 Functions)

Rather than migrating all 23 functions simultaneously, normalization into `_core/aiProvider.ts` proceeded in controlled batches of 3–5 functions with automated contract verification after each batch.

### Batch 1: High-Frequency Messaging & Copilots (4 Active Functions) — 🟢 COMPLETED
- `ai-smart-reply` (4 callers) -> Normalized to `completeChat()` (router-owned provider fallback)
- `ai-chat-assistant` (3 callers) -> Normalized to `completeChat()` (preserving action-based and prompt-based paths)
- `ai-answer` (1 caller) -> Normalized to `completeChat()` (preserving classifier and factual summary prompts)
- `ai-coaching` (1 caller) -> Normalized to `completeChat()` (preserving `CoachingResponse` schema)
- *Contract Tests:* 31/31 tests passed (`scratch/batch1_contract_tests.cjs`).

### Batch 2: Realtime Agent & Live Communications (4 Active Functions) — 🟢 COMPLETED
- `ai-agent-chat` (4 callers) -> Normalized to `streamChat()` SSE streaming + `completeChat()` JSON fallback
- `live-translate` (1 caller) -> Normalized to `completeChat()`
- `screen-incoming-call` (1 caller) -> Normalized fallback to local rules + `completeChat()`
- `ai-assistant` (1 caller) -> Normalized to `completeChat()`
- *Contract Tests:* 33/33 tests passed (`scratch/batch2_contract_tests.cjs`). Cumulative tests passed: 64/64.

### Batch 3: Audio & Games (3 Active Functions) — 🟢 COMPLETED
- `chatr-games-ai` (7 callers) -> Normalized to `completeChat()` with 0.3 temperature, all 16 game actions preserved, router fallback active.
- `transcribe-voice` (3 callers) -> Verified direct OpenAI Whisper STT with dual base64 and audioUrl input support and 400 validation.
- `agent-voice-tts` (1 caller) -> Verified direct OpenAI TTS-1 synthesis with browser fallback, personality mapping, and 400 validation.
- *Contract Tests:* 24/24 tests passed (`scratch/batch3_contract_tests.cjs`). Cumulative tests passed: 88/88.

### Batch 4: Health & Specialized Intelligence (4 Active Functions) — 🟢 COMPLETED
- `ai-health-assistant` (2 callers) -> Normalized to `completeChat()`, clinical triage prompts and disclaimers preserved byte-for-byte.
- `ai-browser-search` (2 callers) -> Preserved all search providers, routed LLM synthesis through `completeChat()`.
- `generate-feature` (1 caller) -> Normalized to `completeChat()` in parallel, all code generation prompts and response contract preserved.
- `backfill-memory` (1 caller) -> Normalized to `generateEmbedding()` strictly frozen at 768 dimensions (`text-embedding-004`), zero vector/schema modifications.
- *Contract Tests:* 33/33 tests passed (`scratch/batch4_contract_tests.cjs`). Cumulative tests passed: 121/121.

### Batch 5: Internal / Background / Cron (8 Functions) — 🟢 COMPLETED
- `ai-chat` (0 callers) -> Normalized to `completeChat()`, 400 validation on empty messages, `PlatformError` propagation.
- `call-sentiment` (0 callers) -> Normalized to `completeChat()` with 0.3 temperature, sentiment & emotion prompts preserved, keyword heuristic fallback preserved.
- `call-summary` (0 callers) -> Normalized to `completeChat()` with 0.3 temperature, prompt & schema preserved, database updates to `calls.quality_metrics` preserved.
- `generate-questions` (0 callers) -> Normalized to `completeChat()` with 0.7 temperature, all 5 prompt categories (sales, recruitment, clinic, general, insights) and response formats preserved.
- `universal-ai-search` (0 callers) -> Normalized to `completeChat()` with 0.3 temperature, search intent prompt and heuristic fallback preserved.
- `live-transcription` (0 callers) -> Verified direct Gemini multimodal audio STT (`inline_data: audio/webm`), `call_transcriptions` DB updates preserved.
- `realtime-token` (0 callers) -> Verified direct OpenAI Realtime WebRTC session credentials minting (`/v1/realtime/sessions`), rate limiting, and security audit event logging preserved.
- `elevenlabs-tts` (0 callers) -> Confirmed retired upstream artifact (0 local files, 0 frontend callers).
- *Contract Tests:* 91/91 tests passed (`scratch/batch5_contract_tests.cjs`). Cumulative tests passed: 212/212.

---

## 4. Category C Retirement Analysis (RETIRED — NOT MIGRATED: 6 Functions)

For the historical Lovable-exit audit trail, the following 6 functions are documented as **RETIRED — NOT MIGRATED**:
1. **`seo-gsc-sync`:** Legacy upstream function dependent on `LOVABLE_API_KEY` and `connector-gateway.lovable.dev`. Superseded by local `gsc-sync` which uses direct Google OAuth service accounts. 0 frontend callers.
2. **`store-call-memory`:** Legacy upstream function dependent on `LOVABLE_API_KEY`. Superseded by local database triggers on `communication_memory` and `search-memory`. 0 frontend callers.
3. **`voice-ai-stream`:** Legacy upstream function dependent on `ai.gateway.lovable.dev`. Superseded by local `ai-agent-chat` SSE streaming engine. 0 frontend callers.
4. **`voice-stt`:** Legacy upstream function dependent on `ai.gateway.lovable.dev`. Superseded by local `transcribe-voice` running OpenAI Whisper directly. 0 frontend callers.
5. **`voice-translate`:** Legacy upstream function dependent on `ai.gateway.lovable.dev`. Superseded by local `live-translate` and `auto-translate`. 0 frontend callers.
6. **`elevenlabs-tts`:** Legacy upstream TTS proxy on `lovable/main`. Confirmed 0 local files, 0 frontend callers in `src/`. Superseded by local `agent-voice-tts` running OpenAI TTS-1.

**Auditable Status:** None of these 6 functions will be restored to the local workspace. They remain historical artifacts on `lovable/main`.
