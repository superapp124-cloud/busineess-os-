# Phase 2A: AI Migration Risk Register & Mitigation Controls

## 1. High-Priority Risk: Vector Embeddings & Dimensionality Mismatch

### Forensic Discovery
During the static schema audit, two distinct vector memory tables were uncovered in Supabase migrations:
1. `public.communication_memory` ([`20260627000000_communication_memory.sql`](file:///c:/Users/Arshid.Wani/chatrchat/supabase/migrations/archive/old-migrations/20260627000000_communication_memory.sql)):
   - Column: `embedding vector(768)`
   - Index: `HNSW (embedding vector_cosine_ops)`
   - Generator: `text-embedding-004` (Google Gemini)
2. `public.semantic_memory` ([`20260709000003_phase3_semantic_memory.sql`](file:///c:/Users/Arshid.Wani/chatrchat/supabase/migrations/20260709000003_phase3_semantic_memory.sql)):
   - Column: `embedding vector(1536)`
   - Index: `IVFFLAT (embedding vector_cosine_ops)`
   - Generator: OpenAI (`text-embedding-ada-002` or `text-embedding-3-small`)

### Critical Vector Semantic Trap
> [!CAUTION]
> Changing embedding models across an existing vector corpus introduces semantic corruption. Even if the dimension count matches, vector spaces across different model architectures (e.g. OpenAI vs. Gemini) have different coordinate topologies. Performing a cosine similarity search between a query vector from Model A and stored vectors from Model B yields mathematically meaningless distance metrics.

### Phase 2 Safeguard & Control
- **NO vector schema changes:** Zero `ALTER TABLE`, zero column dimension adjustments.
- **NO embedding backfill execution:** `backfill-memory` and `generate-memory-embedding` are frozen during Phase 2.
- Vector search functions (`search-memory`) will strictly query `communication_memory` using `text-embedding-004` (768 dimensions) without altering stored rows.

---

## 2. High-Priority Risk: Healthcare & Clinical Safety Logic

### Scope of Healthcare Functions
The following 5 functions provide health, wellness, and medical triage features:
- `symptom-checker`
- `medication-interactions`
- `health-predictions`
- `mental-health-assistant`
- `nutrition-tracker`

### Risk
Modifying system prompts, temperature, response parsing, or clinical disclaimer phrasing could inadvertently weaken medical triage safeguards or alter diagnostic disclaimer compliance.

### Phase 2 Safeguard & Control
- **Zero Prompt Modifications:** All system prompts, triage constraints, and mandatory disclaimers (*"Always recommend consulting a healthcare professional. This is not a diagnosis."*) remain **byte-for-byte identical** to the approved production baseline.
- **Strict Temperature Preservation:** `temperature: 0.3` is maintained for deterministic, non-hallucinatory triage outputs.
- **Strict Schema Enforcement:** Zod validation schemas on inputs (`symptoms`, `age`, `medications`) are preserved without loosening constraints.

---

## 3. Medium-Priority Risk: Streaming & SSE Protocol Variations

### Risk
Deno Edge Functions handling real-time agent dialog (`ai-agent-chat`) stream responses via Server-Sent Events (`text/event-stream`). Differences in provider chunk chunking or event markers (e.g. `data: [DONE]`) can cause client-side parser stalls or UI flickering in the WebView.

### Phase 2 Safeguard & Control
- `streamChat()` in [`_core/aiProvider.ts`](file:///c:/Users/Arshid.Wani/chatrchat/supabase/functions/_core/aiProvider.ts) handles normalized stream forwarding.
- Frontend callers (`AIAgentChat.tsx`) already implement standard `ReadableStreamDefaultReader` with robust delimiter handling (`\n\n`).

---

## 4. Medium-Priority Risk: Provider Rate Limits & 429 Failovers

### Risk
High concurrent traffic on Google Gemini could trigger quota limits (HTTP 429), degrading user experience if failover is missing or slow.

### Phase 2 Safeguard & Control
- **Automated Fallback Chaining:** The router automatically tries `gemini` → `groq` → `openrouter` → `openai`.
- **Groq Failover:** Groq delivers responses in < 300ms, making a rate-limit failover virtually undetectable to the end user.
- **Exhaustion Handling:** If all providers fail, the router returns a structured HTTP 503 (`ai_providers_exhausted`) instead of an unhandled crash or indefinite hang.

---

## 5. Rollback Strategy

| Scenario | Rollback Action | Time to Recover |
|---|---|---|
| Single function failure after deployment | Re-deploy the previous function version via dashboard or CLI | < 2 minutes |
| Provider outage (e.g. Google AI Studio down) | Dynamic failover handles automatically; alternatively, change `primaryProvider: "groq"` in router | 0 minutes (automatic) |
| Systemic Edge Function regression | Revert to Git tag `pre-phase2-baseline` | < 5 minutes |
