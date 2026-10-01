package com.chatr.app.kernel.workflow

import android.content.Context
import android.util.Log
import com.chatr.app.kernel.entity.EntityEngine
import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.intent.KernelIntent
import com.chatr.app.kernel.memory.CandidateMemory
import com.chatr.app.kernel.memory.MemorySensitivity
import com.chatr.app.kernel.memory.MemoryType
import com.chatr.app.kernel.memory.MemoryVerificationLevel
import com.chatr.app.kernel.memory.PersonalMemoryEngine
import com.chatr.app.kernel.tools.RiskTier
import com.chatr.app.kernel.tools.ToolRegistry
import com.chatr.app.kernel.trust.TrustDecision
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * PostCallWorkflowEngine — Autonomous post-call workflow executor with strict memory scoping.
 *
 * HARD AUDIT INVARIANT:
 * 1. Detection is autonomous. Execution requires user authorization.
 * 2. Transcripts do NOT blindly turn every utterance into permanent memory.
 * 3. Commitments are strictly gated by [CallExtractionEngine]:
 *    - First-person ("I will send...") -> High-confidence commitment
 *    - Hedged ("Maybe I'll...") -> Discarded from commitments, preserved as low-confidence observation
 *    - Third-party ("Rahul said he will...") -> Scoped to observation, never a user commitment
 *    - Corrections ("Actually, forget that") -> Resolves/cancels prior commitments
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
     * Runs the selective, confidence-aware post-call pipeline.
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

                // Step 2: Run deterministic confidence-aware NLP extraction
                val extraction = CallExtractionEngine.extract(
                    callerUtterances = result.callerUtterances.ifEmpty { result.keyPoints },
                    contextHint = callerDisplay
                )

                // Step 3: Handle retractions / corrections
                if (extraction.hasRetraction) {
                    val activeCommitments = memoryEngine.getActiveCommitments(entityId)
                    for (comm in activeCommitments) {
                        Log.i(TAG, "Resolving prior commitment due to caller retraction: ${comm.description}")
                        memoryEngine.completeCommitment(comm.commitmentId)
                    }
                }

                // Step 4: Selective Memory Write Gate (Rule 1: Never write unverified conversational noise)
                for (keyPoint in extraction.keyPoints) {
                    // Only write if keyPoint is substantial and not a generic greeting
                    if (keyPoint.length >= 10) {
                        val candidate = CandidateMemory(
                            type = MemoryType.CALL_TRANSCRIPT,
                            content = "[$callerDisplay] $keyPoint",
                            entityId = entityId,
                            importance = 0.70f,
                            confidence = extraction.summaryConfidence,
                            source = "PostCallWorkflow",
                            sourceTraceId = result.traceId,
                            suggestedVerificationLevel = MemoryVerificationLevel.OBSERVATION,
                            sensitivity = MemorySensitivity.MEDIUM,
                            expiresAtMs = null
                        )
                        memoryEngine.proposeCandidateMemory(candidate)
                    }
                }

                // Step 5: Commitments Write Gate (High-confidence, verified first-person only)
                val persistedCommitments = mutableListOf<String>()
                for (extracted in extraction.commitments) {
                    if (extracted.isUserCommitment && extracted.confidence >= 0.75f) {
                        val commitment = memoryEngine.createCommitment(
                            description = extracted.text,
                            toEntityId = entityId,
                            deadlineMs = null,
                            sourceTraceId = result.traceId
                        )
                        persistedCommitments.add(commitment.description)
                        Log.i(TAG, "Persisted verified commitment: ${commitment.description}")
                    } else {
                        Log.d(TAG, "Skipped low-confidence or third-party commitment: ${extracted.text}")
                    }
                }

                // Step 6: Build proposed actions for the user (Detection != Execution)
                val workflowResult = buildWorkflowResult(
                    result = result,
                    extraction = extraction,
                    callerDisplay = callerDisplay,
                    entityId = entityId,
                    commitments = persistedCommitments
                )
                Log.i(TAG, "Post-call pipeline complete: ${workflowResult.suggestedActions.size} suggested actions (gated)")

                // Broadcast clean, human-readable result back to PostCallSummaryActivity
                PostCallWorkflowBroadcaster.dispatch(context, workflowResult)

            } catch (e: Exception) {
                Log.e(TAG, "Post-call pipeline failed: ${e.message}", e)
            }
        }
    }

    /**
     * Executes an explicit, user-confirmed action (e.g. user tapped "Add to calendar").
     * CRITICAL INVARIANT: Gated by TrustDecision.Authorized. Never executes autonomously without user tap.
     */
    suspend fun executeConfirmedAction(action: PostCallAction, result: ScreenedCallResult) {
        val intent = when (action) {
            is PostCallAction.CreateCalendarEvent -> KernelIntent(
                action = IntentAction.CALENDAR_CREATE_EVENT,
                confidence = 1.0f,
                parameters = mapOf(
                    "title" to "Meeting: ${result.callerDisplay ?: result.phoneNumber}",
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

        val authorized = TrustDecision.Authorized(
            intent = intent,
            riskScore = 0.20f,
            riskTier = RiskTier.LOW,
            reason = "User tapped action chip in PostCallSummaryActivity"
        )

        val toolResult = toolRegistry.executeAuthorized(authorized)
        Log.i(TAG, "Executed confirmed action ${intent.action}: success=${toolResult.success}")
    }

    private fun buildWorkflowResult(
        result: ScreenedCallResult,
        extraction: ExtractionResult,
        callerDisplay: String,
        entityId: String?,
        commitments: List<String>
    ): PostCallWorkflowResult {
        val actions = mutableListOf<PostCallAction>()

        // Suggest calendar event if meeting/discussion requested
        val hasMeetingRequest = extraction.callerRequests.any { it.requestType == RequestType.MEETING }
        if (hasMeetingRequest) {
            actions.add(
                PostCallAction.CreateCalendarEvent(
                    description = "Meeting with $callerDisplay\n\nDiscussion:\n${extraction.humanReadableSummary}",
                    startOffsetHours = 24
                )
            )
        }

        // Suggest SMS acknowledgment if urgent or callback requested
        val hasCallbackRequest = extraction.callerRequests.any { it.requestType == RequestType.CALLBACK }
        if (extraction.urgencyLevel == UrgencyLevel.HIGH || hasCallbackRequest) {
            actions.add(
                PostCallAction.SendSmsAck(
                    messageBody = "Hi, I missed your call. I'll get back to you shortly."
                )
            )
        }

        return PostCallWorkflowResult(
            phoneNumber = result.phoneNumber,
            callerDisplay = callerDisplay,
            entityId = entityId,
            summary = extraction.humanReadableSummary,
            keyPoints = extraction.keyPoints,
            extractedCommitments = commitments,
            urgencyLevel = extraction.urgencyLevel,
            suggestedActions = actions
        )
    }
}

// ─── Domain Model ────────────────────────────────────────────────────────────

data class ScreenedCallResult(
    val traceId: String,
    val phoneNumber: String,
    val callerDisplay: String? = null,
    val callerMessage: String,
    val keyPoints: List<String>,
    val extractedCommitments: List<String>,
    val callerUtterances: List<String> = emptyList(),
    val overallConfidence: Float = 0.80f
)

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
