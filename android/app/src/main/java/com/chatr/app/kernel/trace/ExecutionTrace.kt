package com.chatr.app.kernel.trace

import com.chatr.app.kernel.intent.ExecutionPlan
import com.chatr.app.kernel.intent.KernelIntent
import com.chatr.app.kernel.tools.ToolCallRecord
import com.chatr.app.kernel.trust.TrustDecision
import java.util.UUID

enum class ChatrSurface {
    CALL,       // GSM or VoIP call flow
    AI,         // Proactive assistant / life agent
    CONNECT,    // CHATR Session (messaging, video)
    SYSTEM      // Internal / background agent
}

enum class TraceOutcome {
    SUCCESS,
    BLOCKED_BY_TRUST,
    USER_CANCELLED,
    TOOL_FAILED,
    MODEL_FAILED,
    VERIFICATION_FAILED,
    PARTIAL_SUCCESS
}

/**
 * ExecutionTrace -- A complete, auditable record of one CHATR cognitive loop execution.
 *
 * Every meaningful kernel operation persists an ExecutionTrace.
 * This provides:
 *   - Auditability: what the AI proposed, what trust decided, what actually executed
 *   - Debugging: every step of the Understand -> Act -> Learn loop is traceable
 *   - Learning: the outcome informs future intent and trust tuning
 *
 * INVARIANT: Stored locally in the Memory Engine encrypted Room database.
 * Never transmitted to cloud without explicit, opt-in user consent.
 *
 * Lifecycle maps exactly to the cognitive loop:
 *   rawInput              -> UNDERSTAND
 *   memoryUsedIds         -> REMEMBER
 *   intent / plan         -> REASON / PLAN
 *   riskScore / decision  -> TRUST GATE
 *   toolCalls             -> ACT
 *   verified              -> VERIFY
 *   memoryWrittenIds      -> REMEMBER RESULT
 *   learningSignals       -> LEARN
 */
data class ExecutionTrace(
    val traceId: String = UUID.randomUUID().toString(),
    val surface: ChatrSurface,
    val startedAtMs: Long = System.currentTimeMillis(),
    val completedAtMs: Long? = null,

    // -- UNDERSTAND --
    val rawInput: String,
    val modelId: String,

    // -- REMEMBER --
    val memorySnapshotId: String?,
    val memoriesUsedIds: List<String> = emptyList(),
    val resolvedEntityIds: List<String> = emptyList(),

    // -- REASON / PLAN --
    val intent: KernelIntent?,
    val plan: ExecutionPlan?,

    // -- TRUST GATE --
    val riskScore: Float,
    val trustDecision: TrustDecision?,

    // -- ACT --
    val toolCalls: List<ToolCallRecord> = emptyList(),

    // -- VERIFY --
    val verified: Boolean = false,
    val verificationNote: String? = null,

    // -- REMEMBER RESULT --
    val memoryRecordsWrittenIds: List<String> = emptyList(),

    // -- LEARN --
    val learningSignals: List<String> = emptyList(),

    val outcome: TraceOutcome,
    val errorMessage: String? = null
)
