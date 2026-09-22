# Phase 4: Supabase Production Migration Playbook
## Source: `sbayuqgomlflmxgicplz` (Lovable Managed) → Target: `nuuuqazaoaozgblmvkzn` (Independent)

**Architecture:**
- **Shared Target Database:** `nuuuqazaoaozgblmvkzn`
- **Application 1 (Web):** `chatrchat.in` (`github.com/superapp124-cloud/chatr-business-os`)
- **Application 2 (App):** `chatr.chat` (`github.com/chatr4661-cell/chatr`)
- **Cardinal Rule:** Zero writes to source `sbayuqgomlflmxgicplz`. Legacy project `cenxckpxaqborfqyexot` excluded.

---

## The 6 Controlled Migration Stages

1. **STAGE 4.1: Source Forensics (Read-Only Baseline)**
2. **STAGE 4.2: Target Reconstruction (Clean Schema in `nuuuqazaoaozgblmvkzn`)**
3. **STAGE 4.3: Data Migration & Deep Reconciliation (Rows, FKs, Vectors, Storage)**
4. **STAGE 4.4: Application Binding (`chatr.chat` & `chatrchat.in`)**
5. **STAGE 4.5: Dual-App Production Validation (Smoke & Contract Testing)**
6. **STAGE 4.6: Controlled Cutover & Rollback Window (Traffic switch; source intact)**

---

## Stage 4.1: Source Forensic Baseline Extraction

### Step 1: Execute SQL Forensic Extractor
1. Open the Supabase SQL Editor on **`sbayuqgomlflmxgicplz`**:
   `https://supabase.com/dashboard/project/sbayuqgomlflmxgicplz/sql/new`
2. Open the script: `scratch/stage4_1_source_forensic_extractor.sql`.
3. Paste and run the query.
4. It will return a single cell with the formatted JSON payload containing:
   - All public and storage tables, columns, and data types
   - All primary keys and foreign key constraints
   - All B-tree, GIN, and vector indexes
   - All RLS policies (`pg_policy` expressions)
   - All database functions and triggers
   - All installed extensions
   - All storage buckets
   - Estimated row counts per table
5. Copy the JSON output and save it to:
   `migration/source_baseline_sbayuqgomlflmxgicplz.json`

---

## Stage 4.2: Target Reconstruction (`nuuuqazaoaozgblmvkzn`)

Once `migration/source_baseline_sbayuqgomlflmxgicplz.json` is saved:
1. Automated generator compiles clean, idempotent DDL (`01_target_reconstruction.sql`).
2. Enables extensions (`pgvector`, `pgcrypto`, `uuid-ossp`).
3. Reconstructs all tables, column types, and defaults without executing stale historical migrations.
4. Configures storage buckets matching source limits and MIME types.

---

## Stage 4.3: Data Migration & Reconciliation

1. Pre-migration constraint suspension on target.
2. Data extraction from `sbayuqgomlflmxgicplz` via Supabase connection / backup stream.
3. Import into `nuuuqazaoaozgblmvkzn`.
4. Automated reconciliation script executes:
   - Table-by-table row count matching (Source count == Target count).
   - Foreign key constraint validation.
   - Vector embedding validation (100% presence, strictly 768 dimensions).
   - Sequence realignment (`setval`).
   - Storage file parity check.

---

## Stage 4.4: Application Binding

Both Git repositories are updated independently:
- **`chatrchat.in` (`superapp124-cloud/chatr-business-os`):**
  - Set `VITE_SUPABASE_URL = https://nuuuqazaoaozgblmvkzn.supabase.co`
  - Set `VITE_SUPABASE_ANON_KEY = [target_anon_key]`
- **`chatr.chat` (`chatr4661-cell/chatr`):**
  - Set target Supabase URL and anon key.
  - Update Android native `strings.xml` for caller ID overlay.

---

## Stage 4.5: Production Smoke Validation

Validate all operational subsystems against target prior to public cutover:
- Auth login (phone OTP & Firebase bridge)
- Direct & group chat messaging
- Calls & WebRTC signaling
- CHATR AI Router (212/212 contract tests)
- Whisper STT, TTS-1, Gemini multimodal STT, OpenAI Realtime WebRTC
- Vector semantic search on existing memory

---

## Stage 4.6: Controlled Cutover & Rollback Window

1. Deploy updated clients to production.
2. Monitor live traffic on `chatrchat.in` and `chatr.chat`.
3. Keep `sbayuqgomlflmxgicplz` active and untouched as the rollback source throughout the defined rollback window.
