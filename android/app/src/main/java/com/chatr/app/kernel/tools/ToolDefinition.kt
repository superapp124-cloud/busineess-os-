package com.chatr.app.kernel.tools

import java.util.UUID

/**
 * Risk tier for a tool action.
 * Determines which gate in the Trust Kernel applies before execution.
 */
enum class RiskTier {
    /** Executes automatically. Read operations, drafts, local memory queries. */
    LOW,
    /** Requires user confirmation via a HUD card. Sending, calling, creating. */
    MEDIUM,
    /** Requires explicit biometric/PIN confirmation. Delete, financial, security. */
    HIGH
}

enum class ToolParameterType {
    STRING, PHONE_NUMBER, ENTITY_ID, TIMESTAMP_MS, BOOLEAN, INTEGER, JSON_OBJECT
}

data class ToolResult(
    val traceId: String,
    val toolId: String,
    val success: Boolean,
    val output: Map<String, Any> = emptyMap(),
    val errorMessage: String? = null,
    val executedAtMs: Long = System.currentTimeMillis(),
    val executionDurationMs: Long = 0
)

data class ToolCallRecord(
    val callId: String = UUID.randomUUID().toString(),
    val toolId: String,
    val parameters: Map<String, Any>,
    val riskTier: RiskTier,
    val result: ToolResult?,
    val skippedReason: String? = null
)

/**
 * Definition of a single tool in the CHATR Tool Registry.
 *
 * INVARIANT: The kernel's Tool Engine is the ONLY entity that may call [executor].
 * The AI model NEVER receives a reference to [executor] directly.
 * The AI model proposes a KernelIntent. The Trust Kernel authorizes it.
 * The Tool Engine looks up the ToolDefinition and calls [executor].
 */
data class ToolDefinition(
    val toolId: String,
    val displayName: String,
    val description: String,
    val requiredPermission: String?,
    val riskTier: RiskTier,
    val reversible: Boolean,
    val parameterSchema: Map<String, ToolParameterType>,
    val executor: suspend (traceId: String, parameters: Map<String, Any>) -> ToolResult
) {
    // equals/hashCode/toString based on toolId only, since executor is a lambda
    override fun equals(other: Any?): Boolean =
        other is ToolDefinition && toolId == other.toolId
    override fun hashCode(): Int = toolId.hashCode()
    override fun toString(): String = "ToolDefinition(toolId=$toolId, risk=$riskTier, reversible=$reversible)"
}
