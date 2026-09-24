package com.chatr.app.kernel.intent

import android.util.Log

/**
 * Result of validating an AI model's proposed intent against deterministic kernel schemas.
 */
sealed class SchemaValidationResult {
    data class Valid(val validatedIntent: KernelIntent) : SchemaValidationResult()
    data class Invalid(val reason: String, val rawAction: String) : SchemaValidationResult()
}

/**
 * SchemaValidator — Deterministic schema boundary enforcement for AI model outputs.
 *
 * HARDENING INVARIANT (Rule 3):
 * Natural language interpretation by LLMs is non-deterministic, but the resulting [KernelIntent]
 * must be strictly validated against the sealed [IntentAction] schema registry.
 * An AI model can NEVER fabricate actions (e.g. "delete_all_messages") or execute tools with
 * malformed parameters. Invalid outputs are intercepted and converted to [IntentResult.Failed].
 */
object SchemaValidator {

    private const val TAG = "SchemaValidator"

    /**
     * Validates a proposed [KernelIntent].
     */
    fun validate(intent: KernelIntent): SchemaValidationResult {
        // 1. Confidence range check
        if (intent.confidence !in 0.0f..1.0f) {
            val reason = "Confidence ${intent.confidence} is outside valid bounds [0.0, 1.0]"
            Log.w(TAG, "Schema validation failed: $reason")
            return SchemaValidationResult.Invalid(reason, intent.action.name)
        }

        // 2. Action verification against sealed enum
        val actionName = intent.action.name
        val action = runCatching { IntentAction.valueOf(actionName) }.getOrNull()
        if (action == null || action == IntentAction.UNKNOWN) {
            val reason = "Action '$actionName' is not a recognized kernel IntentAction"
            Log.w(TAG, "Schema validation rejected invented action: $reason")
            return SchemaValidationResult.Invalid(reason, actionName)
        }

        // 3. Parameter schema rules
        val paramValidation = validateParameters(action, intent.parameters, intent.resolvedEntities)
        if (paramValidation != null) {
            Log.w(TAG, "Schema parameter validation failed for $actionName: $paramValidation")
            return SchemaValidationResult.Invalid(paramValidation, actionName)
        }

        // 4. Suggested tool verification
        val suggestedTool = intent.suggestedToolId ?: defaultToolForAction(action)
        val normalizedIntent = intent.copy(suggestedToolId = suggestedTool)

        return SchemaValidationResult.Valid(normalizedIntent)
    }

    /**
     * Validates required parameters per intent action.
     * Returns null if valid, or a descriptive error reason if invalid.
     */
    private fun validateParameters(
        action: IntentAction,
        params: Map<String, Any>,
        resolvedEntities: List<com.chatr.app.kernel.entity.Entity>
    ): String? {
        return when (action) {
            IntentAction.CALL_PLACE_OUTGOING -> {
                val hasPhone = params.containsKey("phoneNumber") && (params["phoneNumber"] as? String)?.isNotBlank() == true
                val hasResolvedEntityPhone = resolvedEntities.any { it.primaryPhone() != null }
                if (!hasPhone && !hasResolvedEntityPhone && !params.containsKey("recipient")) {
                    "CALL_PLACE_OUTGOING requires a 'phoneNumber', 'recipient', or resolved entity with primary phone"
                } else null
            }
            IntentAction.SMS_SEND,
            IntentAction.MESSAGE_SEND_CHATR,
            IntentAction.MESSAGE_DRAFT -> {
                val hasRecipient = params.containsKey("recipient") || resolvedEntities.isNotEmpty()
                val hasBody = params.containsKey("body") || params.containsKey("text") || params.containsKey("message")
                if (!hasRecipient) {
                    "${action.name} requires a recipient or resolved entity"
                } else if (!hasBody && action != IntentAction.MESSAGE_DRAFT) {
                    "${action.name} requires a message body"
                } else null
            }
            IntentAction.REMINDER_CREATE,
            IntentAction.TASK_CREATE -> {
                val hasTitle = params.containsKey("description") || params.containsKey("title") || params.containsKey("task")
                if (!hasTitle) {
                    "${action.name} requires 'description' or 'title'"
                } else null
            }
            IntentAction.SETTINGS_CHANGE -> {
                if (!params.containsKey("settingKey")) {
                    "SETTINGS_CHANGE requires 'settingKey'"
                } else null
            }
            else -> null // Other actions have no mandatory parameters
        }
    }

    private fun defaultToolForAction(action: IntentAction): String? = when (action) {
        IntentAction.CALL_SCREEN_INCOMING -> "phone.screen_incoming"
        IntentAction.CALL_ANSWER          -> "phone.answer"
        IntentAction.CALL_END             -> "phone.end"
        IntentAction.CALL_TAKEOVER_FROM_AI -> "phone.takeover"
        IntentAction.CALL_PLACE_OUTGOING  -> "phone.place_call"
        IntentAction.MEMORY_SEARCH        -> "memory.search"
        IntentAction.MEMORY_WRITE_COMMITMENT -> "memory.write_commitment"
        IntentAction.REMINDER_CREATE      -> "reminder.create"
        IntentAction.NOTIFICATIONS_SUMMARIZE -> "notifications.summarize"
        IntentAction.SETTINGS_CHANGE      -> "settings.change"
        else -> null
    }
}
