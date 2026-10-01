package com.chatr.app.kernel.workflow

import android.content.Context
import android.util.Log
import com.chatr.app.kernel.entity.EntityEngine
import com.chatr.app.kernel.entity.IdentifierType
import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.intent.KernelIntent
import com.chatr.app.kernel.memory.CandidateMemory
import com.chatr.app.kernel.memory.MemorySensitivity
import com.chatr.app.kernel.memory.MemoryType
import com.chatr.app.kernel.memory.MemoryVerificationLevel
import com.chatr.app.kernel.memory.PersonalMemoryEngine
import com.chatr.app.kernel.tools.ToolRegistry
import com.chatr.app.kernel.trust.TrustDecision
import com.chatr.app.kernel.tools.RiskTier
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * PostCallWorkflowEngine — Autonomous post-call workflow executor.
 *
 * After the SI Receptionist finalizes a screened call, this engine:
 *   1. Resolves the caller entity via EntityEngine.
 *   2. Writes key-point observations and extracted commitments to PersonalMemoryEngine.
 *   3. Optionally creates a Calendar event for follow-ups.
 *   4. Optionally sends an SMS acknowledgement to the caller.
 *   5. Emits a structured PostCallWorkflowResult for the UI layer.
 *
 * INVARIANT: This engine never executes tools directly.
 * All actions pass through ToolRegistry.executeAuthorized() with a TrustDecision.Authorized.
 * Medium/High risk actions (SMS send, Calendar write) surface as RequiresConfirmation
 * and are deferred until user taps the PostCallSummaryActivity action chip.
 */
class PostCallWorkflowEngine(
    private val context: Context,
    private val memoryEngine: PersonalMemoryEngine,
    private val entityEngine: EntityEngine,
    private val toolRegistry: ToolRegistry
) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    companion object {
        private const val TAG = "PostCallWorkflowEngine"
    }

    /**
     * Entry point: called by AIScreeningService after finalizeScreening().
     * Runs the full autonomous post-call pipeline.
     */
    fun runPostCallPipeline(result: ScreenedCallResult) {
        scope.launch {
            Log.i(TAG, "Starting post-call pipeline for ${result.phoneNumber}")
            try {
                // Step 1: Entity resolution
                val entity = entityEngine.resolveByPhone(result.phoneNumber)
                val entityId = entity?.entityId
                val callerDisplay = entity?.canonicalName ?: result.phoneNumber

                Log.i(TAG, "Caller resolved: $callerDisplay (entityId=$entityId)")

                // Step 2: Persist observations from the call transcript
                for (keyPoint in result.keyPoints) {
                    val candidate = CandidateMemory(
                        type = MemoryType.CALL_TRANSCRIPT,
                        content = "[$callerDisplay] $keyPoint",
                        entityId = entityId,
                        importance = 0.75f,
                        confidence = result.overallConfidence,
                        source = "PostCallWorkflow",
                        sourceTraceId = result.traceId,
                        suggestedVerificationLevel = MemoryVerificationLevel.OBSERVATION,
                        sensitivity = MemorySensitivity.MEDIUM,
                        expiresAtMs = null
                    )
                    memoryEngine.proposeCandidateMemory(candidate)
                }

                // Step 3: Persist commitments
                for (commitment in result.extractedCommitments) {
                    memoryEngine.createCommitment(
                        description = commitment,
                        toEntityId = entityId,
                        deadlineMs = null,
                        sourceTraceId = result.traceId
                    )
                    Log.i(TAG, "Persisted commitment: $commitment")
                }

                // Step 4: Build the post-call workflow result for UI
                val workflowResult = buildWorkflowResult(result, callerDisplay, entityId)
                Log.i(TAG, "Post-call pipeline complete: ${workflowResult.suggestedActions.size} suggested actions")

                // Broadcast result back to PostCallSummaryActivity
                PostCallWorkflowBroadcaster.dispatch(context, workflowResult)

            } catch (e: Exception) {
                Log.e(TAG, "Post-call pipeline failed: ${e.message}", e)
            }
        }
    }

    /**
     * Executes a confirmed UI action (e.g. user tapped "Create Calendar Event").
     * All confirmed actions must produce a TrustDecision.Authorized before tool execution.
     */
    suspend fun executeConfirmedAction(action: PostCallAction, result: ScreenedCallResult) {
        val intent = when (action) {
            is PostCallAction.CreateCalendarEvent -> KernelIntent(
                action = IntentAction.CALENDAR_CREATE_EVENT,
                confidence = 1.0f,
                parameters = mapOf(
                    "title" to "Follow-up: ${result.callerDisplay ?: result.phoneNumber}",
                    "description" to action.description,
                    "durationMinutes" to 30L,
                    "startOffsetHours" to action.startOffsetHours
                )
            )
            is PostCallAction.SendSmsAck -> KernelIntent(
                action = IntentAction.SMS_SEND,
                confidence = 1.0f,
                parameters = mapOf(
                    "phoneNumber" to result.phoneNumber,
                    "body" to action.messageBody
                )
            )
            is PostCallAction.WriteCommitment -> KernelIntent(
                action = IntentAction.MEMORY_WRITE_COMMITMENT,
                confidence = 1.0f,
                parameters = mapOf(
                    "description" to action.commitmentText
                )
            )
        }

        // All post-call confirmed actions are treated as user-authorized (user tapped chip)
        val authorized = TrustDecision.Authorized(
            intent = intent,
            riskScore = 0.20f,
            riskTier = RiskTier.LOW,
            reason = "User confirmed via PostCallSummaryActivity action chip"
        )

        val toolResult = toolRegistry.executeAuthorized(authorized)
        Log.i(TAG, "Executed confirmed action $action: success=${toolResult.success}")
    }

    private fun buildWorkflowResult(
        result: ScreenedCallResult,
        callerDisplay: String,
        entityId: String?
    ): PostCallWorkflowResult {
        val actions = mutableListOf<PostCallAction>()

        // Suggest calendar follow-up if call implied meeting/discussion/callback
        val callbackKeywords = listOf("call back", "callback", "follow up", "meeting", "schedule", "discuss", "tomorrow", "next week")
        val hasCallbackIntent = result.keyPoints.any { point ->
            callbackKeywords.any { kw -> point.lowercase().contains(kw) }
        } || result.extractedCommitments.any { c ->
            callbackKeywords.any { kw -> c.lowercase().contains(kw) }
        }

        if (hasCallbackIntent) {
            actions.add(
                PostCallAction.CreateCalendarEvent(
                    description = "Follow-up with $callerDisplay\n\nSummary:\n${result.callerMessage}\n\nKey Points:\n${result.keyPoints.joinToString("\n• ", "• ")}",
                    startOffsetHours = 24
                )
            )
        }

        // Suggest SMS ack for known caller or if urgency detected
        val urgencyKeywords = listOf("urgent", "emergency", "asap", "immediately", "important")
        val isUrgent = result.keyPoints.any { point ->
            urgencyKeywords.any { kw -> point.lowercase().contains(kw) }
        }
        if (isUrgent || entityId != null) {
            actions.add(
                PostCallAction.SendSmsAck(
                    messageBody = "Hi, I missed your call. I'll get back to you shortly. — CHATR SI"
                )
            )
        }

        return PostCallWorkflowResult(
            phoneNumber = result.phoneNumber,
            callerDisplay = callerDisplay,
            entityId = entityId,
            summary = result.callerMessage,
            keyPoints = result.keyPoints,
            extractedCommitments = result.extractedCommitments,
            urgencyLevel = if (isUrgent) UrgencyLevel.HIGH else UrgencyLevel.NORMAL,
            suggestedActions = actions
        )
    }
}

// ─── Domain Model ────────────────────────────────────────────────────────────

/** Input from AIScreeningService.finalizeScreening() */
data class ScreenedCallResult(
    val traceId: String,
    val phoneNumber: String,
    val callerDisplay: String? = null,
    val callerMessage: String,
    val keyPoints: List<String>,
    val extractedCommitments: List<String>,
    val overallConfidence: Float = 0.80f
)

/** Output of the post-call workflow pipeline */
data class PostCallWorkflowResult(
    val phoneNumber: String,
    val callerDisplay: String,
    val entityId: String?,
    val summary: String,
    val keyPoints: List<String>,
    val extractedCommitments: List<String>,
    val urgencyLevel: UrgencyLevel,
    val suggestedActions: List<PostCallAction>
)

enum class UrgencyLevel { NORMAL, HIGH, CRITICAL }

/** Sealed hierarchy of actions the user can confirm post-call */
sealed class PostCallAction {
    data class CreateCalendarEvent(
        val description: String,
        val startOffsetHours: Int = 24
    ) : PostCallAction()

    data class SendSmsAck(
        val messageBody: String
    ) : PostCallAction()

    data class WriteCommitment(
        val commitmentText: String
    ) : PostCallAction()
}
