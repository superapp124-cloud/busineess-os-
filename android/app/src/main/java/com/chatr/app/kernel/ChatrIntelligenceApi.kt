package com.chatr.app.kernel

import com.chatr.app.kernel.context.DeviceContext
import com.chatr.app.kernel.entity.Entity
import com.chatr.app.kernel.intent.ExecutionPlan
import com.chatr.app.kernel.intent.IntentResult
import com.chatr.app.kernel.memory.MemorySnapshot
import com.chatr.app.kernel.tools.ToolDefinition

/**
 * The capability tier of a given model implementation.
 * The ModelRouter uses this to select the best adapter for a task.
 */
enum class ModelTier {
    /** 0.5B–1B INT4. Lowest latency, fully offline, minimal RAM. */
    EDGE_TINY,
    /** 1B–2B INT4. Balanced. NPU/GPU accelerated where available. */
    EDGE_STANDARD,
    /** 2B–4B INT4. High-capability edge. NPU required. */
    EDGE_LARGE,
    /** Super Brain via Supabase ai-chat-assistant edge function. Requires internet. */
    CLOUD
}

/** Controls the verbosity and structure of a summary output. */
enum class SummaryStyle {
    BRIEF,           // 1–2 sentences
    STRUCTURED,      // bulleted key points
    ACTION_FOCUSED,  // action items only
    FULL             // comprehensive, all detail
}

/** Identifies the speaker in a screening dialogue history. */
enum class DialogueSpeaker { CHATR, CALLER }

/** A single turn of dialogue recorded during GSM call screening. */
data class DialogueTurn(
    val speaker: DialogueSpeaker,
    val text: String,
    val timestampMs: Long = System.currentTimeMillis()
)

/** Contextual information about an incoming caller passed to the dialogue API. */
data class CallerInfo(
    val phoneNumber: String,
    val resolvedEntity: Entity?,
    val spamRisk: Float,          // 0.0 = clean, 1.0 = certain spam
    val intentLabel: String?      // from IntentPredictor, e.g. "delivery", "recruiter"
)

/** The action the AI model requests during a screening dialogue turn. */
sealed class DialogueAction {
    /** Speak this text to the caller via TTS. */
    data class Speak(
        val text: String,
        val languageTag: String = "en-US"
    ) : DialogueAction()

    /** The caller's purpose has been determined. Emit a structured intent. */
    data class ExtractIntent(
        val intent: com.chatr.app.kernel.intent.KernelIntent
    ) : DialogueAction()

    /** Screening is complete. Route call per risk score. */
    object EndScreening : DialogueAction()

    /** Continue listening without speaking. */
    object ContinueListening : DialogueAction()
}

/**
 * ChatrIntelligenceApi — The single, model-agnostic intelligence contract
 * that the CHATR kernel depends on for all AI capabilities.
 *
 * INVARIANT: The kernel NEVER imports any model SDK (OnDeviceGemma,
 * GenerativeModel, Gemini SDK, etc.) directly. All model implementations
 * are adapters of this interface, registered with the ModelRouter.
 *
 * Current adapters (in kernel/router/adapters/):
 *   - GeminiNanoAdapter    : wraps OnDeviceAiService (ML Kit AICore / Gemini Nano)
 *   - MediaPipeGemmaAdapter: wraps OnDeviceGemma (MediaPipe LLM Inference, Gemma 3 1B)
 *   - SuperBrainAdapter    : wraps Supabase Edge Function ai-chat-assistant
 *
 * Optimization target: useful intelligence per MB of RAM + ms of latency + mW of power.
 * NOT parameter count.
 */
interface ChatrIntelligenceApi {

    /** Unique identifier for this model adapter. */
    val modelId: String

    /** The capability tier of this adapter. */
    val tier: ModelTier

    /** True if this adapter can operate without a network connection. */
    val isOfflineCapable: Boolean get() = tier != ModelTier.CLOUD

    /**
     * Evaluates a natural-language [input] in the context of the current device
     * state and a snapshot of personal memory. Returns a structured [IntentResult].
     *
     * The Intent Engine calls this. The result is then passed to the Trust Kernel.
     * This method NEVER executes any tool or action.
     */
    suspend fun evaluateIntent(
        context: DeviceContext,
        input: String,
        memory: MemorySnapshot
    ): IntentResult

    /**
     * Conducts a single turn of a live screening conversation with a GSM caller.
     *
     * @param callerInfo       Identity, risk, and intent context for the caller.
     * @param callerUtterance  The text of what the caller just said (from STT).
     * @param history          All previous turns in this screening session.
     * @return A [DialogueAction] instructing the screening service what to do next.
     */
    suspend fun conductDialogueTurn(
        callerInfo: CallerInfo,
        callerUtterance: String,
        history: List<DialogueTurn>
    ): DialogueAction

    /**
     * Produces an ordered [ExecutionPlan] for a complex multi-step [request].
     * The plan is constrained to the provided [tools]; the model cannot propose
     * tools outside this set.
     */
    suspend fun reasonAndPlan(
        request: String,
        tools: List<ToolDefinition>,
        context: DeviceContext
    ): ExecutionPlan

    /**
     * Summarizes [text] in the requested [style].
     * Used by CallSummaryEngine, MorningBriefAgent, MeetingBriefAgent.
     */
    suspend fun summarize(text: String, style: SummaryStyle): String

    /**
     * Translates [text] from BCP-47 language tag [fromTag] to [toTag].
     * Used by the LiveTranslationPipeline during CHATR Connect sessions.
     */
    suspend fun translate(text: String, fromTag: String, toTag: String): String
}
