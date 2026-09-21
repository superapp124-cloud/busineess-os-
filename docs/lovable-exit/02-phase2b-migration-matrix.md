# Phase 2B: Function Contract & Provider Migration Matrix

## 1. Executive Summary

This matrix establishes the definitive implementation roadmap for all **64 AI-related functions** in the CHATR system across both repositories.

### Primary Forensic Reality
- **Category A (36 functions):** Already migrated to the CHATR AI Router (`_core/aiProvider.ts`). Zero Lovable dependencies. 24 active in frontend, 12 internal.
- **Category B (23 functions):** Direct-provider functions that bypass Lovable, but need router normalization. **15 are active in the frontend** (Tier 1 Priority), 8 are internal (Tier 2).
- **Category C (5 functions):** Legacy Lovable-dependent functions on `lovable/main`. **All 5 are confirmed obsolete/superseded** by local implementations with 0 frontend callers. Safe to retire.

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
| 42 | `ai-browser-search` | Both repos | Direct Gemini | `GEMINI_API_KEY, GROQ_API_KEY, BRAVE_SEARCH_API_KEY, SERPER_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 2 (AIBrowser.tsx) | Active Frontend | **YES (Batch Priority)** | Low | JSON schema contract test | Revert git commit |
| 43 | `ai-health-assistant` | Both repos | Direct OpenRouter | `OPENROUTER_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 2 (AIAssistant.tsx) | Active Frontend | **YES (Batch Priority)** | Medium (Health Prompts) | JSON schema contract test | Revert git commit |
| 44 | `agent-voice-tts` | Both repos | Direct OpenAI | `OPENAI_API_KEY` | `none` | `Direct OpenAI (TTS-1)` | TTS (Speech Synthesis) | 1 (VoiceConversation.tsx) | Active Frontend | **VERIFIED (Batch 3)** | Low | Text payload -> audio/mpeg stream | Revert git commit |
| 45 | `ai-answer` | Both repos | Direct OpenRouter | `OPENROUTER_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 1 (UniversalSearch.tsx) | Active Frontend | **YES (Batch Priority)** | Low | JSON schema contract test | Revert git commit |
| 46 | `ai-assistant` | Both repos | Direct Gemini | `GEMINI_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 1 (PrechuAI.tsx) | Active Frontend | **YES (Batch Priority)** | Low | JSON schema contract test | Revert git commit |
| 47 | `ai-coaching` | Both repos | Direct Gemini | `GEMINI_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 1 (useAICoaching.tsx) | Active Frontend | **YES (Batch Priority)** | Low | JSON schema contract test | Revert git commit |
| 48 | `backfill-memory` | Local only | Direct Custom/Rules | `None` | `none` | `generateEmbedding` | Embedding (Vector) | 1 (communicationMemory.ts) | Active Frontend | **YES (Batch Priority)** | Low | Vector dimension strictly 768 | Revert git commit |
| 49 | `generate-feature` | Both repos | Direct OpenAI | `OPENAI_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 1 (FeatureBuilder.tsx) | Active Frontend | **YES (Batch Priority)** | Low | JSON schema contract test | Revert git commit |
| 50 | `live-translate` | Both repos | Direct Gemini | `GEMINI_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 1 (useLiveTranslation.tsx) | Active Frontend | **YES (Batch Priority)** | Low | JSON schema contract test | Revert git commit |
| 51 | `screen-incoming-call` | Both repos | Direct Custom/Rules | `None` | `none` | `completeChat` | LLM (Chat/Reasoning) | 1 (CallScreeningOverlay.tsx) | Active Frontend | **YES (Batch Priority)** | Low | JSON schema contract test | Revert git commit |
| 52 | `ai-chat` | Local only | Direct OpenAI | `OPENAI_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **YES (Secondary)** | Low | JSON schema contract test | Revert git commit |
| 53 | `call-sentiment` | Both repos | Direct Gemini | `GEMINI_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **YES (Secondary)** | Low | JSON schema contract test | Revert git commit |
| 54 | `call-summary` | Both repos | Direct Gemini | `GEMINI_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **YES (Secondary)** | Low | JSON schema contract test | Revert git commit |
| 55 | `elevenlabs-tts` | Upstream only | Direct Custom/Rules | `None` | `none` | `Direct OpenAI (TTS-1)` | TTS (Speech Synthesis) | 0 | Internal / Background | **YES (Secondary)** | Low | Text payload -> audio/mpeg stream | Revert git commit |
| 56 | `generate-questions` | Local only | Direct OpenRouter | `OPENROUTER_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **YES (Secondary)** | Low | JSON schema contract test | Revert git commit |
| 57 | `live-transcription` | Both repos | Direct Gemini | `GEMINI_API_KEY` | `none` | `Direct OpenAI (Whisper)` | STT (Transcription) | 0 | Internal / Background | **YES (Secondary)** | Low | Audio file upload -> text match | Revert git commit |
| 58 | `realtime-token` | Both repos | Direct OpenAI | `OPENAI_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **YES (Secondary)** | Low | JSON schema contract test | Revert git commit |
| 59 | `universal-ai-search` | Both repos | Direct OpenRouter | `OPENROUTER_API_KEY` | `none` | `completeChat` | LLM (Chat/Reasoning) | 0 | Internal / Background | **YES (Secondary)** | Low | JSON schema contract test | Revert git commit |
| 60 | `seo-gsc-sync` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | LLM / SEO | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by local `gsc-sync` | None needed |
| 61 | `store-call-memory` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | LLM (Memory) | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by triggers & `search-memory` | None needed |
| 62 | `voice-ai-stream` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | LLM (SSE Stream) | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by local `ai-agent-chat` | None needed |
| 63 | `voice-stt` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | STT (Transcription) | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by local `transcribe-voice` | None needed |
| 64 | `voice-translate` | Upstream only | Lovable AI Gateway (Upstream) | `LOVABLE_API_KEY` | `none` | `none` | LLM (Translation) | 0 | Retired Upstream | **RETIRED — NOT MIGRATED** | N/A | Superseded by local `live-translate` | None needed |

---

## 3. Incremental Normalization Plan (Category B: 23 Functions)

Rather than migrating all 23 functions simultaneously, normalization into `_core/aiProvider.ts` will proceed in controlled batches of 3–5 functions with automated contract verification after each batch.

### Batch 1: High-Frequency Messaging & Copilots (4 Active Functions)
- `ai-smart-reply` (4 callers) -> Normalize to `completeChat()` (router-owned provider fallback)
- `ai-chat-assistant` (3 callers) -> Normalize to `completeChat()` (preserving action-based and prompt-based paths)
- `ai-answer` (1 caller) -> Normalize to `completeChat()` (preserving classifier and factual summary prompts)
- `ai-coaching` (1 caller) -> Normalize to `completeChat()` (preserving `CoachingResponse` schema)
- *Acceptance:* Strict JSON contract match with existing UI hooks, identical prompts, zero frontend changes.

### Batch 2: Realtime Agent & Live Communications (4 Active Functions)
- `ai-agent-chat` (4 callers) -> Normalize to `streamChat()` SSE streaming
- `live-translate` (1 caller) -> Normalize to `completeChat()`
- `screen-incoming-call` (1 caller) -> Normalize fallback to local rules
- `ai-assistant` (1 caller) -> Normalize to `completeChat()`
- *Acceptance:* SSE stream chunking verification on mobile/web clients.

### Batch 3: Audio & Games (3 Active Functions) — 🟢 COMPLETED
- `chatr-games-ai` (7 callers) -> Normalized to `completeChat()` with 0.3 temperature, all 16 game actions preserved, router fallback active.
- `transcribe-voice` (3 callers) -> Verified direct OpenAI Whisper STT with dual base64 and audioUrl input support and 400 validation.
- `agent-voice-tts` (1 caller) -> Verified direct OpenAI TTS-1 synthesis with browser fallback, personality mapping, and 400 validation.
- *Contract Tests:* 24/24 tests passed (`scratch/batch3_contract_tests.cjs`). Cumulative tests passed: 88/88.

### Batch 4: Health & Specialized Intelligence (4 Active Functions)
- `ai-health-assistant` (2 callers) -> Normalize to `completeChat()` (strictly preserving clinical prompts and disclaimers byte-for-byte)
- `ai-browser-search` (2 callers) -> Direct Serper/Groq/Gemini synthesis
- `generate-feature` (1 caller) -> Normalize to `completeChat()`
- `backfill-memory` (1 caller) -> Strictly frozen at 768 dimensions (`text-embedding-004`)
- *Strict Embedding Freeze:* Prohibits changing embedding model, changing vector dimensions, re-embedding existing records, changing similarity operators, or altering vector indexes.

### Batch 5: Internal / Background / Cron (8 Functions)
- `ai-chat`, `call-sentiment`, `call-summary`, `elevenlabs-tts`, `generate-questions`, `live-transcription`, `realtime-token`, `universal-ai-search`.
- *Acceptance:* Background queue execution tests.

---

## 4. Category C Retirement Analysis (RETIRED — NOT MIGRATED: 5 Functions)

For the historical Lovable-exit audit trail, the following 5 functions are documented as **RETIRED — NOT MIGRATED**:
1. **`seo-gsc-sync`:** Legacy upstream function dependent on `LOVABLE_API_KEY` and `connector-gateway.lovable.dev`. Superseded by local `gsc-sync` which uses direct Google OAuth service accounts. 0 frontend callers.
2. **`store-call-memory`:** Legacy upstream function dependent on `LOVABLE_API_KEY`. Superseded by local database triggers on `communication_memory` and `search-memory`. 0 frontend callers.
3. **`voice-ai-stream`:** Legacy upstream function dependent on `ai.gateway.lovable.dev`. Superseded by local `ai-agent-chat` SSE streaming engine. 0 frontend callers.
4. **`voice-stt`:** Legacy upstream function dependent on `ai.gateway.lovable.dev`. Superseded by local `transcribe-voice` running OpenAI Whisper directly. 0 frontend callers.
5. **`voice-translate`:** Legacy upstream function dependent on `ai.gateway.lovable.dev`. Superseded by local `live-translate` and `auto-translate`. 0 frontend callers.

**Auditable Status:** None of these 5 functions will be restored to the local workspace. They remain historical artifacts on `lovable/main`.
