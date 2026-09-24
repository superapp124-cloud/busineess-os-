package com.chatr.app.kernel.harness

import com.chatr.app.kernel.trace.ExecutionTrace
import com.chatr.app.kernel.trace.TraceOutcome

/**
 * The result of a single synthetic kernel loop execution in the test harness.
 *
 * Used exclusively for development/testing. Not used in production code paths.
 */
data class HarnessResult(
    val input: String,
    val trace: ExecutionTrace,
    val mockToolsInvoked: List<String>,
    val expectedOutcome: TraceOutcome?,
    val passed: Boolean,
    val failureReason: String? = null
) {
    fun prettyPrint(): String = buildString {
        appendLine("=== HARNESS RESULT ===")
        appendLine("Input     : $input")
        appendLine("Outcome   : ${trace.outcome}")
        appendLine("Passed    : $passed")
        appendLine("Risk Score: ${trace.riskScore}")
        appendLine("Trust     : ${trace.trustDecision?.javaClass?.simpleName}")
        appendLine("Intent    : ${trace.intent?.action}")
        appendLine("Tools     : $mockToolsInvoked")
        appendLine("Entities  : ${trace.resolvedEntityIds}")
        appendLine("Memory In : ${trace.memoriesUsedIds.size} records")
        appendLine("Memory Out: ${trace.memoryRecordsWrittenIds.size} records")
        if (failureReason != null) appendLine("FAILURE   : $failureReason")
    }
}
