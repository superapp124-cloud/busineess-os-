package com.chatr.app.kernel

import com.chatr.app.kernel.db.CommitmentRoomEntity
import com.chatr.app.kernel.db.EntityRoomEntity
import com.chatr.app.kernel.db.IdentifierRoomEntity
import com.chatr.app.kernel.db.MemoryRoomEntity
import com.chatr.app.kernel.entity.Entity
import com.chatr.app.kernel.entity.EntityDao
import com.chatr.app.kernel.entity.EntityEngine
import com.chatr.app.kernel.entity.EntityType
import com.chatr.app.kernel.memory.CandidateMemory
import com.chatr.app.kernel.memory.MemoryDao
import com.chatr.app.kernel.memory.MemoryType
import com.chatr.app.kernel.memory.MemoryVerificationLevel
import com.chatr.app.kernel.memory.MemoryWriteResult
import com.chatr.app.kernel.memory.PersonalMemoryEngine
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class PersonalMemoryEngineTest {

    private class FakeMemoryDao : MemoryDao {
        val memories = mutableMapOf<String, MemoryRoomEntity>()
        val commitments = mutableMapOf<String, CommitmentRoomEntity>()

        override fun upsertMemory(memory: MemoryRoomEntity) {
            memories[memory.recordId] = memory
        }

        override fun getMemoryById(recordId: String): MemoryRoomEntity? =
            memories[recordId]

        override fun getMemoriesForEntity(entityId: String): List<MemoryRoomEntity> =
            memories.values.filter { it.relatedEntityIds.contains(entityId) }

        override fun getMemoriesByType(type: String): List<MemoryRoomEntity> =
            memories.values.filter { it.type == type }

        override fun getTopMemories(limit: Int): List<MemoryRoomEntity> =
            memories.values.sortedByDescending { it.importance }.take(limit)

        override fun getMemoriesByVerificationLevel(level: String): List<MemoryRoomEntity> =
            memories.values.filter { it.verificationLevel == level }

        override fun deleteMemory(recordId: String) {
            memories.remove(recordId)
        }

        override fun upsertCommitment(commitment: CommitmentRoomEntity) {
            commitments[commitment.commitmentId] = commitment
        }

        override fun getCommitmentById(commitmentId: String): CommitmentRoomEntity? =
            commitments[commitmentId]

        override fun getActiveCommitments(entityId: String?): List<CommitmentRoomEntity> =
            commitments.values.filter {
                !it.isCompleted && (entityId == null || it.toEntityId == entityId)
            }

        override fun getAllCommitments(): List<CommitmentRoomEntity> =
            commitments.values.toList()

        override fun markCommitmentCompleted(commitmentId: String) {
            commitments[commitmentId]?.let {
                commitments[commitmentId] = it.copy(isCompleted = true)
            }
        }

        override fun deleteCommitment(commitmentId: String) {
            commitments.remove(commitmentId)
        }
    }

    private class FakeEntityDao : EntityDao {
        val entities = mutableMapOf<String, EntityRoomEntity>()
        val identifiers = mutableListOf<IdentifierRoomEntity>()

        override fun upsertEntity(entity: EntityRoomEntity) { entities[entity.entityId] = entity }
        override fun getEntityById(entityId: String): EntityRoomEntity? = entities[entityId]
        override fun searchByName(nameQuery: String): List<EntityRoomEntity> = emptyList()
        override fun getAllEntities(): List<EntityRoomEntity> = entities.values.toList()
        override fun insertIdentifiers(identifiers: List<IdentifierRoomEntity>) { this.identifiers.addAll(identifiers) }
        override fun getIdentifiersForEntity(entityId: String): List<IdentifierRoomEntity> = emptyList()
        override fun findEntityIdByIdentifier(type: String, value: String): String? = null
        override fun findEntityIdByValue(value: String): String? = null
        override fun deleteIdentifiersForEntity(entityId: String) {}
        override fun deleteEntity(entityId: String) { entities.remove(entityId) }
    }

    private lateinit var memoryDao: FakeMemoryDao
    private lateinit var entityDao: FakeEntityDao
    private lateinit var entityEngine: EntityEngine
    private lateinit var memoryEngine: PersonalMemoryEngine

    @Before
    fun setUp() {
        memoryDao = FakeMemoryDao()
        entityDao = FakeEntityDao()
        entityEngine = EntityEngine(entityDao)
        memoryEngine = PersonalMemoryEngine(memoryDao, entityEngine)
    }

    @Test
    fun testStrictMemoryWritePolicyDiscardsLowConfidence() = runBlocking {
        // AI proposed an uncertain statement (confidence 0.40 < 0.65 threshold)
        val lowConfidence = CandidateMemory(
            type = MemoryType.FACT,
            content = "User might be traveling to Delhi next month",
            confidence = 0.40f,
            suggestedVerificationLevel = MemoryVerificationLevel.FACT
        )
        val result = memoryEngine.proposeCandidateMemory(lowConfidence)
        assertTrue("Candidate must be discarded", result is MemoryWriteResult.Discarded)
        val discarded = result as MemoryWriteResult.Discarded
        assertTrue(discarded.reason.contains("below minimum threshold"))
        assertEquals(0, memoryDao.memories.size)
    }

    @Test
    fun testStrictMemoryWritePolicyDiscardsTrivialContent() = runBlocking {
        val blankCandidate = CandidateMemory(
            type = MemoryType.FACT,
            content = "   ",
            confidence = 0.90f,
            suggestedVerificationLevel = MemoryVerificationLevel.OBSERVATION
        )
        val result = memoryEngine.proposeCandidateMemory(blankCandidate)
        assertTrue(result is MemoryWriteResult.Discarded)
        assertEquals(0, memoryDao.memories.size)
    }

    @Test
    fun testHighConfidenceFactPersistsWithProvenance() = runBlocking {
        val candidate = CandidateMemory(
            type = MemoryType.FACT,
            content = "DHL delivery package is with building security guard",
            entityId = "courier_dhl",
            source = "AI_SCREENING",
            sourceTraceId = "trace_dhl_123",
            confidence = 0.88f,
            suggestedVerificationLevel = MemoryVerificationLevel.FACT
        )
        val result = memoryEngine.proposeCandidateMemory(candidate)
        assertTrue(result is MemoryWriteResult.Persisted)
        val persisted = (result as MemoryWriteResult.Persisted).record

        assertEquals(MemoryVerificationLevel.FACT, persisted.verificationLevel)
        assertEquals("AI_SCREENING", persisted.source)
        assertEquals("trace_dhl_123", persisted.sourceTraceId)
        assertEquals("courier_dhl", persisted.relatedEntityIds.first())
        assertEquals(1, memoryDao.memories.size)
    }

    @Test
    fun testModerateConfidenceFactDowngradesToObservation() = runBlocking {
        val candidate = CandidateMemory(
            type = MemoryType.FACT,
            content = "Caller stated they might call back around 5 PM",
            confidence = 0.68f, // above 0.65 min, below 0.75 fact threshold
            suggestedVerificationLevel = MemoryVerificationLevel.FACT
        )
        val result = memoryEngine.proposeCandidateMemory(candidate)
        assertTrue(result is MemoryWriteResult.Persisted)
        val persisted = (result as MemoryWriteResult.Persisted).record
        assertEquals("Should downgrade to OBSERVATION", MemoryVerificationLevel.OBSERVATION, persisted.verificationLevel)
    }

    @Test
    fun testCommitmentLifecycleAndSnapshotAssembly() = runBlocking {
        // Seed entity
        val entity = Entity(
            entityId = "courier_dhl",
            type = EntityType.COMPANY,
            canonicalName = "DHL Express",
            identifiers = emptyList()
        )
        entityEngine.saveEntity(entity)

        // 1. Create commitment
        val commitment = memoryEngine.createCommitment(
            description = "Collect package from security desk at flat 402",
            toEntityId = "courier_dhl",
            sourceTraceId = "trace_screening_456"
        )
        assertNotNull(commitment.commitmentId)
        val activeBefore = memoryEngine.getActiveCommitments("courier_dhl")
        assertEquals(1, activeBefore.size)
        assertEquals("Collect package from security desk at flat 402", activeBefore.first().description)

        // 2. Build snapshot
        val snapshot = memoryEngine.buildSnapshot("DHL delivery query", entityId = "courier_dhl")
        assertEquals(1, snapshot.activeCommitments.size)
        assertEquals("DHL Express", snapshot.resolvedEntityNames["courier_dhl"])

        // 3. Complete commitment
        memoryEngine.completeCommitment(commitment.commitmentId)
        val activeAfter = memoryEngine.getActiveCommitments("courier_dhl")
        assertEquals(0, activeAfter.size)
    }
}
