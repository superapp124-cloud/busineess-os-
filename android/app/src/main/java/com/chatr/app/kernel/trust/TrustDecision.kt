package com.chatr.app.kernel.trust

import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.intent.KernelIntent
import com.chatr.app.kernel.tools.RiskTier

/**
 * The verdict emitted by the TrustPermissionKernel for a given KernelIntent.
 *
 * INVARIANT: No tool may execute without a [TrustDecision.Authorized] instance
 * having been recorded in the ExecutionTrace. The ToolExecutor only accepts
 * [Authorized] — not a raw KernelIntent — enforcing the boundary at compile time.
 */
sealed class TrustDecision {

    abstract val intent: KernelIntent
    abstract val riskScore: Float
    abstract val riskTier: RiskTier

    /**
     * Risk score < 0.25. Tool executes immediately without user interaction.
     */
    data class Authorized(
        override val intent: KernelIntent,
        override val riskScore: Float,
        override val riskTier: RiskTier = RiskTier.LOW,
        val reason: String
    ) : TrustDecision()

    /**
     * Risk score 0.25-0.70. User must confirm via the Trust HUD card.
     * Execution is suspended until confirmation arrives.
     */
    data class RequiresConfirmation(
        override val intent: KernelIntent,
        override val riskScore: Float,
        override val riskTier: RiskTier = RiskTier.MEDIUM,
        val displayMessage: String,
        val confirmationLabel: String = "Allow",
        val cancelLabel: String = "Cancel"
    ) : TrustDecision()

    /**
     * Risk score >= 0.70. User must authenticate via BiometricPrompt or device PIN.
     */
    data class RequiresBiometric(
        override val intent: KernelIntent,
        override val riskScore: Float,
        override val riskTier: RiskTier = RiskTier.HIGH,
        val displayMessage: String
    ) : TrustDecision()

    /**
     * The action is permanently blocked regardless of user interaction.
     * Used for hardcoded forbidden actions with no valid permission path.
     */
    data class Blocked(
        override val intent: KernelIntent,
        override val riskScore: Float = 1.0f,
        override val riskTier: RiskTier = RiskTier.HIGH,
        val reason: String
    ) : TrustDecision()
}

/**
 * The TrustPermissionKernel — a hard security boundary between the AI model
 * and the Tool Engine.
 *
 * It evaluates a KernelIntent against: action destructiveness, entity familiarity,
 * financial flags, and user context confidence — then returns the appropriate
 * TrustDecision.
 *
 * Risk Score formula:
 *   R = (w_d * D) + (w_f * (1 - F)) + (w_m * M) - (w_c * C)
 *   D = destructiveness/irreversibility (0.0-1.0)
 *   F = contact familiarity from Memory Engine (0.0-1.0)
 *   M = monetary/financial flag (0 or 1)
 *   C = context confidence (0.0-1.0; 1.0 = phone unlocked, user present)
 *
 *   R < 0.25  -> Authorized
 *   R in [0.25, 0.70) -> RequiresConfirmation
 *   R >= 0.70 -> RequiresBiometric
 *   Hardcoded block list -> Blocked
 */
interface TrustPermissionKernel {

    /**
     * Evaluates [intent] and returns the appropriate [TrustDecision].
     *
     * @param intent             The KernelIntent proposed by the AI model.
     * @param contextConfidence  0.0-1.0. How confident we are the user is
     *                           present and aware (1.0 = unlocked, in-hand;
     *                           0.2 = locked screen, background operation).
     */
    suspend fun evaluate(
        intent: KernelIntent,
        contextConfidence: Float = 1.0f
    ): TrustDecision

    /**
     * Called after the user taps "Allow" on a MEDIUM-risk HUD confirmation.
     * Returns an [Authorized] decision the Tool Engine can act on.
     */
    fun confirmDecision(
        decision: TrustDecision.RequiresConfirmation
    ): TrustDecision.Authorized

    /**
     * Called after the user passes BiometricPrompt / PIN for a HIGH-risk decision.
     */
    fun authorizeWithBiometric(
        decision: TrustDecision.RequiresBiometric
    ): TrustDecision.Authorized

    /**
     * Returns the baseline RiskTier for a given IntentAction, independent of context.
     * Used to fast-path obvious AUTO or BLOCK decisions without full risk computation.
     */
    fun baseRiskTier(action: IntentAction): RiskTier
}
