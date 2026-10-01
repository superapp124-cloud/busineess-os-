package com.chatr.app.kernel.tools

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.CalendarContract
import android.telephony.SmsManager
import android.util.Log
import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.trust.TrustDecision
import com.chatr.app.services.AIScreeningService
import com.chatr.app.services.ChatrInCallService
import java.util.TimeZone
import java.util.concurrent.TimeUnit

/**
 * ToolRegistry — The single deterministic execution point for all authorized CHATR actions.
 *
 * HARD SECURITY INVARIANT:
 * No model or background service may execute a tool directly.
 * Every call MUST provide a [TrustDecision.Authorized] instance.
 *
 * The Tool Registry dispatches to:
 *   - Android Telecom / InCallService (answer, hangup, takeover, dial)
 *   - AIScreeningService (multi-turn SI receptionist)
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
                description = "Answers the call and activates the multi-turn SI receptionist",
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
                description = "Stops SI screening and transitions the active call to the human user",
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
                val query = params["query"] as? String ?: ""
                var foundCount = 0
                val results = mutableListOf<String>()

                try {
                    val db = com.chatr.app.kernel.db.ChatrKernelDatabase.get(context)
                    val memories = db.memoryDao().getTopMemories(20)
                    val matched = memories.filter { it.content.contains(query, ignoreCase = true) }
                    foundCount = matched.size
                    matched.take(5).forEach { results.add(it.content) }
                    Log.i(TAG, "memory.search: query='$query' matches=$foundCount | traceId=$traceId")
                } catch (e: Exception) {
                    Log.e(TAG, "memory.search failed: ${e.message}", e)
                }

                ToolResult(
                    traceId = traceId,
                    toolId = "memory.search",
                    success = true,
                    output = mapOf("matchCount" to foundCount, "results" to results)
                )
            }
        )

        // ── 3. Calendar Tool ──────────────────────────────────────────────

        register(
            ToolDefinition(
                toolId = "calendar.create_event",
                displayName = "Create Calendar Event",
                description = "Inserts a new event into the user's primary Google Calendar",
                requiredPermission = "android.permission.WRITE_CALENDAR",
                riskTier = RiskTier.MEDIUM,
                reversible = true,
                parameterSchema = mapOf(
                    "title" to ToolParameterType.STRING,
                    "description" to ToolParameterType.STRING,
                    "durationMinutes" to ToolParameterType.INTEGER,
                    "startOffsetHours" to ToolParameterType.INTEGER
                )
            ) { traceId, params ->
                val title = params["title"] as? String ?: "CHATR Follow-up"
                val description = params["description"] as? String ?: ""
                val durationMinutes = (params["durationMinutes"] as? Long ?: 30L)
                val startOffsetHours = (params["startOffsetHours"] as? Long ?: 24L)

                val startMs = System.currentTimeMillis() + TimeUnit.HOURS.toMillis(startOffsetHours)
                val endMs   = startMs + TimeUnit.MINUTES.toMillis(durationMinutes)

                val values = ContentValues().apply {
                    put(CalendarContract.Events.DTSTART,       startMs)
                    put(CalendarContract.Events.DTEND,         endMs)
                    put(CalendarContract.Events.TITLE,         title)
                    put(CalendarContract.Events.DESCRIPTION,   description)
                    put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().id)
                    put(CalendarContract.Events.CALENDAR_ID,   1L) // primary calendar
                }

                val uri = context.contentResolver.insert(CalendarContract.Events.CONTENT_URI, values)
                val eventId = uri?.lastPathSegment?.toLongOrNull()
                Log.i(TAG, "calendar.create_event: eventId=$eventId | traceId=$traceId")

                ToolResult(
                    traceId = traceId,
                    toolId = "calendar.create_event",
                    success = eventId != null,
                    output = mapOf("eventId" to (eventId ?: -1L), "uri" to (uri?.toString() ?: "")),
                    errorMessage = if (eventId == null) "Failed to insert calendar event" else null
                )
            }
        )

        // ── 4. SMS Tool ───────────────────────────────────────────────────

        register(
            ToolDefinition(
                toolId = "sms.send",
                displayName = "Send SMS",
                description = "Sends a short acknowledgement SMS to the caller",
                requiredPermission = "android.permission.SEND_SMS",
                riskTier = RiskTier.MEDIUM,
                reversible = false,
                parameterSchema = mapOf(
                    "phoneNumber" to ToolParameterType.PHONE_NUMBER,
                    "body" to ToolParameterType.STRING
                )
            ) { traceId, params ->
                val phoneNumber = params["phoneNumber"] as? String ?: ""
                val body = params["body"] as? String ?: ""
                var success = false
                var errorMsg: String? = null

                try {
                    @Suppress("DEPRECATION")
                    val smsManager: SmsManager = SmsManager.getDefault()
                    val parts = smsManager.divideMessage(body)
                    smsManager.sendMultipartTextMessage(phoneNumber, null, parts, null, null)
                    success = true
                    Log.i(TAG, "sms.send: sent ${parts.size}-part SMS to $phoneNumber | traceId=$traceId")
                } catch (e: Exception) {
                    errorMsg = "SMS send failed: ${e.message}"
                    Log.e(TAG, "sms.send failed: ${e.message}", e)
                }

                ToolResult(
                    traceId = traceId,
                    toolId = "sms.send",
                    success = success,
                    errorMessage = errorMsg
                )
            }
        )

        // ── 5. Commitment Write Tool ──────────────────────────────────────

        register(
            ToolDefinition(
                toolId = "memory.write_commitment",
                displayName = "Write Commitment to Memory",
                description = "Persists an explicit commitment to the encrypted on-device personal memory graph",
                requiredPermission = null,
                riskTier = RiskTier.LOW,
                reversible = false,
                parameterSchema = mapOf("description" to ToolParameterType.STRING)
            ) { traceId, params ->
                val description = params["description"] as? String ?: ""
                // The actual Room write happens in PersonalMemoryEngine.createCommitment()
                // which is called directly by PostCallWorkflowEngine.
                // This tool stub confirms tool availability to the Trust Kernel.
                Log.i(TAG, "memory.write_commitment: confirmed | traceId=$traceId | desc='${description.take(60)}'")
                ToolResult(
                    traceId = traceId,
                    toolId = "memory.write_commitment",
                    success = description.isNotBlank(),
                    output = mapOf("description" to description)
                )
            }
        )
    }

    fun register(tool: ToolDefinition) {
        tools[tool.toolId] = tool
    }

    fun findById(toolId: String): ToolDefinition? = tools[toolId]

    fun findForAction(action: IntentAction): ToolDefinition? = when (action) {
        IntentAction.CALL_SCREEN_INCOMING    -> findById("phone.screen_incoming")
        IntentAction.CALL_ANSWER             -> findById("phone.answer")
        IntentAction.CALL_END                -> findById("phone.end")
        IntentAction.CALL_TAKEOVER_FROM_AI   -> findById("phone.takeover")
        IntentAction.CALL_PLACE_OUTGOING     -> findById("phone.place_call")
        IntentAction.MEMORY_SEARCH           -> findById("memory.search")
        IntentAction.MEMORY_WRITE_COMMITMENT -> findById("memory.write_commitment")
        IntentAction.CALENDAR_CREATE_EVENT   -> findById("calendar.create_event")
        IntentAction.SMS_SEND                -> findById("sms.send")
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
