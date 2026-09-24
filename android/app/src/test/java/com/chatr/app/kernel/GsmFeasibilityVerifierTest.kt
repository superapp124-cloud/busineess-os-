package com.chatr.app.kernel

import android.content.ComponentName
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import com.chatr.app.kernel.harness.GateResult
import com.chatr.app.kernel.harness.GateStatus
import com.chatr.app.kernel.harness.GsmFeasibilityVerifier
import com.chatr.app.kernel.harness.MockIntelligenceAdapter
import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.intent.KernelIntent
import com.chatr.app.kernel.tools.RiskTier
import com.chatr.app.kernel.tools.ToolRegistry
import com.chatr.app.kernel.trust.TrustDecision
import com.chatr.app.kernel.trust.TrustPermissionKernelImpl
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.UUID

class GsmFeasibilityVerifierTest {

    private class TestContext : ContextWrapper(null) {
        override fun getSystemService(name: String): Any? = null
        override fun startService(service: Intent?): ComponentName? = null
        override fun getPackageName(): String = "com.chatr.app"
    }

    private lateinit var testContext: Context
    private lateinit var trustKernel: TrustPermissionKernelImpl
    private lateinit var toolRegistry: ToolRegistry

    @Before
    fun setUp() {
        testContext = TestContext()
        trustKernel = TrustPermissionKernelImpl()
        toolRegistry = ToolRegistry(testContext)
    }

    @Test
    fun test1B5TwoWayConversationalDialogueExchange() = runBlocking {
        val dialogueScript = listOf(
            DialogueAction.Speak("Hi, this is Chatr AI answering. Who is calling?"),
            DialogueAction.Speak("Understood, leave it with the security desk at flat 402."),
            DialogueAction.EndScreening
        )
        val adapter = MockIntelligenceAdapter(dialogueResponses = dialogueScript)
        val verifier = GsmFeasibilityVerifier(testContext, adapter, trustKernel, toolRegistry)

        val result = verifier.verify1B5TwoWayConversation()

        assertEquals("1B-5", result.gateId)
        assertEquals("Two-Way 3+ Turns", result.name)
        assertEquals(GateStatus.PASS, result.status)
        assertTrue("Details should mention 3 turns", result.details.contains("3 conversational dialogue turns"))
    }

    @Test
    fun test1B6HumanTakeoverEnforcesTrustKernelBoundary() = runBlocking {
        val adapter = MockIntelligenceAdapter()
        val verifier = GsmFeasibilityVerifier(testContext, adapter, trustKernel, toolRegistry)

        // 1. Direct intent evaluation: User requesting handover from AI
        val handoverIntent = KernelIntent(
            traceId = UUID.randomUUID().toString(),
            action = IntentAction.CALL_TAKEOVER_FROM_AI,
            confidence = 1.0f,
            suggestedToolId = "phone.takeover"
        )
        val decision = trustKernel.evaluate(handoverIntent, contextConfidence = 1.0f)
        assertTrue("Human takeover MUST be Authorized by Trust Kernel", decision is TrustDecision.Authorized)

        // 2. Run the gate verifier
        val result = verifier.verify1B6HumanTakeover()
        assertEquals("1B-6", result.gateId)
        // In unit test without active GSM hardware, status should be PASS or PARTIAL (not FAIL)
        assertTrue(
            "Gate 1B-6 should pass or partial in synthetic test",
            result.status == GateStatus.PASS || result.status == GateStatus.PARTIAL
        )
    }

    @Test
    fun test1B7PostCallCommitTraceAndMemoryCreation() {
        val adapter = MockIntelligenceAdapter()
        val verifier = GsmFeasibilityVerifier(testContext, adapter, trustKernel, toolRegistry)

        val result = verifier.verify1B7PostCallCommit()
        assertEquals("1B-7", result.gateId)
        assertEquals(GateStatus.PASS, result.status)
        assertTrue("Details should confirm ExecutionTrace and MemoryRecord", result.details.contains("ExecutionTrace and MemoryRecord"))
    }

    @Test
    fun testRunAllGatesProducesComprehensiveReport() = runBlocking {
        val dialogueScript = listOf(
            DialogueAction.Speak("Hi, this is Chatr AI answering. Who is calling?"),
            DialogueAction.Speak("Understood, leave it with the security desk at flat 402."),
            DialogueAction.EndScreening
        )
        val adapter = MockIntelligenceAdapter(dialogueResponses = dialogueScript)
        val verifier = GsmFeasibilityVerifier(testContext, adapter, trustKernel, toolRegistry)

        val report = verifier.runAllGates()
        assertEquals("Must report all 7 sub-gates", 7, report.results.size)

        val gateIds = report.results.map { it.gateId }
        assertTrue("Contains 1B-1", gateIds.contains("1B-1"))
        assertTrue("Contains 1B-2", gateIds.contains("1B-2"))
        assertTrue("Contains 1B-3", gateIds.contains("1B-3"))
        assertTrue("Contains 1B-4", gateIds.contains("1B-4"))
        assertTrue("Contains 1B-5", gateIds.contains("1B-5"))
        assertTrue("Contains 1B-6", gateIds.contains("1B-6"))
        assertTrue("Contains 1B-7", gateIds.contains("1B-7"))

        val summary = report.prettyPrint()
        assertTrue("Report summary contains CHATR GSM FEASIBILITY REPORT", summary.contains("CHATR GSM FEASIBILITY REPORT"))
    }

    @Test
    fun testToolRegistryEnforcesAuthorizedExecutionInvariant() = runBlocking {
        val tool = toolRegistry.findForAction(IntentAction.CALL_TAKEOVER_FROM_AI)
        assertNotNull("phone.takeover tool must be registered", tool)
        assertEquals("phone.takeover", tool?.toolId)
        assertEquals(RiskTier.LOW, tool?.riskTier)

        // Attempt execution through valid TrustDecision.Authorized
        val intent = KernelIntent(
            traceId = UUID.randomUUID().toString(),
            action = IntentAction.CALL_TAKEOVER_FROM_AI,
            confidence = 1.0f,
            suggestedToolId = "phone.takeover"
        )
        val authDecision = TrustDecision.Authorized(
            intent = intent,
            riskScore = 0.05f,
            reason = "Test authorized handover"
        )
        val toolResult = toolRegistry.executeAuthorized(authDecision)
        assertNotNull(toolResult)
        assertEquals("phone.takeover", toolResult.toolId)
    }
}
