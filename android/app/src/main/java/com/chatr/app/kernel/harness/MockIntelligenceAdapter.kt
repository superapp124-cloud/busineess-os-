package com.chatr.app.kernel.harness

import com.chatr.app.kernel.CallerInfo
import com.chatr.app.kernel.ChatrIntelligenceApi
import com.chatr.app.kernel.DialogueAction
import com.chatr.app.kernel.DialogueTurn
import com.chatr.app.kernel.ModelTier
import com.chatr.app.kernel.SummaryStyle
import com.chatr.app.kernel.context.DeviceContext
import com.chatr.app.kernel.intent.ExecutionPlan
import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.intent.IntentResult
import com.chatr.app.kernel.intent.KernelIntent
import com.chatr.app.kernel.intent.PlanStep
import com.chatr.app.kernel.memory.MemorySnapshot
import com.chatr.app.kernel.tools.ToolDefinition
import java.util.UUID

/**
 * MockIntelligenceAdapter — A scripted ChatrIntelligenceApi implementation
 * for use exclusively in the KernelTestHarness.
 *
 * Produces deterministic, configurable responses without calling any model SDK.
 * Enables the full kernel cognitive loop to be exercised synthetically:
 *   - Intent Engine calls evaluateIntent()
 *   - Trust Kernel evaluates the returned KernelIntent
 *   - Tool Engine calls MockToolRegistry (no real Android actions)
 *   - ExecutionTrace is fully populated
 *
 * Use MockIntelligenceAdapter.Builder to configure scripted responses per test case.
 */
class MockIntelligenceAdapter(
    private val intentResponses: Map<String, IntentResult> = emptyMap(),
    private val defaultAction: IntentAction = IntentAction.UNKNOWN,
    private val defaultConfidence: Float = 0.85f,
    private val dialogueResponses: List<DialogueAction> = listOf(DialogueAction.EndScreening)
) : ChatrIntelligenceApi {

    override val modelId: String = "mock-intelligence-adapter-harness"
    override val tier: ModelTier = ModelTier.EDGE_TINY

    private var dialogueTurnIndex = 0

    override suspend fun evaluateIntent(
        context: DeviceContext,
        input: String,
        memory: MemorySnapshot
    ): IntentResult {
        // Check for a scripted response for this input (exact match or contains)
        val scripted = intentResponses.entries
            .firstOrNull { input.contains(it.key, ignoreCase = true) }
            ?.value
        if (scripted != null) return scripted

        // Default: derive action from keywords in input
        val action = when {
            input.contains("call", ignoreCase = true) -> IntentAction.CALL_PLACE_OUTGOING
            input.contains("remind", ignoreCase = true) -> IntentAction.REMINDER_CREATE
            input.contains("send", ignoreCase = true) -> IntentAction.MESSAGE_DRAFT
            input.contains("morning", ignoreCase = true) -> IntentAction.PLAN_MORNING_BRIEF
            input.contains("meeting", ignoreCase = true) -> IntentAction.PLAN_MEETING_BRIEF
            input.contains("translate", ignoreCase = true) -> IntentAction.TRANSLATION_ENABLE
            input.contains("summarize", ignoreCase = true) -> IntentAction.NOTIFICATIONS_SUMMARIZE
            else -> defaultAction
        }

        return IntentResult.Resolved(
            KernelIntent(
                traceId = UUID.randomUUID().toString(),
                action = action,
                confidence = defaultConfidence,
                rawModelOutput = "[MOCK] Derived from: $input"
            )
        )
    }

    override suspend fun conductDialogueTurn(
        callerInfo: CallerInfo,
        callerUtterance: String,
        history: List<DialogueTurn>
    ): DialogueAction {
        val response = dialogueResponses.getOrElse(dialogueTurnIndex) { DialogueAction.EndScreening }
        dialogueTurnIndex++
        return response
    }

    override suspend fun reasonAndPlan(
        request: String,
        tools: List<ToolDefinition>,
        context: DeviceContext
    ): ExecutionPlan {
        val step = PlanStep(
            intent = KernelIntent(
                action = IntentAction.PLAN_MULTI_STEP,
                confidence = defaultConfidence,
                rawModelOutput = "[MOCK] Plan for: $request"
            ),
            description = "[MOCK] Execute: $request"
        )
        return ExecutionPlan(
            goal = request,
            steps = listOf(step),
            requiresUserReview = false
        )
    }

    override suspend fun summarize(text: String, style: SummaryStyle): String =
        "[MOCK SUMMARY] ${text.take(80).trimEnd()}..."

    override suspend fun translate(text: String, fromTag: String, toTag: String): String =
        "[MOCK TRANSLATION $fromTag->$toTag] $text"

    /** Resets dialogue turn counter for use across multiple test runs. */
    fun reset() { dialogueTurnIndex = 0 }

    companion object {
        /** Creates a simple adapter that maps input keywords to scripted IntentResults. */
        fun withResponses(vararg pairs: Pair<String, IntentResult>): MockIntelligenceAdapter =
            MockIntelligenceAdapter(intentResponses = mapOf(*pairs))
    }
}
