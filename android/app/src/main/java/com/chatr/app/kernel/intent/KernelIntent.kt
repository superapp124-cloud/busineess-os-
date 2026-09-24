package com.chatr.app.kernel.intent

import com.chatr.app.kernel.entity.Entity
import java.util.UUID

/**
 * Every action the CHATR kernel may ever execute is enumerated here.
 *
 * INVARIANT: The AI model proposes an IntentAction. The Trust Kernel authorizes it.
 * The Tool Registry executes it. No step in this chain may be bypassed.
 */
enum class IntentAction {
    // GSM / VoIP Calling
    CALL_SCREEN_INCOMING,
    CALL_PLACE_OUTGOING,
    CALL_ANSWER,
    CALL_END,
    CALL_TRANSFER,
    CALL_TAKEOVER_FROM_AI,

    // Messaging
    SMS_SEND,
    MESSAGE_SEND_CHATR,
    MESSAGE_DRAFT,

    // Memory
    MEMORY_SEARCH,
    MEMORY_WRITE_COMMITMENT,
    MEMORY_RECALL_ENTITY,

    // Calendar / Reminders / Tasks
    CALENDAR_CREATE_EVENT,
    REMINDER_CREATE,
    TASK_CREATE,

    // Reading / Observation (all LOW risk)
    NOTIFICATIONS_SUMMARIZE,
    CONTACTS_READ,
    CALL_LOG_READ,
    SCREEN_READ,

    // Device Control
    SETTINGS_CHANGE,
    APP_OPEN,
    FILE_SHARE,

    // CHATR Connect Sessions
    SESSION_START,
    SESSION_JOIN,
    TRANSLATION_ENABLE,

    // Proactive Agents
    PLAN_MORNING_BRIEF,
    PLAN_MEETING_BRIEF,
    PLAN_MULTI_STEP,

    // Fallback
    UNKNOWN
}

/**
 * A structured, validated representation of what the AI model proposes to do.
 *
 * The AI model NEVER calls any tool or Android API directly.
 * It produces a KernelIntent and returns it to the Intent Engine.
 * The Trust Kernel then evaluates the intent and decides whether to authorize execution.
 */
data class KernelIntent(
    val traceId: String = UUID.randomUUID().toString(),
    val action: IntentAction,
    val parameters: Map<String, Any> = emptyMap(),
    /** How confident the model is that this intent reflects the user's actual goal. 0.0–1.0. */
    val confidence: Float,
    val resolvedEntities: List<Entity> = emptyList(),
    val requiresEntityResolution: Boolean = false,
    /** Tokens in the input that were interpreted implicitly via memory. */
    val implicitContextKeys: List<String> = emptyList(),
    val suggestedToolId: String? = null,
    /** Raw model output string, preserved for debugging only. Never used for logic. */
    val rawModelOutput: String? = null
)

/**
 * The result returned by the Intent Engine after parsing a natural-language input.
 */
sealed class IntentResult {
    data class Resolved(val intent: KernelIntent) : IntentResult()
    data class NeedsEntityResolution(
        val partialIntent: KernelIntent,
        val unresolvedTokens: List<String>
    ) : IntentResult()
    data class NeedsUserClarification(val question: String) : IntentResult()
    data class Ambiguous(val candidates: List<KernelIntent>) : IntentResult()
    data class Failed(val reason: String, val rawInput: String) : IntentResult()
}

/** A single, atomic step within a multi-step execution plan. */
data class PlanStep(
    val stepId: String = UUID.randomUUID().toString(),
    val intent: KernelIntent,
    /** stepIds that must succeed before this step may begin. */
    val dependsOnStepIds: List<String> = emptyList(),
    val description: String
)

/**
 * An ordered, dependency-aware graph of KernelIntents that together achieve
 * a complex multi-step goal. Each step is independently evaluated by the Trust Kernel.
 */
data class ExecutionPlan(
    val planId: String = UUID.randomUUID().toString(),
    val goal: String,
    val steps: List<PlanStep>,
    val estimatedDurationMs: Long? = null,
    /** True if the plan contains at least one MEDIUM or HIGH risk step. */
    val requiresUserReview: Boolean
)
