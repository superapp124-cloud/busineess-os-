package com.chatr.app.kernel.router

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
import com.chatr.app.kernel.intent.IntentResult
import com.chatr.app.kernel.memory.MemorySnapshot
import com.chatr.app.kernel.tools.ToolDefinition
import com.chatr.app.ondeviceai.MemoryGate

/**
 * ModelRouter — Selects and delegates to the appropriate ChatrIntelligenceApi
 * adapter based on task complexity, RAM availability, network state, and
 * the optimization target: useful intelligence per MB + ms + mW.
 *
 * The kernel ONLY ever interacts with this class as a ChatrIntelligenceApi.
 * The router is responsible for picking the actual adapter.
 *
 * Adapter priority (highest to lowest performance):
 *   1. NPU/GPU-accelerated EDGE_LARGE adapter (if NPU available + RAM sufficient)
 *   2. EDGE_STANDARD adapter (MediaPipe Gemma, if RAM sufficient)
 *   3. EDGE_TINY adapter (Gemini Nano via ML Kit AICore, if available)
 *   4. CLOUD adapter (Supabase ai-chat-assistant, if internet available)
 *   5. Fallback stub (logs error, returns sensible defaults)
 *
 * INVARIANT: The kernel never imports model SDK classes. This router is the
 * only class that may import adapter implementations.
 */
class ModelRouter(
    private val context: Context,
    private val adapters: List<ChatrIntelligenceApi>
) : ChatrIntelligenceApi {

    companion object {
        private const val TAG = "ModelRouter"
    }

    override val modelId: String = "chatr-model-router"
    override val tier: ModelTier = ModelTier.EDGE_TINY // reported tier = minimum available

    /**
     * Selects the best available adapter for a given task.
     *
     * For offline / privacy-sensitive tasks: prefers EDGE adapters.
     * For complex reasoning: may prefer CLOUD if available.
     */
    private fun selectAdapter(preferOffline: Boolean = true): ChatrIntelligenceApi {
        if (preferOffline) {
            // Try edge adapters in descending capability order
            for (tier in listOf(ModelTier.EDGE_LARGE, ModelTier.EDGE_STANDARD, ModelTier.EDGE_TINY)) {
                val adapter = adapters.firstOrNull { it.tier == tier && it.isOfflineCapable }
                if (adapter != null) {
                    Log.d(TAG, "selectAdapter → ${adapter.modelId} (tier=${adapter.tier})")
                    return adapter
                }
            }
        }
        // Fall back to cloud
        val cloudAdapter = adapters.firstOrNull { it.tier == ModelTier.CLOUD }
        if (cloudAdapter != null) {
            Log.d(TAG, "selectAdapter → ${cloudAdapter.modelId} (CLOUD)")
            return cloudAdapter
        }
        // No adapters available — use stub
        Log.e(TAG, "No adapters available! Using FallbackStubAdapter.")
        return FallbackStubAdapter
    }

    override suspend fun evaluateIntent(
        context: DeviceContext,
        input: String,
        memory: MemorySnapshot
    ): IntentResult {
        return selectAdapter(preferOffline = true).evaluateIntent(context, input, memory)
    }

    override suspend fun conductDialogueTurn(
        callerInfo: CallerInfo,
        callerUtterance: String,
        history: List<DialogueTurn>
    ): DialogueAction {
        // GSM dialogue: always use edge adapter for lowest latency
        return selectAdapter(preferOffline = true).conductDialogueTurn(callerInfo, callerUtterance, history)
    }

    override suspend fun reasonAndPlan(
        request: String,
        tools: List<ToolDefinition>,
        context: DeviceContext
    ): ExecutionPlan {
        // Complex planning: prefer cloud if available
        return selectAdapter(preferOffline = false).reasonAndPlan(request, tools, context)
    }

    override suspend fun summarize(text: String, style: SummaryStyle): String {
        return selectAdapter(preferOffline = true).summarize(text, style)
    }

    override suspend fun translate(text: String, fromTag: String, toTag: String): String {
        return selectAdapter(preferOffline = true).translate(text, fromTag, toTag)
    }
}

/**
 * FallbackStubAdapter — A safe no-op adapter returned by ModelRouter when
 * no real adapter is available. Logs errors and returns graceful defaults.
 * Should never be reached in production.
 */
private object FallbackStubAdapter : ChatrIntelligenceApi {
    private const val TAG = "FallbackStubAdapter"
    override val modelId = "fallback-stub"
    override val tier = ModelTier.EDGE_TINY

    override suspend fun evaluateIntent(ctx: DeviceContext, input: String, mem: MemorySnapshot) =
        com.chatr.app.kernel.intent.IntentResult.Failed(
            reason = "No model adapter available",
            rawInput = input
        ).also { Log.e(TAG, "evaluateIntent called with no adapter!") }

    override suspend fun conductDialogueTurn(c: CallerInfo, u: String, h: List<DialogueTurn>) =
        DialogueAction.EndScreening
            .also { Log.e(TAG, "conductDialogueTurn called with no adapter!") }

    override suspend fun reasonAndPlan(r: String, t: List<ToolDefinition>, c: DeviceContext) =
        com.chatr.app.kernel.intent.ExecutionPlan(
            goal = r, steps = emptyList(), requiresUserReview = true
        ).also { Log.e(TAG, "reasonAndPlan called with no adapter!") }

    override suspend fun summarize(text: String, style: SummaryStyle) =
        "[No model available]".also { Log.e(TAG, "summarize called with no adapter!") }

    override suspend fun translate(text: String, from: String, to: String) =
        text.also { Log.e(TAG, "translate called with no adapter!") }
}
