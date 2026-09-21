# Phase 2A: Function Contract Matrix (Zero Client Changes)

## 1. Contract Preservation Principle

To ensure zero downtime and prevent client regressions across Web and Android, every Edge Function migrated from `ai.gateway.lovable.dev` to `_core/aiProvider.ts` follows strict contract preservation:

```text
Existing Frontend Request
        │
        ▼ (Identical URL: /functions/v1/<fn>)
Same Edge Function Endpoint
        │
        ▼ (Identical Request Schema)
CHATR AI Router (_core/aiProvider.ts)
        │
        ▼ (Direct Provider Execution)
Same Response Contract (Identical JSON Keys & Status Codes)
        │
        ▼
Existing Frontend Component (0 lines changed)
```

---

## 2. Active AI Functions Contract Specification

### 1. `chatr-world`
- **Method:** `POST`
- **Frontend Caller:** [`src/pages/ChatrOS.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/ChatrOS.tsx), [`src/components/navigation/Breadcrumbs.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/navigation/Breadcrumbs.tsx)
- **Request Payload:**
  ```json
  {
    "prompt": "Explain the architecture of CHATR MiniApps",
    "systemPrompt": "You are CHATR World guide...",
    "temperature": 0.7,
    "maxTokens": 1024
  }
  ```
- **Response Payload (200 OK):**
  ```json
  {
    "content": "CHATR MiniApps run in sandboxed iframes...",
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
  ```
- **Parity Status:** ✅ 100% Match.

---

### 2. `ai-agent-chat`
- **Method:** `POST`
- **Frontend Caller:** [`src/pages/AIAgentChat.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/AIAgentChat.tsx), [`src/components/ai-agents/VoiceConversation.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/ai-agents/VoiceConversation.tsx)
- **Request Payload:**
  ```json
  {
    "messages": [{ "role": "user", "content": "How do I setup my wallet?" }],
    "agentId": "wallet-assistant",
    "context": { "userTier": "pro" }
  }
  ```
- **Response Payload (200 OK - Non-streaming or SSE):**
  ```json
  {
    "reply": "To configure your wallet, navigate to Settings > Wallet...",
    "suggestions": ["View balance", "Link bank account"]
  }
  ```
- **Streaming Mode:** Supported via standard Server-Sent Events (`text/event-stream`).
- **Parity Status:** ✅ 100% Match.

---

### 3. `summarize-chat`
- **Method:** `POST`
- **Frontend Caller:** Hook / Background summarization
- **Request Payload:**
  ```json
  {
    "messages": [
      { "sender": "Arshid", "content": "Let's review the release." },
      { "sender": "Priya", "content": "Build passed all tests." }
    ]
  }
  ```
- **Response Payload (200 OK):**
  ```json
  {
    "summary": "Arshid and Priya reviewed the release; all build tests passed."
  }
  ```
- **Parity Status:** ✅ 100% Match.

---

### 4. `translate-message` & `auto-translate`
- **Method:** `POST`
- **Frontend Caller:** [`src/hooks/useMessageTranslation.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useMessageTranslation.tsx), [`src/components/AutoTranslatedMessage.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/AutoTranslatedMessage.tsx)
- **Request Payload:**
  ```json
  {
    "text": "Hello, how are you?",
    "targetLanguage": "es"
  }
  ```
- **Response Payload (200 OK):**
  ```json
  {
    "translatedText": "Hola, ¿cómo estás?",
    "sourceLanguage": "en"
  }
  ```
- **Parity Status:** ✅ 100% Match.

---

### 5. `symptom-checker` (Healthcare Safety Triage)
- **Method:** `POST`
- **Frontend Caller:** [`src/components/SymptomChecker.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/SymptomChecker.tsx)
- **Request Payload:**
  ```json
  {
    "symptoms": ["mild headache", "low fever"],
    "age": 30,
    "gender": "male"
  }
  ```
- **Response Payload (200 OK):**
  ```json
  {
    "assessment": "{\n  \"severity\": \"low\",\n  \"conditions\": [\"Viral infection\", \"Tension headache\"],\n  \"actions\": [\"Rest\", \"Hydration\"],\n  \"specialist\": \"General Physician\"\n}"
  }
  ```
- **Safety Rule:** Prompts and non-diagnostic disclaimers are preserved verbatim.
- **Parity Status:** ✅ 100% Match.

---

### 6. `medication-interactions`
- **Method:** `POST`
- **Frontend Caller:** [`src/pages/MedicationInteractionsPage.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/pages/MedicationInteractionsPage.tsx)
- **Request Payload:**
  ```json
  {
    "medications": ["Aspirin", "Ibuprofen"]
  }
  ```
- **Response Payload (200 OK):**
  ```json
  {
    "interactions": [
      {
        "severity": "moderate",
        "description": "Increased risk of gastrointestinal bleeding.",
        "recommendation": "Consult a pharmacist before concurrent use."
      }
    ]
  }
  ```
- **Parity Status:** ✅ 100% Match.

---

### 7. `transcribe-voice` (Speech-to-Text)
- **Method:** `POST` (Multipart `FormData` or JSON with base64)
- **Frontend Caller:** [`src/hooks/useVoiceTranscription.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useVoiceTranscription.tsx)
- **Request Payload:** `FormData` containing audio blob (`audio/webm` or `audio/m4a`).
- **Response Payload (200 OK):**
  ```json
  {
    "text": "Meeting notes transcribed from voice input."
  }
  ```
- **Provider:** OpenAI Whisper-1 Direct.
- **Parity Status:** ✅ 100% Match.

---

### 8. `agent-voice-tts` (Text-to-Speech)
- **Method:** `POST`
- **Frontend Caller:** [`src/components/ai-agents/VoiceConversation.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/ai-agents/VoiceConversation.tsx)
- **Request Payload:**
  ```json
  {
    "text": "Welcome back to Chatr.",
    "voice": "alloy"
  }
  ```
- **Response Payload (200 OK):** Binary stream (`Content-Type: audio/mpeg`).
- **Provider:** OpenAI TTS-1 Direct.
- **Parity Status:** ✅ 100% Match.

---

### 9. `ai-image-generator` & `generate-sticker`
- **Method:** `POST`
- **Frontend Caller:** [`src/components/chat/AIImageGenerator.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/components/chat/AIImageGenerator.tsx), [`src/hooks/useAIStickers.tsx`](file:///c:/Users/Arshid.Wani/chatrchat/src/hooks/useAIStickers.tsx)
- **Request Payload:**
  ```json
  {
    "prompt": "Futuristic neon city avatar icon",
    "size": "512x512"
  }
  ```
- **Response Payload (200 OK):**
  ```json
  {
    "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
    "provider": "openai"
  }
  ```
- **Parity Status:** ✅ 100% Match.
