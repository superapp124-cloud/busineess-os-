package com.chatr.app.kernel.harness

import android.util.Log
import com.chatr.app.kernel.ChatrIntelligenceApi
import com.chatr.app.kernel.SummaryStyle
import com.chatr.app.kernel.context.DeviceContext
import com.chatr.app.kernel.context.DeviceState
import com.chatr.app.kernel.context.NetworkType
import com.chatr.app.kernel.context.TimeContext
import com.chatr.app.kernel.entity.Entity
import com.chatr.app.kernel.entity.EntityType
import com.chatr.app.kernel.intent.IntentResult
import com.chatr.app.kernel.memory.Commitment
import com.chatr.app.kernel.memory.MemoryRecord
import com.chatr.app.kernel.memory.MemorySnapshot
import com.chatr.app.kernel.memory.MemoryType
import com.chatr.app.kernel.tools.ToolResult
import com.chatr.app.kernel.trace.ChatrSurface
import com.chatr.app.kernel.trace.ExecutionTrace
import com.chatr.app.kernel.trace.TraceOutcome
import com.chatr.app.kernel.trust.TrustDecision
import com.chatr.app.kernel.trust.TrustPermissionKernel
import java.util.UUID

/**
 * KernelTestHarness — A completely synthetic environment for testing the full
 * CHATR cognitive loop without executing any real Android action.
 *
 * Purpose (Phase 0.5):
 *   Run the entire Understand -> Remember -> Reason -> Plan -> Trust -> Act ->
 *   Verify -> Remember Result loop with mock components. This allows:
 *     - Testing thousands of intent/trust/tool combinations safely
 *     - Verifying the Trust boundary is enforced correctly
 *     - Ensuring ExecutionTrace is fully populated for every scenario
 *     - Catching Trust Kernel regressions before any real phone integration
 *
 * Usage:
 *   val harness = KernelTestHarness(
 *       intelligence = MockIntelligenceAdapter(),
 *       trustKernel = TrustPermissionKernelImpl(),
 *       toolRegistry = MockToolRegistry()
 *   )
 *   val result = harness.run("Call Ahmed after work and remind me about the proposal")
 *   println(result.prettyPrint())
 */
class KernelTestHarness(
    private val intelligence: ChatrIntelligenceApi,
    private val trustKernel: TrustPermissionKernel,
    private val toolRegistry: MockToolRegistry,
    private val surface: ChatrSurface = ChatrSurface.AI
) {

    /**
     * Runs the full cognitive loop for [input] using mock components.
     *
     * Steps:
     *   1. UNDERSTAND: Evaluate intent via [intelligence]
     *   2. REMEMBER: Build a MemorySnapshot from [seedMemory]
     *   3. REASON/PLAN: Resolve the intent result
     *   4. TRUST GATE: Evaluate via [trustKernel]
     *   5. ACT: Execute via [toolRegistry] (mock only, no real actions)
     *   6. VERIFY: Confirm tool success
     *   7. REMEMBER RESULT: Produce memory write IDs (simulated)
     *
     * @param input          The natural-language input string.
     * @param seedEntities   Entities to pre-seed the entity context.
     * @param seedMemory     Memory records to include in the snapshot.
     * @param expectedOutcome Optional expected outcome for assertion.
     * @param contextConfidence Context confidence passed to the Trust Kernel (default 1.0).
     */
    suspend fun run(
        input: String,
        seedEntities: List<Entity> = emptyList(),
        seedMemory: List<MemoryRecord> = emptyList(),
        expectedOutcome: TraceOutcome? = null,
        contextConfidence: Float = 1.0f
    ): HarnessResult {
        val traceId = UUID.randomUUID().toString()
        val startMs = System.currentTimeMillis()
        Log.d(TAG, "[HARNESS] run() traceId=$traceId input=\"$input\"")

        // -- 1. UNDERSTAND --
        val context = buildMockContext(seedEntities)
        val snapshot = buildMockSnapshot(input, seedMemory, seedEntities)

        val intentResult = intelligence.evaluateIntent(context, input, snapshot)

        // -- 2. REASON --
        val kernelIntent = when (intentResult) {
            is IntentResult.Resolved -> intentResult.intent.copy(traceId = traceId)
            is IntentResult.NeedsEntityResolution -> intentResult.partialIntent.copy(traceId = traceId)
            is IntentResult.Ambiguous -> intentResult.candidates.firstOrNull()?.copy(traceId = traceId)
                ?: return failResult(input, traceId, startMs, "Ambiguous intent, no candidates",
                    expectedOutcome, snapshot)
            is IntentResult.NeedsUserClarification -> return failResult(
                input, traceId, startMs, "Clarification required: ${intentResult.question}",
                expectedOutcome, snapshot
            )
            is IntentResult.Failed -> return failResult(
                input, traceId, startMs, "Intent parsing failed: ${intentResult.reason}",
                expectedOutcome, snapshot
            )
        }

        // -- 3. TRUST GATE --
        val trustDecision = trustKernel.evaluate(kernelIntent, contextConfidence)
        val riskScore = trustDecision.riskScore

        val toolsInvoked = mutableListOf<String>()
        var toolResult: ToolResult? = null
        var outcome: TraceOutcome
        var verificationNote: String? = null
        val memoryWritten = mutableListOf<String>()

        when (trustDecision) {
            is TrustDecision.Blocked -> {
                Log.w(TAG, "[HARNESS] BLOCKED: ${trustDecision.reason}")
                outcome = TraceOutcome.BLOCKED_BY_TRUST
            }

            is TrustDecision.RequiresBiometric -> {
                // In harness: auto-authorize biometric for test flow
                Log.d(TAG, "[HARNESS] RequiresBiometric — auto-authorizing in harness")
                val authorized = trustKernel.authorizeWithBiometric(trustDecision)
                toolResult = executeMockTool(authorized.intent.suggestedToolId, traceId,
                    authorized.intent.parameters, toolsInvoked)
                outcome = if (toolResult?.success == true) TraceOutcome.SUCCESS else TraceOutcome.TOOL_FAILED
                verificationNote = "Biometric auto-authorized in harness"
                if (outcome == TraceOutcome.SUCCESS) {
                    memoryWritten.add("mock_memory_${UUID.randomUUID().toString().take(8)}")
                }
            }

            is TrustDecision.RequiresConfirmation -> {
                // In harness: auto-confirm MEDIUM risk for test flow
                Log.d(TAG, "[HARNESS] RequiresConfirmation — auto-confirming in harness")
                val authorized = trustKernel.confirmDecision(trustDecision)
                toolResult = executeMockTool(authorized.intent.suggestedToolId, traceId,
                    authorized.intent.parameters, toolsInvoked)
                outcome = if (toolResult?.success == true) TraceOutcome.SUCCESS else TraceOutcome.TOOL_FAILED
                verificationNote = "User confirmation auto-granted in harness"
                if (outcome == TraceOutcome.SUCCESS) {
                    memoryWritten.add("mock_memory_${UUID.randomUUID().toString().take(8)}")
                }
            }

            is TrustDecision.Authorized -> {
                toolResult = executeMockTool(trustDecision.intent.suggestedToolId, traceId,
                    trustDecision.intent.parameters, toolsInvoked)
                outcome = if (toolResult?.success == true) TraceOutcome.SUCCESS else TraceOutcome.TOOL_FAILED
                if (outcome == TraceOutcome.SUCCESS) {
                    memoryWritten.add("mock_memory_${UUID.randomUUID().toString().take(8)}")
                }
            }
        }

        val trace = ExecutionTrace(
            traceId = traceId,
            surface = surface,
            startedAtMs = startMs,
            completedAtMs = System.currentTimeMillis(),
            rawInput = input,
            modelId = intelligence.modelId,
            memorySnapshotId = snapshot.snapshotId,
            memoriesUsedIds = snapshot.relevantRecords.map { it.recordId },
            resolvedEntityIds = seedEntities.map { it.entityId },
            intent = kernelIntent,
            plan = null,
            riskScore = riskScore,
            trustDecision = trustDecision,
            toolCalls = emptyList(),
            verified = toolResult?.success == true,
            verificationNote = verificationNote,
            memoryRecordsWrittenIds = memoryWritten,
            outcome = outcome
        )

        val passed = expectedOutcome == null || outcome == expectedOutcome
        return HarnessResult(
            input = input,
            trace = trace,
            mockToolsInvoked = toolsInvoked,
            expectedOutcome = expectedOutcome,
            passed = passed,
            failureReason = if (!passed) "Expected $expectedOutcome but got $outcome" else null
        )
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private suspend fun executeMockTool(
        toolId: String?,
        traceId: String,
        parameters: Map<String, Any>,
        invokedList: MutableList<String>
    ): ToolResult? {
        if (toolId == null) {
            // Fall back to first LOW-risk mock tool
            val fallback = toolRegistry.allTools.firstOrNull { it.riskTier == com.chatr.app.kernel.tools.RiskTier.LOW }
            if (fallback != null) {
                invokedList.add(fallback.toolId)
                return fallback.executor(traceId, parameters)
            }
            return null
        }
        val tool = toolRegistry.findById(toolId) ?: run {
            Log.w(TAG, "[HARNESS] toolId=$toolId not found in MockToolRegistry")
            return null
        }
        invokedList.add(toolId)
        return tool.executor(traceId, parameters)
    }

    private fun buildMockContext(entities: List<Entity>): DeviceContext = DeviceContext(
        activeEntityIds = entities.map { it.entityId },
        timeContext = TimeContext(
            currentTimeMs = System.currentTimeMillis(),
            timeZoneId = "Asia/Kolkata",
            dayOfWeek = "TUESDAY",
            isWorkingHours = true,
            nextCalendarEventTitle = null,
            minutesToNextEvent = null
        ),
        deviceState = DeviceState(
            batteryPercent = 85,
            isCharging = false,
            networkType = NetworkType.WIFI,
            isScreenOn = true,
            isPhoneLocked = false,
            isDoNotDisturbActive = false
        )
    )

    private fun buildMockSnapshot(
        query: String,
        records: List<MemoryRecord>,
        entities: List<Entity>
    ): MemorySnapshot = MemorySnapshot(
        relevantRecords = records,
        activeCommitments = emptyList(),
        resolvedEntityNames = entities.associate { it.entityId to it.canonicalName },
        queryContext = query
    )

    private fun failResult(
        input: String,
        traceId: String,
        startMs: Long,
        reason: String,
        expected: TraceOutcome?,
        snapshot: MemorySnapshot
    ): HarnessResult {
        val trace = ExecutionTrace(
            traceId = traceId,
            surface = surface,
            startedAtMs = startMs,
            completedAtMs = System.currentTimeMillis(),
            rawInput = input,
            modelId = intelligence.modelId,
            memorySnapshotId = snapshot.snapshotId,
            intent = null,
            plan = null,
            riskScore = 0f,
            trustDecision = null,
            outcome = TraceOutcome.MODEL_FAILED,
            errorMessage = reason
        )
        return HarnessResult(
            input = input,
            trace = trace,
            mockToolsInvoked = emptyList(),
            expectedOutcome = expected,
            passed = expected == null || expected == TraceOutcome.MODEL_FAILED,
            failureReason = reason
        )
    }

    companion object {
        private const val TAG = "KernelTestHarness"

        /** Convenience factory: creates a harness with all mocks and a TrustPermissionKernelImpl. */
        fun create(
            trustKernel: TrustPermissionKernel,
            intelligence: ChatrIntelligenceApi = MockIntelligenceAdapter(),
            surface: ChatrSurface = ChatrSurface.AI
        ): KernelTestHarness = KernelTestHarness(
            intelligence = intelligence,
            trustKernel = trustKernel,
            toolRegistry = MockToolRegistry(),
            surface = surface
        )
    }
}
