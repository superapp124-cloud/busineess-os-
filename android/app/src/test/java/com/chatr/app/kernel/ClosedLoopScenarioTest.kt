package com.chatr.app.kernel

import com.chatr.app.kernel.db.CommitmentRoomEntity
import com.chatr.app.kernel.db.EntityRoomEntity
import com.chatr.app.kernel.db.IdentifierRoomEntity
import com.chatr.app.kernel.db.MemoryRoomEntity
import com.chatr.app.kernel.entity.EntityDao
import com.chatr.app.kernel.entity.EntityEngine
import com.chatr.app.kernel.entity.EntityType
import com.chatr.app.kernel.harness.MockIntelligenceAdapter
import com.chatr.app.kernel.memory.MemoryDao
import com.chatr.app.kernel.memory.PersonalMemoryEngine
import com.chatr.app.kernel.scenario.ClosedLoopPipeline
import com.chatr.app.kernel.scenario.PipelineStage
import com.chatr.app.kernel.trace.TraceOutcome
import com.chatr.app.kernel.trust.TrustPermissionKernelImpl
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.UUID

class ClosedLoopScenarioTest {

    private class TestMemoryDao : MemoryDao {
        val memories = mutableMapOf<String, MemoryRoomEntity>()
        val commitments = mutableMapOf<String, CommitmentRoomEntity>()

        override fun upsertMemory(memory: MemoryRoomEntity) { memories[memory.recordId] = memory }
        override fun getMemoryById(recordId: String): MemoryRoomEntity? = memories[recordId]
        override fun getMemoriesForEntity(entityId: String): List<MemoryRoomEntity> =
            memories.values.filter { it.relatedEntityIds.contains(entityId) }
        override fun getMemoriesByType(type: String): List<MemoryRoomEntity> =
            memories.values.filter { it.type == type }
        override fun getTopMemories(limit: Int): List<MemoryRoomEntity> =
            memories.values.sortedByDescending { it.importance }.take(limit)
        override fun getMemoriesByVerificationLevel(level: String): List<MemoryRoomEntity> =
            memories.values.filter { it.verificationLevel == level }
        override fun deleteMemory(recordId: String) { memories.remove(recordId) }
        override fun upsertCommitment(commitment: CommitmentRoomEntity) {
            commitments[commitment.commitmentId] = commitment
        }
        override fun getCommitmentById(commitmentId: String): CommitmentRoomEntity? =
            commitments[commitmentId]
        override fun getActiveCommitments(entityId: String?): List<CommitmentRoomEntity> =
            commitments.values.filter { !it.isCompleted && (entityId == null || it.toEntityId == entityId) }
        override fun getAllCommitments(): List<CommitmentRoomEntity> = commitments.values.toList()
        override fun markCommitmentCompleted(commitmentId: String) {
            commitments[commitmentId]?.let { commitments[commitmentId] = it.copy(isCompleted = true) }
        }
        override fun deleteCommitment(commitmentId: String) { commitments.remove(commitmentId) }
    }

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

    private lateinit var memoryDao: TestMemoryDao
    private lateinit var entityDao: TestEntityDao
    private lateinit var entityEngine: EntityEngine
    private lateinit var memoryEngine: PersonalMemoryEngine
    private lateinit var trustKernel: TrustPermissionKernelImpl
    private lateinit var adapter: MockIntelligenceAdapter

    @Before
    fun setUp() {
        memoryDao = TestMemoryDao()
        entityDao = TestEntityDao()
        entityEngine = EntityEngine(entityDao)
        memoryEngine = PersonalMemoryEngine(memoryDao, entityEngine)
        trustKernel = TrustPermissionKernelImpl()
        adapter = MockIntelligenceAdapter()
    }

    @Test
    fun testDhlCourierCallToMemoryAndCommitmentClosedLoop() = runBlocking {
        val pipeline = ClosedLoopPipeline(
            entityEngine = entityEngine,
            memoryEngine = memoryEngine,
            trustKernel = trustKernel,
            toolRegistry = null, // Mock mode: no real telecom hardware in unit test
            intelligenceApi = adapter
        )

        val callerPhone = "+919876543210"
        val dialogueTurns = listOf(
            DialogueTurn(DialogueSpeaker.CHATR, "Hi, this is Chatr AI answering. Who is calling?"),
            DialogueTurn(DialogueSpeaker.CALLER, "I am from DHL Express. Your package has arrived."),
            DialogueTurn(DialogueSpeaker.CHATR, "Please leave it with the security desk at flat 402."),
            DialogueTurn(DialogueSpeaker.CALLER, "Package left with security guard.")
        )

        val fixedTraceId = "trace_dhl_closed_loop_${UUID.randomUUID().toString().take(8)}"

        // Execute the full closed loop pipeline
        val result = pipeline.executeCallToMemoryLoop(
            traceId = fixedTraceId,
            callerPhoneNumber = callerPhone,
            callerOrgName = "DHL Express",
            dialogueTurns = dialogueTurns
        )

        // 1. Transaction Boundary Verification (Rule 4)
        assertEquals("Trace ID must match across result", fixedTraceId, result.traceId)
        assertEquals("Must execute exactly 10 pipeline stages", 10, result.stages.size)
        assertTrue("Every stage must carry the identical traceId", result.stages.all { it.traceId == fixedTraceId })
        assertTrue("Every stage must report success", result.stages.all { it.success })

        // Check specific stage sequence
        assertEquals(PipelineStage.CALL_RECEIVED, result.stages[0].stage)
        assertEquals(PipelineStage.CALL_SCREENED, result.stages[1].stage)
        assertEquals(PipelineStage.ENTITY_RESOLVED, result.stages[2].stage)
        assertEquals(PipelineStage.TRANSCRIPT_CAPTURED, result.stages[3].stage)
        assertEquals(PipelineStage.SUMMARY_CREATED, result.stages[4].stage)
        assertEquals(PipelineStage.COMMITMENT_PROPOSED, result.stages[5].stage)
        assertEquals(PipelineStage.TRUST_EVALUATED, result.stages[6].stage)
        assertEquals(PipelineStage.REMINDER_CREATED, result.stages[7].stage)
        assertEquals(PipelineStage.EXECUTION_VERIFIED, result.stages[8].stage)
        assertEquals(PipelineStage.MEMORY_COMMITTED, result.stages[9].stage)

        // 2. Entity Resolution Verification
        assertNotNull(result.callerEntity)
        assertEquals("DHL Express", result.callerEntity?.canonicalName)
        assertEquals(EntityType.COMPANY, result.callerEntity?.type)

        // Entity is persistently retrievable from EntityEngine
        val entityFromDb = entityEngine.resolveByPhone(callerPhone)
        assertNotNull(entityFromDb)
        assertEquals("DHL Express", entityFromDb?.canonicalName)

        // 3. Memory & Commitment Verification (Rule 1: Provenance & Strict Write)
        assertNotNull(result.commitment)
        assertTrue(result.commitment?.description?.contains("Collect package") == true)

        // The next morning: querying active commitments retrieves this pending obligation
        val morningActiveCommitments = memoryEngine.getActiveCommitments(result.callerEntity?.entityId)
        assertEquals(1, morningActiveCommitments.size)
        assertEquals("Collect package from security guard at flat 402", morningActiveCommitments.first().description)

        // 4. ExecutionTrace Verification
        assertEquals(TraceOutcome.SUCCESS, result.executionTrace.outcome)
        assertTrue(result.executionTrace.verified)
    }
}
