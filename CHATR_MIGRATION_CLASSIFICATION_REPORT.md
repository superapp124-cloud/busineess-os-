# CHATR — MIGRATION CLASSIFICATION GATE REPORT
## Phase 2A: Local Migrations Classification & Production Target Baseline

**Audit Date:** August 29, 2026  
**Auditor:** Antigravity Forensic Audit Agent  
**Execution Mode:** **STRICTLY READ-ONLY FORENSIC CLASSIFICATION** (0 writes, 0 deletions)  
**Destination Backend:** Supabase Project `cenxckpxaqborfqyexot` (`chatr-core`, `main` branch)

---

## 1. TOTAL MIGRATION CLASSIFICATION BREAKDOWN

Out of **350 total SQL migration files** discovered across `supabase/migrations/`:

$$\begin{aligned}
\text{TOTAL MIGRATIONS} &= \mathbf{350} \\
\text{SUPERSEDED (Historical Lovable Archive)} &= \mathbf{275} \quad (78.6\% \text{ in } \texttt{archive/old-migrations/}) \\
\text{ACTIVE ROOT MIGRATIONS} &= \mathbf{75} \quad (21.4\% \text{ in } \texttt{supabase/migrations/})
\end{aligned}$$

### Complete 20-Category Classification Matrix

| # | Category | Count | Description & Scope |
|---|---|---|---|
| **1** | `CORE_REQUIRED` | **10** | Core foundation, initial schema, user sync triggers, core messaging patches |
| **2** | `AUTH` | **6** | Device trust, WebAuthn challenges, identity providers, device hardware binding |
| **3** | `COMMUNICATION` | **4** | Conversation participants, calls & WebRTC signaling, message columns |
| **4** | `AI` | **3** | AI sessions, AI memory, agent execution queue |
| **5** | `ADMIN_SECURITY` | **1** | Super Admin Allowlist (`9910678611`, `9717845477`) & `is_super_admin()` helper |
| **6** | `NOTIFICATIONS` | **1** | In-app notifications, notification preferences, calendar events |
| **7** | `STORAGE` | **0** | Merged into Core Foundation Part 3 (`chat_attachments` private bucket) |
| **8** | `REALTIME` | **0** | Configured inline in core messaging migrations |
| **9** | `CRON` | **0** | Managed via pg_cron extensions in core |
| **10** | `ENTERPRISE` | **6** | TalentXcel recruitment, candidate resumes, recruiter workspace |
| **11** | `FINANCE` | **7** | Finance OS (Phases 1–5), seed COA, combined financial setup |
| **12** | `HEALTH` | **0** | Managed via Edge Functions (no dedicated SQL table) |
| **13** | `MEDIA` | **0** | Managed via storage buckets & Edge Functions |
| **14** | `SEARCH` | **0** | Managed via Edge Functions & PostgreSQL FTS |
| **15** | `EXPERIMENTAL` | **37** | Intent OS deployment bridge, OS events, semantic objects, marketplace, workflow versions |
| **16** | `ABANDONED` | **0** | Categorized into historical archive or experimental |
| **17** | `DUPLICATE` | **0** | Categorized into superseded archive |
| **18** | `SUPERSEDED` | **275** | Historical Lovable incremental migrations in `archive/old-migrations/` |
| **19** | `DESTRUCTIVE_RISK` | **0** | 13 files contain `DROP`/`TRUNCATE` (quarantined; 0 to be executed) |
| **20** | `UNKNOWN` | **0** | 100% of files classified |

---

## 2. TRUE REQUIRED PRODUCTION TARGET COUNTS

The audit establishes that the **609 tables** in local migrations represent accumulated historical feature branches. The **True Required Production Target** for current CHATR operations is:

$$\begin{aligned}
\text{TRUE REQUIRED TABLE COUNT} &= \mathbf{20} \\
\text{TRUE REQUIRED FUNCTION COUNT} &= \mathbf{12} \\
\text{TRUE REQUIRED TRIGGER COUNT} &= \mathbf{8} \\
\text{TRUE REQUIRED RLS POLICY COUNT} &= \mathbf{35}
\end{aligned}$$

### The 20 Canonical Production Target Tables

| # | Table Name | Purpose / Responsibility | Code References | Production Status (`chatr-core`) |
|---|---|---|---|---|
| **1** | `public.users` | Canonical user identity & authentication sync | 42 files | **Deployed** (8 rows) |
| **2** | `public.profiles` | Public profile projection (view on `users`) | 88 files | **Deployed** (8 rows) |
| **3** | `public.conversations` | Direct & Group chat conversations | 34 files | **Deployed** (RLS protected) |
| **4** | `public.conversation_participants` | Group membership & participant state | 18 files | **Deployed** (RLS protected) |
| **5** | `public.messages` | E2E messages, reactions, delivery status | 56 files | **Deployed** (RLS protected) |
| **6** | `public.contacts` | Phone contact book synchronization | 24 files | **Deployed** (RLS protected) |
| **7** | `public.attachments` | Media, voice notes, document attachments | 16 files | **Deployed** (RLS protected) |
| **8** | `public.calls` | WebRTC audio/video call signaling & logs | 22 files | **Deployed** (RLS protected) |
| **9** | `public.meeting_participants` | Group call participants | 8 files | **Deployed** (RLS protected) |
| **10** | `public.notifications` | In-app alerts & push triggers | 19 files | **Deployed** (RLS protected) |
| **11** | `public.notification_preferences` | Notification sounds & mute settings | 6 files | **Deployed** (RLS protected) |
| **12** | `public.calendar_events` | Chat scheduled meetings & reminders | 7 files | **Deployed** (RLS protected) |
| **13** | `public.user_devices` | Multi-device FCM/APNS push tokens | 12 files | **Deployed** (RLS protected) |
| **14** | `public.trusted_devices` | Device biometric & hardware trust registry | 9 files | **Deployed** (RLS protected) |
| **15** | `public.device_challenges` | WebAuthn crypto challenges | 5 files | **Deployed** (RLS protected) |
| **16** | `public.identity_providers` | OAuth & phone provider bindings | 6 files | **Deployed** (RLS protected) |
| **17** | `public.storage_metadata` | Private storage object metadata | 4 files | **Deployed** (RLS protected) |
| **18** | `public.ai_memory` | 768-dim user AI semantic memory | 5 files | **Deployed** (RLS protected) |
| **19** | `public.ai_sessions` | AI agent chat & assistant session threads | 8 files | **Deployed** (RLS protected) |
| **20** | `public.super_admin_allowlist` | Hardcoded Super Admin allowlist (`9910678611`, `9717845477`) | 14 files | **Pending Deployment** (Migration ready) |

---

## 3. SPECIAL REVIEW: `communication_memory` VS `ai_memory`

- **Live Database Reality:** `public.ai_memory` is **currently deployed in `cenxckpxaqborfqyexot`** and actively wired to [`src/ai/RAG/RAGService.ts`](file:///c:/Users/Arshid.Wani/chatrchat/src/ai/RAG/RAGService.ts).
- **Local Migration Reality:** `public.communication_memory` was defined in `20260709000003_phase3_semantic_memory.sql` as an alternate naming convention for the same 768-dimensional Gemini vector embedding schema.
- **Architectural Resolution (Zero Data Loss):**
  1. `public.ai_memory` remains the canonical storage table in `chatr-core`.
  2. An idempotent view `CREATE OR REPLACE VIEW public.communication_memory AS SELECT * FROM public.ai_memory;` satisfies Edge Functions (`backfill-memory`, `generate-memory-embedding`) without altering vector dimensions or duplicating tables.

---

## 4. ADMIN SECURITY FOUNDATION

Migration [`20260826143000_super_admin_security.sql`](file:///c:/Users/Arshid.Wani/chatrchat/supabase/migrations/20260826143000_super_admin_security.sql) is the single required security migration:
- Creates `public.super_admin_allowlist`.
- Creates `public.is_super_admin(UUID)` security definer function.
- Seeds the two authorized Super Admins:
  1. `9910678611` — **Arshid Wani**
  2. `9717845477` — **Sanobar Jahan**
- No other phone numbers can receive Super Admin privileges.

---

## 5. GENERATED MACHINE-READABLE ARTIFACTS

1. [`migration/current_production_target.json`](file:///c:/Users/Arshid.Wani/chatrchat/migration/current_production_target.json) — Master schema baseline defining the 20 required production tables.
2. [`migration/approved_migration_sequence.json`](file:///c:/Users/Arshid.Wani/chatrchat/migration/approved_migration_sequence.json) — Ordered sequence of genuine production migrations (excluding experimental/superseded files).

---

## 6. STOP CONDITION & NEXT STEPS

As mandated by Task 11 and the Stop Condition, **all operations remain halted in READ-ONLY mode**. No migrations have been run, and no users have been created.

Upon your review and approval of the **20-Table Current Production Target**:
1. Apply the single security migration (`20260826143000_super_admin_security.sql`).
2. Add the `communication_memory` view bridge to `ai_memory`.
3. Proceed to Phase 2B (Dry-run user migration of the 18 missing canonical users).
