# CHATR — Legacy Source Forensic Inventory & Read-Only Audit

**Forensic Audit Authority:** Antigravity  
**Execution Date:** 2026-08-29  
**Status:** READ-ONLY SOURCE FORENSIC COMPLETE  
**Source Backend:** `sbayuqgomlflmxgicplz` (Legacy / Lovable-connected Supabase)  
**Production Target:** `cenxckpxaqborfqyexot` (`chatr-core` / Permanent Production)  

---

## 1. SOURCE ACCESSIBILITY AUDIT

| Metric | Status / Value |
|--------|----------------|
| Source Project Ref | `sbayuqgomlflmxgicplz` |
| Source Status | **ONLINE, UNPAUSED, AND ACCESSIBLE** |
| GoTrue Auth Service | Active (v2.195.0) |
| PostgREST REST Service | Active (TLS Cloudflare, sb-gateway v1) |
| Authenticated User | Arshid Wani (`919910678611@chatr.local`) |
| Source Auth UUID | `63c1d4e4-bd98-4683-9a16-1182b5d0ded8` |
| Production Auth UUID | `91ff8778-47d8-450c-8020-fffd3f6337e0` |
| Production Writes in this Phase | **0 (Strictly Read-Only)** |
| Legacy Writes in this Phase | **0 (Strictly Read-Only)** |

---

## 2. EXACT SOURCE ROW COUNTS (LEGACY DUMP)

All historical data has been forensically extracted and preserved locally in `migration/SOURCE_RAW_*.json`:

| Table | Exact Source Rows | Earliest Timestamp | Latest Timestamp | Note |
|-------|-------------------|--------------------|------------------|------|
| `messages` | **1,031** | 2025-10-10T05:11:15Z | 2026-08-22T08:38:50Z | 1,010 text, 12 images, 5 docs, 2 locations, 1 voice, 1 contact |
| `calls` | **9,927** | 2025-10-10T05:09:30Z | 2026-08-27T11:34:43Z | Voice and video call records |
| `contacts` | **2,078** | 2026-02-19T06:44:59Z | 2026-02-19T06:47:00Z | Full synced address book for Arshid Wani |
| `conversations` | **17** | 2025-10-10T05:09:29Z | 2026-08-22T08:38:50Z | Direct and group chat channels |
| `conversation_participants` | **26** | 2025-10-10T05:09:29Z | 2026-08-22T08:38:50Z | Participant mappings |
| `session_rooms` | **41** | 2026-07-15T18:09:23Z | 2026-08-27T10:14:02Z | Video session rooms |
| `user_devices` | **6** | 2025-10-10T05:09:00Z | 2026-08-27T10:14:02Z | Android and Chrome device fingerprints |
| `ai_agents` | **1** | 2025-10-10T05:09:00Z | 2025-10-10T05:09:00Z | Custom AI assistant profile ('Sanobar') |
| `profiles` | **1** | 2025-10-10T05:09:00Z | 2025-10-10T05:09:00Z | Arshid Wani user profile |
| `calendar_events` | **0** | — | — | Empty in source |
| `appointments` | **0** | — | — | Empty in source |
| `mcp_api_keys` | **0** | — | — | Empty in source |
| `mcp_request_logs` | **0** | — | — | Empty in source |

---

## 3. COMPARISON: SOURCE VS PRODUCTION STATE

| Entity | Legacy Source (`sbayuqgomlflmxgicplz`) | Live Production (`cenxckpxaqborfqyexot`) | Net Eligible for Migration |
|--------|------------------------------------------|---------------------------------------------|----------------------------|
| **Auth Users** | 12 unique referenced identities | **16** active canonical identities | Re-mapped to canonical prod UUIDs |
| **Conversations** | 17 | 2 native | **17** historical conversations |
| **Messages** | 1,031 | 4 native | **1,031** historical messages |
| **Contacts** | 2,078 | 0 | **2,078** address book contacts |
| **Calls** | 9,927 | 0 | **9,927** call history logs |
| **Session Rooms** | 41 | 0 | **41** rooms |
| **User Devices** | 6 | 3 native | **6** devices |
| **AI Agents** | 1 | 0 | **1** AI Agent |
| **AI Memory Vectors** | 0 (table not in source) | 0 (ready for live embeddings) | 0 |
| **Storage Objects** | 0 in storage bucket list | 0 in `chat_attachments` | 0 |

---

## 4. SOURCE USER IDENTITIES & RECONCILIATION MAP

12 unique user UUIDs were identified from the source foreign key graph:

| Source UUID | Activity in Source | Identity / Role | Production Mapping Strategy |
|-------------|--------------------|-----------------|-----------------------------|
| `63c1d4e4-bd98-4683-9a16-1182b5d0ded8` | 255 msgs, 9,927 calls, 2,078 contacts | **Arshid Wani** (`+919910678611`) | **Remap foreign keys to `91ff8778-47d8-450c-8020-fffd3f6337e0`** |
| `29f65ca9-a811-492b-b024-09689a44dbf0` | 448 msgs, 6,310 calls | Active Chat Partner / Automated Agent | Map to designated production recipient or create placeholder |
| `65b871c5-4f95-459e-8be5-230d99c011cd` | 270 msgs, 2,889 calls | Active Chat Partner | Map to matching phone identity in production |
| `a9fe1864-7f68-40dc-8ef2-2d6db86cbf1b` | 58 msgs, 679 calls | Active Chat Partner | Map to matching phone identity in production |
| `ddaa5b15-13e2-40aa-a7fd-acc3b935daaa` | 32 calls | Call contact | Reconcile with contact phone |
| `37d4584c-7b4c-49ee-b9ea-17bfa5d6c3fc` | 6 calls, created conv | Participant | Reconcile with conversation |
| `483b392d-c209-4405-82fe-c0a7aa9b0a4f` | 3 calls | Call contact | Reconcile with contact phone |
| `39c824d8-2f62-4f42-a1a7-324d4704dbc0` | 3 calls | Call contact | Reconcile with contact phone |
| `7618c787-2151-4be0-b583-6fe4c8073284` | 2 calls | Call contact | Reconcile with contact phone |
| `68cbb06d-89bb-4013-8b2c-6f3613914a6f` | 1 call | Call contact | Reconcile with contact phone |
| `9a21fa06-195c-4bc8-8217-4cdb877ada4a` | 1 call | Call contact | Reconcile with contact phone |
| `ff25a97c-64e8-408b-be2e-264b71ed64c3` | 1 call | Call contact | Reconcile with contact phone |

---

## 5. RECORD CLASSIFICATION

- **Category A (Preserved in Production):**
  - All 16 production `auth.users` & `public.users` intact.
  - Production Super Admin allowlist (`9910678611` & `9717845477`).
  - Production native 2 conversations and 4 messages.
- **Category B (Eligible for Non-Destructive Ingestion in Next Execution Phase):**
  - 1,031 historical messages.
  - 2,078 address book contacts.
  - 9,927 call records.
  - 17 conversations & 26 participant links.
  - 41 session rooms.
  - 1 custom AI agent profile.
- **Category C (UUID Conflicts):**
  - **0 UUID collisions** between source rows and existing production rows.
- **Category D (Identity Remapping):**
  - Arshid Wani source UUID `63c1d4e4...` remapped to production `91ff8778...`.
- **Category E (Quarantined Records):**
  - `971161809` (quarantined 9-digit fragment — excluded).

---

## 6. RECOMMENDED DETERMINISTIC IMPORT SEQUENCE (FOR FUTURE AUTHORIZED PHASE)

When an execution phase is authorized, import must proceed in strict dependency order:
1. **User Identity Remap Verification:** Map source UUIDs to destination UUIDs.
2. **Conversations:** Insert 17 historical conversations with `ON CONFLICT DO NOTHING`.
3. **Conversation Participants:** Insert 26 participant links with `ON CONFLICT DO NOTHING`.
4. **Messages:** Insert 1,031 messages with remapped sender IDs and `ON CONFLICT DO NOTHING`.
5. **Contacts:** Insert 2,078 contacts with `user_id` mapped to Arshid Wani's production UUID.
6. **Calls:** Insert 9,927 call records with `ON CONFLICT DO NOTHING`.
7. **Session Rooms & Devices:** Insert 41 rooms and 6 devices.
8. **Live FK & RLS Post-Import Verification:** Run full FK integrity suite.

---

## 7. CERTIFICATION SUMMARY

```
READ-ONLY SOURCE FORENSIC COMPLETE

Source Backend (sbayuqgomlflmxgicplz):
  ✅ Verified unpaused, online, and accessible
  ✅ Full read-only forensic extraction completed
  ✅ 1,031 messages, 2,078 contacts, 9,927 calls, 17 conversations downloaded
  ✅ 12 source user UUIDs mapped and analyzed
  ✅ 0 writes executed to source or destination database

Production Target (cenxckpxaqborfqyexot):
  ✅ Linked and intact as sole production target
  ✅ All 16 users, 27 tables, RLS policies, Super Admin allowlist preserved intact
```
