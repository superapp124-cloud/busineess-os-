# Phase 2A: Lovable AI Gateway Forensic Inventory

## 1. Executive Summary

This document establishes the authoritative, verified inventory of all Supabase Edge Functions across the CHATR estate. The data is generated from AST analysis comparing:
1. The legacy Lovable upstream branch (`chatr4661-cell/chatr`, branch `lovable/main`)
2. The decoupled local branch (`superapp124-cloud/busineess-os-`, branch `chore/lovable-exit`)
3. Static caller tracing differentiating **Confirmed Invocation Sites** (`supabase.functions.invoke()` and `/functions/v1/<fn>`) from loose string references across all 3,078 client files in `src/`.

Raw dataset: [`scratch/exact_recon.json`](file:///C:/Users/Arshid.Wani/.gemini/antigravity/brain/dd2c6d83-6ca5-49d5-84c3-7a8be1531fca/scratch/exact_recon.json).

---

## 2. Reconciled Global Counts

```text
====================================================
   CHATR PHASE 2A: AUTHORITATIVE INVENTORY
====================================================

=== EXACT TOTAL COUNTS ===
Total unique functions across both repos:            149
Functions present in local workspace:                137
Functions present in lovable/main:                   120
Total AI-related functions:                          64
Total Non-AI functions:                              85
Functions with Confirmed Invocation Sites:           50
AI functions with Confirmed Invocation Sites:        39

=== LOVABLE GATEWAY DEPENDENCY ===
Functions in lovable/main calling ai.gateway.lovable.dev: 39
Functions in lovable/main reading LOVABLE_API_KEY:        40
Functions in local workspace calling Lovable gateway:     0
Functions in local workspace reading LOVABLE_API_KEY:     0

=== 4-TIER ARCHITECTURAL CLASSIFICATION ===
Category A — Already Independent (Uses _core/aiProvider.ts): 36 functions
  * Confirmed Invocation in Frontend: 24
  * Internal / Background / Trigger:  12

Category B — Direct-Provider (Needs Router Normalization):   23 functions
  * Confirmed Invocation in Frontend: 15
  * Internal / Background / Trigger:  8

Category C — Requires Migration (Legacy Upstream Only):       5 functions
  * Present in Local Workspace: 0
  * In lovable/main only (superseded locally): 5
  * Confirmed Invocation in Frontend: 0

Category D — Non-AI / Unrelated (No migration needed):       85 functions
```

---

## 3. Router Method Breakdown (Category A: 36 Functions)

The 36 functions already migrated to [`supabase/functions/_core/aiProvider.ts`](file:///c:/Users/Arshid.Wani/chatrchat/supabase/functions/_core/aiProvider.ts) dynamically invoke:

| Router Method | Count | Dynamically Detected Function Names |
|---|---|---|
| `completeChat()` | **33** | `ai-chat-summary`, `ai-clone-respond`, `ai-message-insights`, `ai-voice-summarize`, `auto-translate`, `cc-ai-ceo`, `cc-engineering-agent`, `cc-sales-agent`, `chatr-brain`, `chatr-plus-ai-search`, `chatr-shield-pipeline`, `chatr-world`, `chatr-world-ai`, `detect-video-objects`, `health-predictions`, `medication-interactions`, `mental-health-assistant`, `nutrition-tracker`, `parse-prescription`, `perplexity-search`, `scrape-jobs`, `search-memory`, `search-suggestions`, `smart-compose`, `smart-notification-orchestrator`, `smart-push-engine`, `summarize-chat`, `symptom-checker`, `translate-message`, `universal-search-engine`, `visual-intelligence`, `visual-search`, `web-search-aggregator` |
| `streamChat()` | **1** | `chatr-brain` |
| `generateEmbedding()` | **2** | `generate-memory-embedding`, `search-memory` |
| `generateImage()` | **2** | `ai-image-generator`, `generate-sticker` |

---

## 4. Category A: Already Independent (Confirmed Frontend Invocations — 24 Functions)

| Function Name | Router Method | Confirmed Invocation Sites | Primary Invocation Site |
|---|---|---|---|
| `ai-image-generator` | `generateImage` | 2 | [`src/components/chat/AIImageGenerator.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/chat/AIImageGenerator.tsx) |
| `ai-message-insights` | `completeChat` | 1 | [`src/hooks/useAIChatAssistant.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useAIChatAssistant.tsx) |
| `auto-translate` | `completeChat` | 1 | [`src/components/AutoTranslatedMessage.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/AutoTranslatedMessage.tsx) |
| `cc-ai-ceo` | `completeChat` | 1 | [`src/pages/CommandCenter.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/CommandCenter.tsx) |
| `cc-engineering-agent` | `completeChat` | 1 | [`src/components/command-center/EngineeringAgentPanel.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/command-center/EngineeringAgentPanel.tsx) |
| `cc-sales-agent` | `completeChat` | 1 | [`src/components/command-center/SalesAgentPanel.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/command-center/SalesAgentPanel.tsx) |
| `chatr-brain` | `completeChat`, `streamChat` | 1 | [`src/services/chatrBrain/index.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/services/chatrBrain/index.ts) |
| `chatr-plus-ai-search` | `completeChat` | 1 | [`src/pages/ChatrPlusSearch.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/ChatrPlusSearch.tsx) |
| `chatr-world` | `completeChat` | 1 | [`src/pages/ChatrWorld.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/ChatrWorld.tsx) |
| `chatr-world-ai` | `completeChat` | 3 | [`src/components/chatr-world/ChatrWorldBrowser.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/chatr-world/ChatrWorldBrowser.tsx) |
| `detect-video-objects` | `completeChat` | 1 | [`src/hooks/useVideoBranding.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useVideoBranding.tsx) |
| `generate-sticker` | `generateImage` | 1 | [`src/hooks/useAIStickers.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useAIStickers.tsx) |
| `health-predictions` | `completeChat` | 1 | [`src/pages/HealthRiskPredictions.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/HealthRiskPredictions.tsx) |
| `medication-interactions` | `completeChat` | 1 | [`src/pages/MedicationInteractionsPage.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/MedicationInteractionsPage.tsx) |
| `mental-health-assistant` | `completeChat` | 1 | [`src/pages/MentalHealth.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/MentalHealth.tsx) |
| `nutrition-tracker` | `completeChat` | 1 | [`src/pages/NutritionTracker.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/NutritionTracker.tsx) |
| `parse-prescription` | `completeChat` | 1 | [`src/pages/care/MedicinePrescriptions.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/care/MedicinePrescriptions.tsx) |
| `scrape-jobs` | `completeChat` | 1 | [`src/pages/LocalJobs.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/LocalJobs.tsx) |
| `search-memory` | `completeChat`, `generateEmbedding` | 1 | [`src/utils/communicationMemory.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/utils/communicationMemory.ts) |
| `search-suggestions` | `completeChat` | 1 | [`src/pages/Index.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/Index.tsx) |
| `symptom-checker` | `completeChat` | 1 | [`src/components/SymptomChecker.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/SymptomChecker.tsx) |
| `translate-message` | `completeChat` | 2 | [`src/hooks/useAISmartReplies.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useAISmartReplies.tsx) |
| `visual-intelligence` | `completeChat` | 2 | [`src/hooks/useVisualIntelligence.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useVisualIntelligence.tsx) |
| `visual-search` | `completeChat` | 1 | [`src/components/search/VisualSearchUpload.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/search/VisualSearchUpload.tsx) |

---

## 5. Category B: Direct-Provider Functions (Confirmed Frontend Invocations — 15 Functions)

These functions bypass Lovable, but call third-party APIs directly rather than routing through `_core/aiProvider.ts`. They should be normalized into `_core/aiProvider.ts`:

| Function Name | Modality | Direct Secret Required (Names Only) | Confirmed Sites | Primary Invocation Site |
|---|---|---|---|---|
| `chatr-games-ai` | LLM (Chat/Reasoning) | `OPENROUTER_API_KEY` | **7** | [`src/components/games/EchoChainGame.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/games/EchoChainGame.tsx) |
| `ai-agent-chat` | LLM (Chat/Reasoning) | `OPENROUTER_API_KEY` | **4** | [`src/components/ai-agents/VoiceConversation.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/ai-agents/VoiceConversation.tsx) |
| `ai-smart-reply` | LLM (Chat/Reasoning) | `OPENROUTER_API_KEY` | **4** | [`src/hooks/useAISmartReplies.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useAISmartReplies.tsx) |
| `ai-chat-assistant` | LLM (Chat/Reasoning) | `GEMINI_API_KEY` | **3** | [`src/hooks/useAIChatFeatures.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useAIChatFeatures.tsx) |
| `transcribe-voice` | STT (Transcription) | `OPENAI_API_KEY` | **3** | [`src/components/VoiceRecorder.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/VoiceRecorder.tsx) |
| `ai-browser-search` | LLM / Search | `GEMINI_API_KEY`, `GROQ_API_KEY`, `SERPER_API_KEY` | **2** | [`src/pages/AIBrowser.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/AIBrowser.tsx) |
| `ai-health-assistant` | LLM (Chat/Reasoning) | `OPENROUTER_API_KEY` | **2** | [`src/pages/AIAssistant.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/AIAssistant.tsx) |
| `agent-voice-tts` | TTS (Speech Synthesis) | `OPENAI_API_KEY` | **1** | [`src/components/ai-agents/VoiceConversation.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/ai-agents/VoiceConversation.tsx) |
| `ai-answer` | LLM (Chat/Reasoning) | `OPENROUTER_API_KEY` | **1** | [`src/pages/UniversalSearch.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/UniversalSearch.tsx) |
| `ai-assistant` | LLM (Chat/Reasoning) | `GEMINI_API_KEY` | **1** | [`src/pages/PrechuAI.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/PrechuAI.tsx) |
| `ai-coaching` | LLM (Chat/Reasoning) | `GEMINI_API_KEY` | **1** | [`src/hooks/useAICoaching.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useAICoaching.tsx) |
| `backfill-memory` | Vector Embedding | Direct DB RPC | **1** | [`src/utils/communicationMemory.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/utils/communicationMemory.ts) |
| `generate-feature` | LLM (Chat/Reasoning) | `OPENAI_API_KEY` | **1** | [`src/pages/admin/FeatureBuilder.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/admin/FeatureBuilder.tsx) |
| `live-translate` | LLM (Chat/Reasoning) | `GEMINI_API_KEY` | **1** | [`src/hooks/useLiveTranslation.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useLiveTranslation.tsx) |
| `screen-incoming-call` | Rule-based Filtering | None (Local regex) | **1** | [`src/components/identity/CallScreeningOverlay.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/identity/CallScreeningOverlay.tsx) |

---

## 6. Category C: Upstream-Only Legacy Functions (5 Functions)

These functions exist in `lovable/main` calling `ai.gateway.lovable.dev`. **None exist in local workspace and none have active frontend invocations:**
- `seo-gsc-sync` (SEO Cron - 0 callers)
- `store-call-memory` (Call Listener - 0 callers)
- `voice-ai-stream` (Superseded by `ai-agent-chat` - 0 callers)
- `voice-stt` (Superseded by `transcribe-voice` - 0 callers)
- `voice-translate` (Superseded by `live-translate` - 0 callers)
