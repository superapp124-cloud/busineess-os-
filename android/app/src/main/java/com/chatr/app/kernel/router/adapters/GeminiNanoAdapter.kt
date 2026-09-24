package com.chatr.app.kernel.router.adapters

import android.content.Context
import android.util.Log
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
import com.chatr.app.ondeviceai.OnDeviceAiService
import org.json.JSONObject
import java.util.UUID

/**
 * GeminiNanoAdapter — Bridges OnDeviceAiService (Android AICore / ML Kit Prompt API)
 * to the pluggable ChatrIntelligenceApi contract.
 */
class GeminiNanoAdapter(
    private val context: Context,
    private val aiService: OnDeviceAiService
) : ChatrIntelligenceApi {

    override val modelId: String = "gemini-nano-aicore"
    override val tier: ModelTier = ModelTier.EDGE_TINY

    override suspend fun evaluateIntent(
        context: DeviceContext,
        input: String,
        memory: MemorySnapshot
    ): IntentResult {
        return try {
            val prompt = """
                Extract the primary user intent and parameters for a mobile AI assistant.
                User input: "$input"
                Recent context: ${context.activeEntityIds.joinToString()}
                Return JSON only: {"action": "INTENT_ACTION_NAME", "confidence": 0.0-1.0, "parameters": {}}
            """.trimIndent()

            val generation = aiService.generate(prompt, "intent")
            val jsonText = generation.jsonText ?: generation.text
            val json = JSONObject(jsonText)
            val actionName = json.optString("action", "UNKNOWN")
            val confidence = json.optDouble("confidence", 0.7).toFloat()
            val paramsObj = json.optJSONObject("parameters")
            val params = mutableMapOf<String, Any>()
            paramsObj?.keys()?.forEach { key ->
                params[key] = paramsObj.get(key)
            }

            val action = runCatching { IntentAction.valueOf(actionName) }.getOrDefault(IntentAction.UNKNOWN)
            IntentResult.Resolved(
                KernelIntent(
                    traceId = UUID.randomUUID().toString(),
                    action = action,
                    parameters = params,
                    confidence = confidence,
                    rawModelOutput = generation.text
                )
            )
        } catch (e: Exception) {
            Log.w(TAG, "Gemini Nano intent evaluation failed, falling back", e)
            IntentResult.Failed(reason = e.message ?: "Evaluation error", rawInput = input)
        }
    }

    override suspend fun conductDialogueTurn(
        callerInfo: CallerInfo,
        callerUtterance: String,
        history: List<DialogueTurn>
    ): DialogueAction {
        return try {
            val transcript = history.joinToString("\n") { "${it.speaker}: ${it.text}" }
            val prompt = """
                You are CHATR AI receptionist screening a phone call for Arshid.
                Caller: ${callerInfo.phoneNumber} (${callerInfo.resolvedEntity?.canonicalName ?: "Unknown"})
                Conversation so far:
                $transcript
                Caller just said: "$callerUtterance"

                Respond concisely and politely. Ask their name and purpose if unknown.
            """.trimIndent()

            val generation = aiService.generate(prompt, "screening")
            DialogueAction.Speak(generation.text.trim())
        } catch (e: Exception) {
            Log.w(TAG, "Screening turn failed in Gemini Nano", e)
            DialogueAction.Speak("Thank you, please leave a short message and Arshid will get back to you.")
        }
    }

    override suspend fun reasonAndPlan(
        request: String,
        tools: List<ToolDefinition>,
        context: DeviceContext
    ): ExecutionPlan {
        val toolNames = tools.map { it.toolId }.joinToString(", ")
        val prompt = "Plan steps to fulfill: $request. Available tools: $toolNames"
        val response = aiService.generate(prompt, "plan")
        val step = PlanStep(
            intent = KernelIntent(action = IntentAction.PLAN_MULTI_STEP, confidence = 0.8f, rawModelOutput = response.text),
            description = response.text.take(120)
        )
        return ExecutionPlan(goal = request, steps = listOf(step), requiresUserReview = true)
    }

    override suspend fun summarize(text: String, style: SummaryStyle): String {
        return try {
            aiService.generate(text, "summarize").text
        } catch (e: Exception) {
            text.take(100) + "..."
        }
    }

    override suspend fun translate(text: String, fromTag: String, toTag: String): String {
        return text
    }

    companion object {
        private const val TAG = "GeminiNanoAdapter"
    }
}
