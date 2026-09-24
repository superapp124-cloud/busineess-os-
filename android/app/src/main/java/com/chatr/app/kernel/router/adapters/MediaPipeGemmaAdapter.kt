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
import com.chatr.app.ondeviceai.OnDeviceGemma
import org.json.JSONObject
import java.io.File
import java.util.UUID

/**
 * MediaPipeGemmaAdapter — Wraps OnDeviceGemma (MediaPipe GenAI LlmInference)
 * into the ChatrIntelligenceApi contract.
 */
class MediaPipeGemmaAdapter(
    private val context: Context,
    private val modelPath: String
) : ChatrIntelligenceApi {

    private var _gemma: OnDeviceGemma? = null
    private val gemma: OnDeviceGemma?
        get() {
            if (_gemma == null) {
                val file = File(modelPath)
                if (file.exists()) {
                    try {
                        _gemma = OnDeviceGemma(context, modelPath)
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to instantiate OnDeviceGemma from $modelPath", e)
                    }
                }
            }
            return _gemma
        }

    override val modelId: String = "gemma3-1b-mediapipe"
    override val tier: ModelTier = ModelTier.EDGE_STANDARD

    override suspend fun evaluateIntent(
        context: DeviceContext,
        input: String,
        memory: MemorySnapshot
    ): IntentResult {
        val instance = gemma ?: return IntentResult.Failed("Gemma model not loaded", input)
        return try {
            val prompt = "<start_of_turn>user\nExtract JSON intent for: \"$input\"\nReturn JSON: {\"action\": \"...\", \"confidence\": 0.8}<end_of_turn>\n<start_of_turn>model\n"
            val raw = instance.generate(prompt)
            val jsonText = raw.substringAfter("{").substringBeforeLast("}")
            val json = JSONObject("{$jsonText}")
            val actionName = json.optString("action", "UNKNOWN")
            val action = runCatching { IntentAction.valueOf(actionName) }.getOrDefault(IntentAction.UNKNOWN)
            val confidence = json.optDouble("confidence", 0.75).toFloat()
            IntentResult.Resolved(
                KernelIntent(
                    traceId = UUID.randomUUID().toString(),
                    action = action,
                    confidence = confidence,
                    rawModelOutput = raw
                )
            )
        } catch (e: Exception) {
            IntentResult.Failed(e.message ?: "Gemma intent parsing error", input)
        }
    }

    override suspend fun conductDialogueTurn(
        callerInfo: CallerInfo,
        callerUtterance: String,
        history: List<DialogueTurn>
    ): DialogueAction {
        val instance = gemma ?: return DialogueAction.EndScreening
        val prompt = "Caller: \"$callerUtterance\". As AI receptionist, reply in 1 short sentence:"
        val reply = instance.generate(prompt).trim()
        return DialogueAction.Speak(reply)
    }

    override suspend fun reasonAndPlan(
        request: String,
        tools: List<ToolDefinition>,
        context: DeviceContext
    ): ExecutionPlan {
        val step = PlanStep(
            intent = KernelIntent(action = IntentAction.PLAN_MULTI_STEP, confidence = 0.8f),
            description = "Execute $request via on-device reasoning"
        )
        return ExecutionPlan(goal = request, steps = listOf(step), requiresUserReview = true)
    }

    override suspend fun summarize(text: String, style: SummaryStyle): String {
        val instance = gemma ?: return text.take(80) + "..."
        return instance.generate("Summarize: $text").trim()
    }

    override suspend fun translate(text: String, fromTag: String, toTag: String): String {
        val instance = gemma ?: return text
        return instance.generate("Translate to $toTag: $text").trim()
    }

    companion object {
        private const val TAG = "MediaPipeGemmaAdapter"
    }
}
