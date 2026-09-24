package com.chatr.app.kernel.memory

import android.util.Log
import com.chatr.app.kernel.db.CommitmentRoomEntity
import com.chatr.app.kernel.db.MemoryRoomEntity
import com.chatr.app.kernel.entity.EntityEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

/**
 * Result of evaluating a [CandidateMemory] against the strict write policy.
 */
sealed class MemoryWriteResult {
    data class Persisted(val record: MemoryRecord) : MemoryWriteResult()
    data class Discarded(val reason: String, val candidate: CandidateMemory) : MemoryWriteResult()
}

/**
 * PersonalMemoryEngine — On-device encrypted personal memory and commitment manager.
 *
 * HARDENING INVARIANT (Rule 1: Strict Memory Write Policy):
 * AI model output NEVER directly writes to durable memory without validation.
 * Every proposed memory must pass through [proposeCandidateMemory] where provenance,
 * verification level, and confidence thresholds are strictly enforced to prevent
 * hallucination pollution.
 */
class PersonalMemoryEngine(
    private val memoryDao: MemoryDao,
    private val entityEngine: EntityEngine? = null
) {

    companion object {
        private const val TAG = "PersonalMemoryEngine"
        private const val MIN_CONFIDENCE_THRESHOLD = 0.65f
        private const val FACT_CONFIDENCE_THRESHOLD = 0.75f
    }

    /**
     * Strict Memory Write Gate (Hardening Rule 1):
     * Evaluates a candidate memory against confidence, provenance, and verification policies.
     */
    suspend fun proposeCandidateMemory(candidate: CandidateMemory): MemoryWriteResult = withContext(Dispatchers.IO) {
        // 1. Minimum confidence floor check
        if (candidate.confidence < MIN_CONFIDENCE_THRESHOLD) {
            val reason = "Confidence ${candidate.confidence} below minimum threshold $MIN_CONFIDENCE_THRESHOLD"
            Log.w(TAG, "Memory discarded: $reason | content='${candidate.content}'")
            return@withContext MemoryWriteResult.Discarded(reason, candidate)
        }

        // 2. Content validation
        if (candidate.content.isBlank() || candidate.content.trim().length < 5) {
            val reason = "Memory content is blank or trivially short"
            Log.w(TAG, "Memory discarded: $reason")
            return@withContext MemoryWriteResult.Discarded(reason, candidate)
        }

        // 3. Verification level policy
        val verifiedLevel = when (candidate.suggestedVerificationLevel) {
            MemoryVerificationLevel.FACT -> {
                if (candidate.confidence < FACT_CONFIDENCE_THRESHOLD) {
                    MemoryVerificationLevel.OBSERVATION
                } else {
                    MemoryVerificationLevel.FACT
                }
            }
            MemoryVerificationLevel.COMMITMENT -> MemoryVerificationLevel.COMMITMENT
            MemoryVerificationLevel.OBSERVATION -> MemoryVerificationLevel.OBSERVATION
        }

        // 4. Construct durable MemoryRecord with full provenance
        val relatedEntities = candidate.entityId?.let { listOf(it) } ?: emptyList()
        val record = MemoryRecord(
            recordId = UUID.randomUUID().toString(),
            type = candidate.type,
            content = candidate.content.trim(),
            embeddingKey = null,
            relatedEntityIds = relatedEntities,
            relatedTraceId = candidate.sourceTraceId,
            importance = candidate.importance,
            createdAtMs = System.currentTimeMillis(),
            expiresAtMs = candidate.expiresAtMs,
            isCloudSynced = false,
            source = candidate.source,
            sourceTraceId = candidate.sourceTraceId,
            confidence = candidate.confidence,
            verificationLevel = verifiedLevel,
            sensitivity = candidate.sensitivity,
            lastVerifiedAtMs = System.currentTimeMillis()
        )

        saveRecordDirect(record)
        Log.i(TAG, "Persisted durable memory [${record.verificationLevel}]: '${record.content.take(40)}...'")
        MemoryWriteResult.Persisted(record)
    }

    /**
     * Directly persists a verified [MemoryRecord] into the Room database.
     */
    suspend fun saveRecordDirect(record: MemoryRecord) = withContext(Dispatchers.IO) {
        val roomEntity = MemoryRoomEntity(
            recordId = record.recordId,
            type = record.type.name,
            content = record.content,
            embeddingKey = record.embeddingKey,
            relatedEntityIds = record.relatedEntityIds.joinToString(","),
            relatedTraceId = record.relatedTraceId,
            importance = record.importance,
            createdAtMs = record.createdAtMs,
            expiresAtMs = record.expiresAtMs,
            isCloudSynced = record.isCloudSynced,
            source = record.source,
            sourceTraceId = record.sourceTraceId,
            confidence = record.confidence,
            verificationLevel = record.verificationLevel.name,
            sensitivity = record.sensitivity.name,
            lastVerifiedAtMs = record.lastVerifiedAtMs
        )
        memoryDao.upsertMemory(roomEntity)
    }

    /**
     * Creates and records an explicit [Commitment] (e.g. "User will collect DHL package").
     */
    suspend fun createCommitment(
        description: String,
        toEntityId: String? = null,
        deadlineMs: Long? = null,
        sourceTraceId: String? = null
    ): Commitment = withContext(Dispatchers.IO) {
        val commitment = Commitment(
            commitmentId = UUID.randomUUID().toString(),
            description = description.trim(),
            toEntityId = toEntityId,
            deadlineMs = deadlineMs,
            isCompleted = false,
            createdAtMs = System.currentTimeMillis()
        )

        val roomCommitment = CommitmentRoomEntity(
            commitmentId = commitment.commitmentId,
            description = commitment.description,
            toEntityId = commitment.toEntityId,
            deadlineMs = commitment.deadlineMs,
            isCompleted = false,
            createdAtMs = commitment.createdAtMs
        )
        memoryDao.upsertCommitment(roomCommitment)

        // Also record as a durable MemoryRecord with COMMITMENT verification level
        val memoryRecord = MemoryRecord(
            recordId = UUID.randomUUID().toString(),
            type = MemoryType.COMMITMENT,
            content = commitment.description,
            relatedEntityIds = toEntityId?.let { listOf(it) } ?: emptyList(),
            relatedTraceId = sourceTraceId,
            importance = 0.9f,
            verificationLevel = MemoryVerificationLevel.COMMITMENT,
            source = "COMMITMENT_EXTRACTOR",
            sourceTraceId = sourceTraceId,
            confidence = 1.0f
        )
        saveRecordDirect(memoryRecord)

        // Update entity open commitments if linked
        if (toEntityId != null && entityEngine != null) {
            val active = getActiveCommitments(toEntityId).map { it.commitmentId }
            entityEngine.updateCommitments(toEntityId, active)
        }

        Log.i(TAG, "Recorded commitment: '${commitment.description}' for entity: $toEntityId")
        commitment
    }

    /**
     * Marks an open commitment as fulfilled/completed.
     */
    suspend fun completeCommitment(commitmentId: String) = withContext(Dispatchers.IO) {
        val existing = memoryDao.getCommitmentById(commitmentId) ?: return@withContext
        memoryDao.markCommitmentCompleted(commitmentId)

        if (existing.toEntityId != null && entityEngine != null) {
            val remaining = getActiveCommitments(existing.toEntityId).map { it.commitmentId }
            entityEngine.updateCommitments(existing.toEntityId, remaining)
        }
        Log.i(TAG, "Completed commitment: $commitmentId")
    }

    /**
     * Retrieves active (uncompleted) commitments, optionally filtered by entity.
     */
    suspend fun getActiveCommitments(entityId: String? = null): List<Commitment> = withContext(Dispatchers.IO) {
        val roomCommitments = memoryDao.getActiveCommitments(entityId)
        roomCommitments.map {
            Commitment(
                commitmentId = it.commitmentId,
                description = it.description,
                toEntityId = it.toEntityId,
                deadlineMs = it.deadlineMs,
                isCompleted = it.isCompleted,
                createdAtMs = it.createdAtMs
            )
        }
    }

    /**
     * Assembles a curated, privacy-safe [MemorySnapshot] for injection into the model context.
     */
    suspend fun buildSnapshot(
        queryContext: String,
        entityId: String? = null,
        limit: Int = 10
    ): MemorySnapshot = withContext(Dispatchers.IO) {
        val roomMemories = if (entityId != null) {
            memoryDao.getMemoriesForEntity(entityId)
        } else {
            memoryDao.getTopMemories(limit)
        }

        val domainRecords = roomMemories.take(limit).map { r ->
            MemoryRecord(
                recordId = r.recordId,
                type = runCatching { MemoryType.valueOf(r.type) }.getOrDefault(MemoryType.FACT),
                content = r.content,
                embeddingKey = r.embeddingKey,
                relatedEntityIds = if (r.relatedEntityIds.isNotBlank()) r.relatedEntityIds.split(",") else emptyList(),
                relatedTraceId = r.relatedTraceId,
                importance = r.importance,
                createdAtMs = r.createdAtMs,
                expiresAtMs = r.expiresAtMs,
                isCloudSynced = r.isCloudSynced,
                source = r.source,
                sourceTraceId = r.sourceTraceId,
                confidence = r.confidence,
                verificationLevel = runCatching { MemoryVerificationLevel.valueOf(r.verificationLevel) }
                    .getOrDefault(MemoryVerificationLevel.OBSERVATION),
                sensitivity = runCatching { MemorySensitivity.valueOf(r.sensitivity) }
                    .getOrDefault(MemorySensitivity.LOW),
                lastVerifiedAtMs = r.lastVerifiedAtMs
            )
        }

        val commitments = getActiveCommitments(entityId)

        // Resolve entity names for prompt safety
        val entityNames = mutableMapOf<String, String>()
        if (entityEngine != null) {
            val allIds = (domainRecords.flatMap { it.relatedEntityIds } + listOfNotNull(entityId)).distinct()
            allIds.forEach { id ->
                entityEngine.getEntity(id)?.let { entityNames[id] = it.canonicalName }
            }
        }

        MemorySnapshot(
            snapshotId = UUID.randomUUID().toString(),
            relevantRecords = domainRecords,
            activeCommitments = commitments,
            resolvedEntityNames = entityNames,
            queryContext = queryContext
        )
    }
}
