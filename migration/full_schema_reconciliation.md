# CHATR — FULL SCHEMA RECONCILIATION REPORT

**Source:** `sbayuqgomlflmxgicplz`  
**Destination:** `cenxckpxaqborfqyexot` (`chatr-core`)  

| Table Name | Classification | Action | Reason |
|---|---|---|---|
| `public.users` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core with 8 rows |
| `public.profiles` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core with 8 rows |
| `public.conversations` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core |
| `public.conversation_participants` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core |
| `public.messages` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core |
| `public.contacts` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core |
| `public.attachments` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core |
| `public.calls` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core |
| `public.notifications` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core |
| `public.user_devices` | **ALREADY_PRESENT_AND_IDENTICAL** | PRESERVE | Live in chatr-core |
| `public.trusted_devices` | **DESTINATION_OBJECT_MORE_ADVANCED** | PRESERVE | Hardware & biometric trust registry in chatr-core |
| `public.device_challenges` | **DESTINATION_OBJECT_MORE_ADVANCED** | PRESERVE | WebAuthn crypto challenge registry in chatr-core |
| `public.identity_providers` | **DESTINATION_OBJECT_MORE_ADVANCED** | PRESERVE | OAuth & phone binding table in chatr-core |
| `public.calendar_events` | **DESTINATION_OBJECT_MORE_ADVANCED** | PRESERVE | Chat meeting scheduling table in chatr-core |
| `public.meeting_participants` | **DESTINATION_OBJECT_MORE_ADVANCED** | PRESERVE | Group call participant tracking in chatr-core |
| `public.ai_memory` | **DESTINATION_OBJECT_MORE_ADVANCED** | PRESERVE | Canonical 768-dim AI semantic memory in chatr-core |
| `public.ai_sessions` | **DESTINATION_OBJECT_MORE_ADVANCED** | PRESERVE | AI chat threads in chatr-core |
| `public.communication_memory` | **ALREADY_PRESENT_WITH_COMPATIBLE_DIFFERENCE** | VIEW_BRIDGE | Satisfied via non-destructive view on ai_memory |
| `public.super_admin_allowlist` | **MISSING_FROM_DESTINATION** | SAFE_ADDITIVE_DEPLOYMENT | Required security table for 9910678611 & 9717845477 |
| `public.stories` | **OBSOLETE / HISTORICAL** | OPTIONAL_ADDITIVE | Ephemeral status table |
