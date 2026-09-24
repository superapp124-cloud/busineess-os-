package com.chatr.app.kernel

import com.chatr.app.kernel.entity.Entity
import com.chatr.app.kernel.entity.EntityType
import com.chatr.app.kernel.entity.Identifier
import com.chatr.app.kernel.entity.IdentifierType
import com.chatr.app.kernel.harness.KernelTestHarness
import com.chatr.app.kernel.harness.MockIntelligenceAdapter
import com.chatr.app.kernel.harness.MockToolRegistry
import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.intent.IntentResult
import com.chatr.app.kernel.intent.KernelIntent
import com.chatr.app.kernel.trace.TraceOutcome
import com.chatr.app.kernel.trust.TrustDecision
import com.chatr.app.kernel.trust.TrustPermissionKernelImpl
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.UUID

class KernelTestHarnessTest {

    private val trustKernel = TrustPermissionKernelImpl()
    private val toolRegistry = MockToolRegistry()

    @Test
    fun testLowRiskIntentAutoExecutes() = runBlocking {
        val adapter = MockIntelligenceAdapter.withResponses(
            "summarize" to IntentResult.Resolved(
                KernelIntent(
                    traceId = UUID.randomUUID().toString(),
                    action = IntentAction.NOTIFICATIONS_SUMMARIZE,
                    confidence = 0.95f,
                    suggestedToolId = "notifications.summarize"
                )
            )
        )
        val harness = KernelTestHarness(adapter, trustKernel, toolRegistry)
        val result = harness.run("Summarize my notifications")

        assertTrue("Should pass", result.passed)
        assertEquals(TraceOutcome.SUCCESS, result.trace.outcome)
        assertTrue("Decision should be Authorized", result.trace.trustDecision is TrustDecision.Authorized)
        assertTrue("Mock tool should have been invoked", result.mockToolsInvoked.contains("notifications.summarize"))
        assertTrue("Trace verified should be true", result.trace.verified)
    }

    @Test
    fun testMediumRiskIntentRequiresConfirmation() = runBlocking {
        val testEntity = Entity(
            entityId = "person_ahmed",
            type = EntityType.PERSON,
            canonicalName = "Ahmed",
            identifiers = listOf(Identifier(IdentifierType.PHONE_E164, "+919717100000", isPrimary = true)),
            trustScore = 0.85f
        )
        val adapter = MockIntelligenceAdapter.withResponses(
            "call" to IntentResult.Resolved(
                KernelIntent(
                    traceId = UUID.randomUUID().toString(),
                    action = IntentAction.CALL_PLACE_OUTGOING,
                    confidence = 0.90f,
                    resolvedEntities = listOf(testEntity),
                    suggestedToolId = "phone.place_call"
                )
            )
        )
        val harness = KernelTestHarness(adapter, trustKernel, toolRegistry)
        val result = harness.run("Call Ahmed", seedEntities = listOf(testEntity))

        assertTrue("Should pass", result.passed)
        assertTrue("Decision should be RequiresConfirmation", result.trace.trustDecision is TrustDecision.RequiresConfirmation)
        assertTrue("Mock tool should have been invoked after auto-confirmation", result.mockToolsInvoked.contains("phone.place_call"))
    }

    @Test
    fun testHighRiskIntentRequiresBiometric() = runBlocking {
        val adapter = MockIntelligenceAdapter.withResponses(
            "settings" to IntentResult.Resolved(
                KernelIntent(
                    traceId = UUID.randomUUID().toString(),
                    action = IntentAction.SETTINGS_CHANGE,
                    confidence = 0.90f,
                    suggestedToolId = "settings.change"
                )
            )
        )
        val harness = KernelTestHarness(adapter, trustKernel, toolRegistry)
        val result = harness.run("Change security settings")

        assertTrue("Should pass", result.passed)
        assertTrue("Decision should be RequiresBiometric", result.trace.trustDecision is TrustDecision.RequiresBiometric)
        assertTrue("Mock tool should have been invoked after auto-biometric in harness", result.mockToolsInvoked.contains("settings.change"))
    }
}
