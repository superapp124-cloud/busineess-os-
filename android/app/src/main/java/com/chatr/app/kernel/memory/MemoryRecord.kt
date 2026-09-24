package com.chatr.app.kernel.memory

import java.util.UUID

enum class MemoryType {
    COMMITMENT,        // "I will send Ahmed the proposal by tomorrow"
    CALL_TRANSCRIPT,   // raw or summarized call dialogue
    CONTACT_PREFERENCE, // "Ahmed prefers evening calls"
    MESSAGE_SNIPPET,   // important extract from a chat message
    DECISION,          // "decided to book the Grand Orchid hotel"
    TASK,              // "send proposal before 12 PM"
    KNOWLEDGE,         // "Grand Orchid: family room Rs.7500, breakfast included"
    ROUTINE,           // "user typically finishes work at 6:30 PM"
    FACT               // general remembered fact
}

/** Verification level enforcing strict memory write policies. */
enum class MemoryVerificationLevel {
    OBSERVATION,  // Unverified claim / observation (e.g. "Caller said the package is with security")
    FACT,         // Verified ground-truth fact (e.g. "DHL package is currently with security")
    COMMITMENT    // Explicit obligation/promise (e.g. "User needs to collect package from security")
}

/** Sensitivity tier controlling access and encryption policies. */
enum class MemorySensitivity {
    LOW,       // Routine interaction note, public entity fact
    MEDIUM,    // Personal relationship note, work preference
    HIGH       // Financial, security, confidential personal data
}

data class Commitment(
    val commitmentId: String = UUID.randomUUID().toString(),
    val description: String,
    val toEntityId: String?,
    val deadlineMs: Long?,
    val isCompleted: Boolean = false,
    val createdAtMs: Long = System.currentTimeMillis()
)

data class InteractionSummary(
    val totalInteractions: Int,
    val lastInteractionMs: Long?,
    val callCount: Int = 0,
    val messageCount: Int = 0,
    val averageCallDurationSeconds: Long = 0,
    val openCommitments: List<Commitment> = emptyList()
)

/**
 * A candidate memory proposed by an AI model or external signal.
 * Must pass confidence, provenance, and validation checks before persisting as a durable [MemoryRecord].
 */
data class CandidateMemory(
    val type: MemoryType,
    val content: String,
    val entityId: String? = null,
    val source: String = "AI_SCREENING",
    val sourceTraceId: String? = null,
    val confidence: Float = 0.85f,
    val suggestedVerificationLevel: MemoryVerificationLevel = MemoryVerificationLevel.OBSERVATION,
    val sensitivity: MemorySensitivity = MemorySensitivity.LOW,
    val importance: Float = 0.5f,
    val expiresAtMs: Long? = null
)

/**
 * A single unit of persistent personal memory.
 *
 * PRIVACY INVARIANT: Stored encrypted on-device (AES-256-GCM via Android Keystore).
 * Raw MemoryRecord content is NEVER transmitted to any cloud service.
 * Only opt-in, explicitly authorized, E2EE-encrypted snapshots may sync to Supabase.
 * Local memory is the source of truth. Cloud memory is an authorized replica only.
 */
data class MemoryRecord(
    val recordId: String = UUID.randomUUID().toString(),
    val type: MemoryType,
    val content: String,
    val embeddingKey: String? = null,     // FK to the local sqlite-vec entry
    val relatedEntityIds: List<String> = emptyList(),
    val relatedTraceId: String? = null,   // ExecutionTrace that produced this record
    val importance: Float = 0.5f,         // 0.0-1.0, used for retrieval ranking
    val createdAtMs: Long = System.currentTimeMillis(),
    val expiresAtMs: Long? = null,        // null = permanent
    val isCloudSynced: Boolean = false,   // false until user explicitly opts in
    // Hardening fields: Provenance & Strict Write Policy
    val source: String = "AI_SCREENING",
    val sourceTraceId: String? = relatedTraceId,
    val confidence: Float = 0.85f,
    val verificationLevel: MemoryVerificationLevel = MemoryVerificationLevel.OBSERVATION,
    val sensitivity: MemorySensitivity = MemorySensitivity.LOW,
    val lastVerifiedAtMs: Long = createdAtMs
)

/**
 * A lightweight, privacy-safe snapshot of relevant memories for a given query.
 * This is what gets passed into ChatrIntelligenceApi — it contains curated records,
 * not the full raw personal memory database.
 */
data class MemorySnapshot(
    val snapshotId: String = UUID.randomUUID().toString(),
    val relevantRecords: List<MemoryRecord>,
    val activeCommitments: List<Commitment>,
    /** EntityId -> canonical name, for safe model context injection. */
    val resolvedEntityNames: Map<String, String>,
    val queryContext: String,
    val generatedAtMs: Long = System.currentTimeMillis()
)
