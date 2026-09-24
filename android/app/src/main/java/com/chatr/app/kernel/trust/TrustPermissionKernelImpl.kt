package com.chatr.app.kernel.trust

import android.util.Log
import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.intent.KernelIntent
import com.chatr.app.kernel.tools.RiskTier
import java.util.UUID

/**
 * TrustPermissionKernelImpl — The hard security boundary between the AI model
 * and the Tool Engine.
 *
 * This is the ONLY path from a proposed KernelIntent to an Authorized execution.
 * It is a deterministic, stateless evaluator: no model calls, no network calls.
 *
 * Risk Score formula:
 *   R = (D * 0.40) + ((1.0 - F) * 0.25) + (M * 0.25) - (C * 0.10)
 *
 *   D = Action destructiveness (0.0–1.0)
 *   F = Contact familiarity from entity trust score (0.0–1.0)
 *   M = Monetary / financial flag (0.0 or 1.0)
 *   C = Context confidence (0.0–1.0; 1.0 = phone unlocked, user present)
 *
 *   R < 0.25           → Authorized (AUTO_EXECUTE)
 *   0.25 ≤ R < 0.70   → RequiresConfirmation (HUD card)
 *   R ≥ 0.70          → RequiresBiometric (BiometricPrompt)
 *   Hardcoded block    → Blocked
 *
 * DEVICE VERIFICATION NOTE: Phase 1B GSM audio features are gated behind
 * BuildConfig.GSM_SCREENING_VERIFIED. This class does not alter that gate.
 */
class TrustPermissionKernelImpl : TrustPermissionKernel {

    companion object {
        private const val TAG = "TrustPermissionKernel"
        private const val THRESHOLD_AUTO = 0.25f
        private const val THRESHOLD_CONFIRM = 0.70f

        // Weight constants for risk formula
        private const val W_DESTRUCTIVENESS = 0.40f
        private const val W_FAMILIARITY     = 0.25f
        private const val W_MONETARY        = 0.25f
        private const val W_CONTEXT         = 0.10f

        // Actions that are permanently blocked regardless of context
        private val HARDCODED_BLOCK = emptySet<IntentAction>()

        // Actions with a fixed monetary/financial flag
        private val MONETARY_ACTIONS = setOf<IntentAction>(
            // Phase 5+: financial transaction intents will be added here
        )
    }

    // -------------------------------------------------------------------------
    // TrustPermissionKernel impl
    // -------------------------------------------------------------------------

    override suspend fun evaluate(
        intent: KernelIntent,
        contextConfidence: Float
    ): TrustDecision {
        Log.d(TAG, "evaluate() action=${intent.action} confidence=${intent.confidence} ctx=$contextConfidence")

        // 0. Hardcoded block list
        if (intent.action in HARDCODED_BLOCK) {
            return TrustDecision.Blocked(
                intent = intent,
                reason = "Action ${intent.action} is permanently blocked."
            )
        }

        // 1. Compute sub-scores
        val D = destructivenessScore(intent.action)
        val F = entityFamiliarityScore(intent)
        val M = if (intent.action in MONETARY_ACTIONS) 1.0f else 0.0f
        val C = contextConfidence.coerceIn(0.0f, 1.0f)

        val R = (D * W_DESTRUCTIVENESS) +
                ((1.0f - F) * W_FAMILIARITY) +
                (M * W_MONETARY) -
                (C * W_CONTEXT)
        val riskScore = R.coerceIn(0.0f, 1.0f)

        Log.d(TAG, "risk: D=$D F=$F M=$M C=$C → R=$riskScore tier=${baseRiskTier(intent.action)}")

        // 2. Classify: baseRiskTier establishes the hard minimum security floor
        val baseTier = baseRiskTier(intent.action)
        return when {
            baseTier == RiskTier.HIGH || riskScore >= THRESHOLD_CONFIRM -> TrustDecision.RequiresBiometric(
                intent = intent,
                riskScore = riskScore,
                riskTier = RiskTier.HIGH,
                displayMessage = buildBiometricMessage(intent)
            )
            baseTier == RiskTier.MEDIUM || riskScore >= THRESHOLD_AUTO -> TrustDecision.RequiresConfirmation(
                intent = intent,
                riskScore = riskScore,
                riskTier = RiskTier.MEDIUM,
                displayMessage = buildConfirmationMessage(intent),
                confirmationLabel = confirmationLabel(intent.action),
                cancelLabel = "Cancel"
            )
            else -> TrustDecision.Authorized(
                intent = intent,
                riskScore = riskScore,
                riskTier = RiskTier.LOW,
                reason = "Risk $riskScore < $THRESHOLD_AUTO threshold. Auto-executing."
            )
        }
    }

    override fun confirmDecision(
        decision: TrustDecision.RequiresConfirmation
    ): TrustDecision.Authorized {
        Log.i(TAG, "User confirmed MEDIUM-risk action: ${decision.intent.action}")
        return TrustDecision.Authorized(
            intent = decision.intent,
            riskScore = decision.riskScore,
            riskTier = RiskTier.MEDIUM,
            reason = "User confirmed via HUD card."
        )
    }

    override fun authorizeWithBiometric(
        decision: TrustDecision.RequiresBiometric
    ): TrustDecision.Authorized {
        Log.i(TAG, "User biometric-authorized HIGH-risk action: ${decision.intent.action}")
        return TrustDecision.Authorized(
            intent = decision.intent,
            riskScore = decision.riskScore,
            riskTier = RiskTier.HIGH,
            reason = "User authenticated via BiometricPrompt."
        )
    }

    override fun baseRiskTier(action: IntentAction): RiskTier = when (action) {
        // LOW: purely read or draft operations
        IntentAction.MEMORY_SEARCH,
        IntentAction.MEMORY_RECALL_ENTITY,
        IntentAction.NOTIFICATIONS_SUMMARIZE,
        IntentAction.CONTACTS_READ,
        IntentAction.CALL_LOG_READ,
        IntentAction.SCREEN_READ,
        IntentAction.MESSAGE_DRAFT,
        IntentAction.MEMORY_WRITE_COMMITMENT,
        IntentAction.TASK_CREATE,
        IntentAction.CALL_SCREEN_INCOMING,
        IntentAction.CALL_TAKEOVER_FROM_AI,
        IntentAction.TRANSLATION_ENABLE,
        IntentAction.APP_OPEN,
        IntentAction.PLAN_MORNING_BRIEF,
        IntentAction.PLAN_MEETING_BRIEF,
        IntentAction.UNKNOWN -> RiskTier.LOW

        // MEDIUM: write / send / create / call operations
        IntentAction.CALL_PLACE_OUTGOING,
        IntentAction.CALL_ANSWER,
        IntentAction.CALL_END,
        IntentAction.CALL_TRANSFER,
        IntentAction.SMS_SEND,
        IntentAction.MESSAGE_SEND_CHATR,
        IntentAction.CALENDAR_CREATE_EVENT,
        IntentAction.REMINDER_CREATE,
        IntentAction.FILE_SHARE,
        IntentAction.SESSION_START,
        IntentAction.SESSION_JOIN,
        IntentAction.PLAN_MULTI_STEP -> RiskTier.MEDIUM

        // HIGH: destructive, security, or financial operations
        IntentAction.SETTINGS_CHANGE -> RiskTier.HIGH
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Destructiveness score D ∈ [0.0, 1.0] for a given action.
     * Higher = more destructive / less reversible.
     */
    private fun destructivenessScore(action: IntentAction): Float = when (action) {
        // Pure reads — zero destructiveness
        IntentAction.MEMORY_SEARCH,
        IntentAction.MEMORY_RECALL_ENTITY,
        IntentAction.NOTIFICATIONS_SUMMARIZE,
        IntentAction.CONTACTS_READ,
        IntentAction.CALL_LOG_READ,
        IntentAction.SCREEN_READ -> 0.0f

        // Draft / local memory write — trivially reversible
        IntentAction.MESSAGE_DRAFT,
        IntentAction.MEMORY_WRITE_COMMITMENT,
        IntentAction.TASK_CREATE,
        IntentAction.PLAN_MORNING_BRIEF,
        IntentAction.PLAN_MEETING_BRIEF,
        IntentAction.UNKNOWN -> 0.05f

        // Screening / observation — low impact
        IntentAction.CALL_SCREEN_INCOMING,
        IntentAction.CALL_TAKEOVER_FROM_AI,
        IntentAction.TRANSLATION_ENABLE -> 0.10f

        // App open — trivially reversible
        IntentAction.APP_OPEN -> 0.05f

        // Call management — reversible but meaningful
        IntentAction.CALL_ANSWER,
        IntentAction.CALL_END -> 0.30f
        IntentAction.CALL_PLACE_OUTGOING -> 0.45f
        IntentAction.CALL_TRANSFER -> 0.50f

        // Calendar / reminders — reversible
        IntentAction.CALENDAR_CREATE_EVENT,
        IntentAction.REMINDER_CREATE -> 0.30f

        // Session — reversible
        IntentAction.SESSION_START,
        IntentAction.SESSION_JOIN -> 0.30f

        // Message send — irreversible
        IntentAction.SMS_SEND -> 0.55f
        IntentAction.MESSAGE_SEND_CHATR -> 0.50f

        // File sharing — irreversible
        IntentAction.FILE_SHARE -> 0.55f

        // Multi-step plan — variable; use medium baseline
        IntentAction.PLAN_MULTI_STEP -> 0.40f

        // Settings change — potentially irreversible
        IntentAction.SETTINGS_CHANGE -> 0.85f
    }

    /**
     * Entity familiarity score F ∈ [0.0, 1.0].
     * Uses the trust score of the first resolved entity, if any.
     * 0.0 = unknown/untrusted. 1.0 = fully trusted contact.
     */
    private fun entityFamiliarityScore(intent: KernelIntent): Float {
        val firstEntity = intent.resolvedEntities.firstOrNull()
        return firstEntity?.trustScore?.coerceIn(0.0f, 1.0f) ?: 0.3f // default: unknown
    }

    private fun buildConfirmationMessage(intent: KernelIntent): String {
        val entityName = intent.resolvedEntities.firstOrNull()?.canonicalName
        return when (intent.action) {
            IntentAction.CALL_PLACE_OUTGOING ->
                "Place a call${if (entityName != null) " to $entityName" else ""}?"
            IntentAction.SMS_SEND ->
                "Send an SMS${if (entityName != null) " to $entityName" else ""}?"
            IntentAction.MESSAGE_SEND_CHATR ->
                "Send a CHATR message${if (entityName != null) " to $entityName" else ""}?"
            IntentAction.CALENDAR_CREATE_EVENT ->
                "Create a calendar event?"
            IntentAction.REMINDER_CREATE ->
                "Set a reminder?"
            IntentAction.FILE_SHARE ->
                "Share a file${if (entityName != null) " with $entityName" else ""}?"
            IntentAction.SESSION_START ->
                "Start a CHATR session${if (entityName != null) " with $entityName" else ""}?"
            else -> "Allow CHATR to ${intent.action.name.lowercase().replace('_', ' ')}?"
        }
    }

    private fun buildBiometricMessage(intent: KernelIntent): String {
        return "Authenticate to allow CHATR to ${intent.action.name.lowercase().replace('_', ' ')}. " +
                "This action requires your explicit authorization."
    }

    private fun confirmationLabel(action: IntentAction): String = when (action) {
        IntentAction.CALL_PLACE_OUTGOING -> "Call"
        IntentAction.SMS_SEND, IntentAction.MESSAGE_SEND_CHATR -> "Send"
        IntentAction.CALENDAR_CREATE_EVENT -> "Create Event"
        IntentAction.REMINDER_CREATE -> "Set Reminder"
        IntentAction.FILE_SHARE -> "Share"
        IntentAction.SESSION_START, IntentAction.SESSION_JOIN -> "Join"
        else -> "Allow"
    }
}
