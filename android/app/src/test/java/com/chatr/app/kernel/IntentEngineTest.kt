package com.chatr.app.kernel

import com.chatr.app.kernel.context.ContextEngine
import com.chatr.app.kernel.db.EntityRoomEntity
import com.chatr.app.kernel.db.IdentifierRoomEntity
import com.chatr.app.kernel.entity.Entity
import com.chatr.app.kernel.entity.EntityDao
import com.chatr.app.kernel.entity.EntityEngine
import com.chatr.app.kernel.entity.EntityType
import com.chatr.app.kernel.entity.Identifier
import com.chatr.app.kernel.entity.IdentifierType
import com.chatr.app.kernel.harness.MockIntelligenceAdapter
import com.chatr.app.kernel.intent.ExecutionPlan
import com.chatr.app.kernel.intent.IntentAction
import com.chatr.app.kernel.intent.IntentEngineImpl
import com.chatr.app.kernel.intent.IntentResult
import com.chatr.app.kernel.intent.KernelIntent
import com.chatr.app.kernel.intent.PlanStep
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.UUID

class IntentEngineTest {

    private class TestEntityDao : EntityDao {
        val entities = mutableMapOf<String, EntityRoomEntity>()
        val identifiers = mutableListOf<IdentifierRoomEntity>()

        override fun upsertEntity(entity: EntityRoomEntity) { entities[entity.entityId] = entity }
        override fun getEntityById(entityId: String): EntityRoomEntity? = entities[entityId]
        override fun searchByName(nameQuery: String): List<EntityRoomEntity> =
            entities.values.filter { it.canonicalName.contains(nameQuery, ignoreCase = true) }
        override fun getAllEntities(): List<EntityRoomEntity> = entities.values.toList()
        override fun insertIdentifiers(identifiers: List<IdentifierRoomEntity>) { this.identifiers.addAll(identifiers) }
        override fun getIdentifiersForEntity(entityId: String): List<IdentifierRoomEntity> =
            identifiers.filter { it.entityId == entityId }
        override fun findEntityIdByIdentifier(type: String, value: String): String? =
            identifiers.firstOrNull { it.type == type && it.value == value }?.entityId
        override fun findEntityIdByValue(value: String): String? =
            identifiers.firstOrNull { it.value == value }?.entityId
        override fun deleteIdentifiersForEntity(entityId: String) { identifiers.removeAll { it.entityId == entityId } }
        override fun deleteEntity(entityId: String) { entities.remove(entityId) }
    }

    private lateinit var entityDao: TestEntityDao
    private lateinit var entityEngine: EntityEngine
    private lateinit var contextEngine: ContextEngine

    @Before
    fun setUp() {
        entityDao = TestEntityDao()
        entityEngine = EntityEngine(entityDao)
        contextEngine = ContextEngine()
    }

    @Test
    fun testNaturalLanguageUtteranceResolvesEntityAndIntent() = runBlocking {
        // Seed entity
        val ahmed = Entity(
            entityId = "entity_ahmed_789",
            type = EntityType.PERSON,
            canonicalName = "Ahmed Khan",
            identifiers = listOf(
                Identifier(IdentifierType.PHONE_E164, "+919717100000", isPrimary = true)
            ),
            trustScore = 0.88f
        )
        entityEngine.saveEntity(ahmed)

        // Scripted model adapter returns a candidate intent needing entity resolution
        val modelIntent = KernelIntent(
            traceId = UUID.randomUUID().toString(),
            action = IntentAction.CALL_PLACE_OUTGOING,
            parameters = mapOf("recipient" to "Ahmed"),
            confidence = 0.92f,
            requiresEntityResolution = true
        )
        val adapter = MockIntelligenceAdapter.withResponses(
            "Call Ahmed" to IntentResult.Resolved(modelIntent)
        )
        val intentEngine = IntentEngineImpl(adapter, entityEngine)
        val context = contextEngine.captureContext()

        val result = intentEngine.parseIntent("Call Ahmed", context)
        assertTrue("Result should be Resolved", result is IntentResult.Resolved)
        val resolved = (result as IntentResult.Resolved).intent

        assertEquals(IntentAction.CALL_PLACE_OUTGOING, resolved.action)
        assertEquals(1, resolved.resolvedEntities.size)
        assertEquals("Ahmed Khan", resolved.resolvedEntities.first().canonicalName)
        assertEquals("phone.place_call", resolved.suggestedToolId)
    }

    @Test
    fun testSchemaValidatorBlocksInventedOrIllegalActions() = runBlocking {
        // Model proposes an illegal confidence outside [0.0, 1.0]
        val illegalConfidenceIntent = KernelIntent(
            traceId = UUID.randomUUID().toString(),
            action = IntentAction.SETTINGS_CHANGE,
            parameters = mapOf("settingKey" to "security_level"),
            confidence = 1.95f // ILLEGAL
        )
        val adapter = MockIntelligenceAdapter.withResponses(
            "Change setting" to IntentResult.Resolved(illegalConfidenceIntent)
        )
        val intentEngine = IntentEngineImpl(adapter, entityEngine)
        val context = contextEngine.captureContext()

        val result = intentEngine.parseIntent("Change setting", context)
        assertTrue("Must fail schema validation", result is IntentResult.Failed)
        val failed = result as IntentResult.Failed
        assertTrue(failed.reason.contains("outside valid bounds"))
    }

    @Test
    fun testAmbiguousEntityResolutionTriggersClarification() = runBlocking {
        // Seed two contacts named Ahmed
        val ahmed1 = Entity(
            entityId = "ahmed_khan",
            type = EntityType.PERSON,
            canonicalName = "Ahmed Khan",
            identifiers = listOf(Identifier(IdentifierType.PHONE_E164, "+919717100000"))
        )
        val ahmed2 = Entity(
            entityId = "ahmed_bilal",
            type = EntityType.PERSON,
            canonicalName = "Ahmed Bilal",
            identifiers = listOf(Identifier(IdentifierType.PHONE_E164, "+919717199999"))
        )
        entityEngine.saveEntity(ahmed1)
        entityEngine.saveEntity(ahmed2)

        val modelIntent = KernelIntent(
            traceId = UUID.randomUUID().toString(),
            action = IntentAction.CALL_PLACE_OUTGOING,
            parameters = mapOf("recipient" to "Ahmed"),
            confidence = 0.90f,
            requiresEntityResolution = true
        )
        val adapter = MockIntelligenceAdapter.withResponses(
            "Call Ahmed" to IntentResult.Resolved(modelIntent)
        )
        val intentEngine = IntentEngineImpl(adapter, entityEngine)
        val context = contextEngine.captureContext()

        val result = intentEngine.parseIntent("Call Ahmed", context)
        assertTrue("Ambiguous entities must ask for user clarification", result is IntentResult.NeedsUserClarification)
        val clarify = result as IntentResult.NeedsUserClarification
        assertTrue(clarify.question.contains("Ahmed Khan"))
        assertTrue(clarify.question.contains("Ahmed Bilal"))
    }

    @Test
    fun testReasonAndPlanValidatesPlanSteps() = runBlocking {
        val validStep = PlanStep(
            intent = KernelIntent(
                action = IntentAction.NOTIFICATIONS_SUMMARIZE,
                confidence = 0.95f
            ),
            description = "Summarize notifications"
        )
        val invalidStep = PlanStep(
            intent = KernelIntent(
                action = IntentAction.SETTINGS_CHANGE,
                parameters = emptyMap(), // Missing mandatory 'settingKey'
                confidence = 0.90f
            ),
            description = "Illegal settings change"
        )

        val scriptedPlan = ExecutionPlan(
            goal = "Morning routine",
            steps = listOf(validStep, invalidStep),
            requiresUserReview = false
        )

        val adapter = object : com.chatr.app.kernel.ChatrIntelligenceApi by MockIntelligenceAdapter() {
            override suspend fun reasonAndPlan(
                request: String,
                tools: List<com.chatr.app.kernel.tools.ToolDefinition>,
                context: com.chatr.app.kernel.context.DeviceContext
            ): ExecutionPlan = scriptedPlan
        }

        val intentEngine = IntentEngineImpl(adapter, entityEngine)
        val context = contextEngine.captureContext()

        val plan = intentEngine.reasonAndPlan("Morning routine", emptyList(), context)
        // Invalid step must be dropped by SchemaValidator
        assertEquals(1, plan.steps.size)
        assertEquals(IntentAction.NOTIFICATIONS_SUMMARIZE, plan.steps.first().intent.action)
    }
}
