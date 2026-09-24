package com.chatr.app.kernel.harness

import android.util.Log
import com.chatr.app.kernel.tools.RiskTier
import com.chatr.app.kernel.tools.ToolCallRecord
import com.chatr.app.kernel.tools.ToolDefinition
import com.chatr.app.kernel.tools.ToolParameterType
import com.chatr.app.kernel.tools.ToolResult

/**
 * MockToolRegistry — A complete Tool Registry where every tool is replaced
 * with a MOCK_ variant that records the call but performs NO real Android action.
 *
 * Used exclusively by the KernelTestHarness during Phase 0.5 development.
 *
 * This lets us run the full cognitive loop thousands of times:
 *   Intent -> Trust -> Tool -> Verify -> Memory
 * without making a single real call, sending a single real message,
 * or touching any real Android system API.
 */
class MockToolRegistry {

    private val _callLog = mutableListOf<ToolCallRecord>()
    val callLog: List<ToolCallRecord> get() = _callLog.toList()

    /** Returns the set of toolIds that were called since the last [reset]. */
    val invokedToolIds: List<String> get() = _callLog.map { it.toolId }

    private fun mockTool(
        toolId: String,
        displayName: String,
        riskTier: RiskTier,
        reversible: Boolean,
        schema: Map<String, ToolParameterType> = emptyMap()
    ): ToolDefinition = ToolDefinition(
        toolId = toolId,
        displayName = displayName,
        description = "[MOCK] $displayName",
        requiredPermission = null,
        riskTier = riskTier,
        reversible = reversible,
        parameterSchema = schema,
        executor = { traceId, parameters ->
            val record = ToolCallRecord(
                toolId = toolId,
                parameters = parameters,
                riskTier = riskTier,
                result = null
            )
            _callLog.add(record)
            Log.d(TAG, "[MOCK TOOL] $toolId called | trace=$traceId | params=$parameters")
            ToolResult(
                traceId = traceId,
                toolId = toolId,
                success = true,
                output = mapOf("mock" to true, "toolId" to toolId)
            )
        }
    )

    val allTools: List<ToolDefinition> = listOf(
        mockTool("phone.screen_incoming", "Screen Incoming Call", RiskTier.LOW, true),
        mockTool("phone.place_call", "Place Outgoing Call", RiskTier.MEDIUM, true,
            mapOf("entityId" to ToolParameterType.ENTITY_ID, "phoneNumber" to ToolParameterType.PHONE_NUMBER)),
        mockTool("phone.answer", "Answer Call", RiskTier.MEDIUM, true),
        mockTool("phone.end", "End Call", RiskTier.MEDIUM, true),
        mockTool("phone.takeover", "Take Over AI-Screened Call", RiskTier.LOW, true),
        mockTool("sms.send", "Send SMS", RiskTier.MEDIUM, false,
            mapOf("phoneNumber" to ToolParameterType.PHONE_NUMBER, "body" to ToolParameterType.STRING)),
        mockTool("chatr.message.send", "Send CHATR Message", RiskTier.MEDIUM, false,
            mapOf("entityId" to ToolParameterType.ENTITY_ID, "body" to ToolParameterType.STRING)),
        mockTool("chatr.message.draft", "Draft Message", RiskTier.LOW, true,
            mapOf("entityId" to ToolParameterType.ENTITY_ID, "body" to ToolParameterType.STRING)),
        mockTool("memory.search", "Search Personal Memory", RiskTier.LOW, true,
            mapOf("query" to ToolParameterType.STRING)),
        mockTool("memory.write_commitment", "Write Commitment", RiskTier.LOW, true,
            mapOf("description" to ToolParameterType.STRING, "entityId" to ToolParameterType.ENTITY_ID)),
        mockTool("calendar.create", "Create Calendar Event", RiskTier.MEDIUM, true,
            mapOf("title" to ToolParameterType.STRING, "timestampMs" to ToolParameterType.TIMESTAMP_MS)),
        mockTool("reminder.create", "Create Reminder", RiskTier.MEDIUM, true,
            mapOf("title" to ToolParameterType.STRING, "timestampMs" to ToolParameterType.TIMESTAMP_MS)),
        mockTool("task.create", "Create Task", RiskTier.LOW, true,
            mapOf("description" to ToolParameterType.STRING)),
        mockTool("notifications.summarize", "Summarize Notifications", RiskTier.LOW, true),
        mockTool("contacts.read", "Read Contacts", RiskTier.LOW, true),
        mockTool("call_log.read", "Read Call Log", RiskTier.LOW, true),
        mockTool("screen.read", "Read Screen Content", RiskTier.LOW, true),
        mockTool("settings.change", "Change Device Setting", RiskTier.HIGH, false,
            mapOf("key" to ToolParameterType.STRING, "value" to ToolParameterType.STRING)),
        mockTool("app.open", "Open Application", RiskTier.LOW, true,
            mapOf("packageName" to ToolParameterType.STRING)),
        mockTool("file.share", "Share File", RiskTier.MEDIUM, false,
            mapOf("filePath" to ToolParameterType.STRING, "entityId" to ToolParameterType.ENTITY_ID)),
        mockTool("session.start", "Start CHATR Session", RiskTier.MEDIUM, true,
            mapOf("entityId" to ToolParameterType.ENTITY_ID)),
        mockTool("translation.enable", "Enable Live Translation", RiskTier.LOW, true,
            mapOf("fromTag" to ToolParameterType.STRING, "toTag" to ToolParameterType.STRING))
    )

    fun findById(toolId: String): ToolDefinition? = allTools.firstOrNull { it.toolId == toolId }

    fun reset() { _callLog.clear() }

    companion object {
        private const val TAG = "MockToolRegistry"
    }
}
