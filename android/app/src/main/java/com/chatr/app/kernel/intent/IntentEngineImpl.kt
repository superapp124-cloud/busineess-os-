package com.chatr.app.kernel.intent

import android.util.Log
import com.chatr.app.kernel.ChatrIntelligenceApi
import com.chatr.app.kernel.context.DeviceContext
import com.chatr.app.kernel.entity.EntityEngine
import com.chatr.app.kernel.memory.PersonalMemoryEngine
import com.chatr.app.kernel.tools.ToolDefinition

/**
 * IntentEngineImpl — Orchestrates natural language parsing, memory retrieval,
 * schema validation, and entity resolution into deterministic [KernelIntent]s.
 *
 * HARDENING INVARIANT (Rule 3):
 * All proposed actions from [ChatrIntelligenceApi] pass through [SchemaValidator].
 * Hallucinated actions or illegal parameters are blocked at the boundary and converted
 * to [IntentResult.Failed], ensuring the Trust Kernel only ever evaluates well-formed intents.
 */
class IntentEngineImpl(
    private val intelligenceApi: ChatrIntelligenceApi,
    private val entityEngine: EntityEngine,
    private val memoryEngine: PersonalMemoryEngine? = null
) {

    companion object {
        private const val TAG = "IntentEngineImpl"
    }

    /**
     * Parses a natural-language user utterance into a validated [IntentResult].
     */
    suspend fun parseIntent(input: String, context: DeviceContext): IntentResult {
        Log.i(TAG, "Parsing intent for input: '$input'")

        // 1. Retrieve relevant local memory snapshot
        val snapshot = memoryEngine?.buildSnapshot(queryContext = input)
            ?: com.chatr.app.kernel.memory.MemorySnapshot(
                relevantRecords = emptyList(),
                activeCommitments = emptyList(),
                resolvedEntityNames = emptyMap(),
                queryContext = input
            )

        // 2. Query the intelligence model adapter
        val modelResult = intelligenceApi.evaluateIntent(context, input, snapshot)

        // 3. Process the model result with schema validation and entity resolution
        return when (modelResult) {
            is IntentResult.Resolved -> {
                validateAndResolveEntities(modelResult.intent, input)
            }
            is IntentResult.NeedsEntityResolution -> {
                attemptEntityResolution(modelResult.partialIntent, modelResult.unresolvedTokens, input)
            }
            is IntentResult.NeedsUserClarification -> modelResult
            is IntentResult.Ambiguous -> modelResult
            is IntentResult.Failed -> modelResult
        }
    }

    /**
     * Validates schema and performs entity resolution on a proposed [KernelIntent].
     */
    private suspend fun validateAndResolveEntities(intent: KernelIntent, rawInput: String): IntentResult {
        // A. Hardening Rule 3: Schema Validation
        val validation = SchemaValidator.validate(intent)
        if (validation is SchemaValidationResult.Invalid) {
            val failure = "Schema validation rejected model intent: ${validation.reason}"
            Log.w(TAG, failure)
            return IntentResult.Failed(reason = failure, rawInput = rawInput)
        }

        val validIntent = (validation as SchemaValidationResult.Valid).validatedIntent

        // B. Check if entity resolution is required
        val needsResolution = validIntent.requiresEntityResolution ||
                (validIntent.resolvedEntities.isEmpty() && requiresEntity(validIntent.action))

        if (!needsResolution) {
            return IntentResult.Resolved(validIntent)
        }

        // C. Extract target name/identifier from parameters or raw input
        val queryName = validIntent.parameters["recipient"] as? String
            ?: validIntent.parameters["name"] as? String
            ?: extractRecipientToken(rawInput)

        if (queryName.isNullOrBlank()) {
            return IntentResult.NeedsEntityResolution(
                partialIntent = validIntent,
                unresolvedTokens = listOf("unspecified_recipient")
            )
        }

        // D. Resolve with EntityEngine
        val phoneMatch = entityEngine.resolveByPhone(queryName)
        if (phoneMatch != null) {
            val resolvedIntent = validIntent.copy(
                resolvedEntities = listOf(phoneMatch),
                requiresEntityResolution = false
            )
            return IntentResult.Resolved(resolvedIntent)
        }

        val nameMatches = entityEngine.resolveByName(queryName)
        return when {
            nameMatches.size == 1 -> {
                val resolvedIntent = validIntent.copy(
                    resolvedEntities = listOf(nameMatches.first()),
                    requiresEntityResolution = false
                )
                IntentResult.Resolved(resolvedIntent)
            }
            nameMatches.size > 1 -> {
                val names = nameMatches.joinToString(" or ") { it.canonicalName }
                IntentResult.NeedsUserClarification("Did you mean $names?")
            }
            else -> {
                IntentResult.NeedsEntityResolution(
                    partialIntent = validIntent,
                    unresolvedTokens = listOf(queryName)
                )
            }
        }
    }

    /**
     * Attempts to resolve unresolved tokens from a partial intent.
     */
    private suspend fun attemptEntityResolution(
        partialIntent: KernelIntent,
        tokens: List<String>,
        rawInput: String
    ): IntentResult {
        val resolvedList = mutableListOf<com.chatr.app.kernel.entity.Entity>()
        for (token in tokens) {
            val match = entityEngine.resolveByPhone(token)
                ?: entityEngine.resolveByName(token).firstOrNull()
            if (match != null) {
                resolvedList.add(match)
            }
        }

        return if (resolvedList.isNotEmpty()) {
            val completedIntent = partialIntent.copy(
                resolvedEntities = resolvedList,
                requiresEntityResolution = false
            )
            validateAndResolveEntities(completedIntent, rawInput)
        } else {
            IntentResult.NeedsEntityResolution(partialIntent, tokens)
        }
    }

    /**
     * Generates a multi-step execution plan with schema validation on every plan step.
     */
    suspend fun reasonAndPlan(
        request: String,
        tools: List<ToolDefinition>,
        context: DeviceContext
    ): ExecutionPlan {
        val plan = intelligenceApi.reasonAndPlan(request, tools, context)

        // Validate each step's intent
        val validatedSteps = plan.steps.mapNotNull { step ->
            when (val validation = SchemaValidator.validate(step.intent)) {
                is SchemaValidationResult.Valid -> step.copy(intent = validation.validatedIntent)
                is SchemaValidationResult.Invalid -> {
                    Log.w(TAG, "Dropping invalid plan step '${step.description}': ${validation.reason}")
                    null
                }
            }
        }

        return plan.copy(steps = validatedSteps)
    }

    private fun requiresEntity(action: IntentAction): Boolean = when (action) {
        IntentAction.CALL_PLACE_OUTGOING,
        IntentAction.SMS_SEND,
        IntentAction.MESSAGE_SEND_CHATR,
        IntentAction.MESSAGE_DRAFT -> true
        else -> false
    }

    private fun extractRecipientToken(input: String): String? {
        val lower = input.lowercase()
        val keywords = listOf("call ", "to ", "message ", "tell ", "remind ")
        for (kw in keywords) {
            val idx = lower.indexOf(kw)
            if (idx >= 0) {
                val candidate = input.substring(idx + kw.length).trim()
                    .split(" ")
                    .firstOrNull()
                if (!candidate.isNullOrBlank()) return candidate
            }
        }
        return null
    }
}
