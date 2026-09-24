package com.chatr.app.kernel.tools

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.trust.TrustDecision
import com.chatr.app.services.AIScreeningService
import com.chatr.app.services.ChatrInCallService

/**
 * ToolRegistry — The single deterministic execution point for all authorized CHATR actions.
 *
 * HARD SECURITY INVARIANT:
 * No model or background service may execute a tool directly.
 * Every call MUST provide a [TrustDecision.Authorized] instance.
 *
 * The Tool Registry dispatches to:
 *   - Android Telecom / InCallService (answer, hangup, takeover, dial)
 *   - AIScreeningService (multi-turn AI receptionist)
 *   - SMS / Messaging
 *   - Memory & Personal Storage
 */
class ToolRegistry(private val context: Context) {

    private val tools = mutableMapOf<String, ToolDefinition>()

    init {
        registerDefaultTools()
    }

    private fun registerDefaultTools() {
        // ── 1. Telephony & GSM Screening Tools ───────────────────────────

        register(
            ToolDefinition(
                toolId = "phone.screen_incoming",
                displayName = "Screen Incoming GSM Call",
                description = "Answers the call and activates the multi-turn AI receptionist",
                requiredPermission = "android.permission.ANSWER_PHONE_CALLS",
                riskTier = RiskTier.LOW,
                reversible = true,
                parameterSchema = mapOf("phoneNumber" to ToolParameterType.PHONE_NUMBER)
            ) { traceId, params ->
                val number = params["phoneNumber"] as? String ?: ""
                val mode = params["mode"] as? String ?: "MODE_DEFAULT"
                // Programmatically answer the incoming ringing call
                val answered = ChatrInCallService.answerCall()
                Log.i(TAG, "phone.screen_incoming: answered=$answered | traceId=$traceId")
                AIScreeningService.start(context, number, mode)
                ToolResult(
                    traceId = traceId,
                    toolId = "phone.screen_incoming",
                    success = true,
                    output = mapOf("answered" to answered, "screeningStarted" to true)
                )
            }
        )

        register(
            ToolDefinition(
                toolId = "phone.answer",
                displayName = "Answer Active Call",
                description = "Answers the ringing incoming call",
                requiredPermission = "android.permission.ANSWER_PHONE_CALLS",
                riskTier = RiskTier.MEDIUM,
                reversible = true,
                parameterSchema = emptyMap()
            ) { traceId, _ ->
                val success = ChatrInCallService.answerCall()
                ToolResult(traceId = traceId, toolId = "phone.answer", success = success)
            }
        )

        register(
            ToolDefinition(
                toolId = "phone.end",
                displayName = "End Active Call",
                description = "Disconnects the ongoing GSM call",
                requiredPermission = null,
                riskTier = RiskTier.MEDIUM,
                reversible = false,
                parameterSchema = emptyMap()
            ) { traceId, _ ->
                AIScreeningService.stop(context)
                val success = ChatrInCallService.disconnectCall()
                ToolResult(traceId = traceId, toolId = "phone.end", success = success)
            }
        )

        register(
            ToolDefinition(
                toolId = "phone.takeover",
                displayName = "Take Over Screened Call",
                description = "Stops AI screening and transitions the active call to the human user",
                requiredPermission = null,
                riskTier = RiskTier.LOW,
                reversible = true,
                parameterSchema = emptyMap()
            ) { traceId, _ ->
                Log.i(TAG, "Executing human takeover via ToolRegistry")
                AIScreeningService.stop(context)
                val success = ChatrInCallService.handoverToHuman()
                ToolResult(traceId = traceId, toolId = "phone.takeover", success = success)
            }
        )

        register(
            ToolDefinition(
                toolId = "phone.place_call",
                displayName = "Place Outgoing Call",
                description = "Places an outgoing phone call",
                requiredPermission = "android.permission.CALL_PHONE",
                riskTier = RiskTier.MEDIUM,
                reversible = true,
                parameterSchema = mapOf("phoneNumber" to ToolParameterType.PHONE_NUMBER)
            ) { traceId, params ->
                val number = params["phoneNumber"] as? String ?: ""
                val intent = Intent(Intent.ACTION_CALL, Uri.parse("tel:$number")).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                ToolResult(traceId = traceId, toolId = "phone.place_call", success = true)
            }
        )

        // ── 2. Memory & Observation Tools ────────────────────────────────

        register(
            ToolDefinition(
                toolId = "memory.search",
                displayName = "Search Personal Memory",
                description = "Queries the encrypted local vector and property graph",
                requiredPermission = null,
                riskTier = RiskTier.LOW,
                reversible = true,
                parameterSchema = mapOf("query" to ToolParameterType.STRING)
            ) { traceId, params ->
                // Search stub; Phase 2 PersonalMemoryEngine connects here
                ToolResult(traceId = traceId, toolId = "memory.search", success = true)
            }
        )
    }

    fun register(tool: ToolDefinition) {
        tools[tool.toolId] = tool
    }

    fun findById(toolId: String): ToolDefinition? = tools[toolId]

    fun findForAction(action: IntentAction): ToolDefinition? = when (action) {
        IntentAction.CALL_SCREEN_INCOMING -> findById("phone.screen_incoming")
        IntentAction.CALL_ANSWER          -> findById("phone.answer")
        IntentAction.CALL_END             -> findById("phone.end")
        IntentAction.CALL_TAKEOVER_FROM_AI -> findById("phone.takeover")
        IntentAction.CALL_PLACE_OUTGOING  -> findById("phone.place_call")
        IntentAction.MEMORY_SEARCH        -> findById("memory.search")
        else -> null
    }

    /**
     * The ONLY legal method to execute an action in the entire CHATR system.
     * Enforced at compile time: requires a verified [TrustDecision.Authorized] instance.
     */
    suspend fun executeAuthorized(
        authorized: TrustDecision.Authorized
    ): ToolResult {
        val toolId = authorized.intent.suggestedToolId
            ?: findForAction(authorized.intent.action)?.toolId
            ?: return ToolResult(
                traceId = authorized.intent.traceId,
                toolId = "unknown",
                success = false,
                errorMessage = "No registered tool for action ${authorized.intent.action}"
            )

        val tool = findById(toolId) ?: return ToolResult(
            traceId = authorized.intent.traceId,
            toolId = toolId,
            success = false,
            errorMessage = "Tool $toolId not found in registry"
        )

        Log.i(TAG, "Executing tool: $toolId | traceId=${authorized.intent.traceId} | reason=${authorized.reason}")
        return tool.executor(authorized.intent.traceId, authorized.intent.parameters)
    }

    companion object {
        private const val TAG = "ToolRegistry"
    }
}
