package com.chatr.app.kernel.entity

import android.util.Log
import com.chatr.app.kernel.db.EntityRoomEntity
import com.chatr.app.kernel.db.IdentifierRoomEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

/**
 * EntityEngine — Canonical identity resolution and Entity Graph manager.
 *
 * HARDENING INVARIANT (Rule 2):
 * Entity trust score is strictly an observational context signal passed into the Trust Kernel.
 * High entity trust NEVER grants autonomous execution authorization or bypasses user confirmation.
 * The Trust Kernel remains the sole arbiter of authorization.
 */
class EntityEngine(private val entityDao: EntityDao) {

    companion object {
        private const val TAG = "EntityEngine"
    }

    /**
     * Resolves an identifier (phone, email, WhatsApp, contact ID) to a canonical [Entity].
     */
    suspend fun resolveByIdentifier(type: IdentifierType, value: String): Entity? = withContext(Dispatchers.IO) {
        val normalized = normalizeIdentifier(type, value)
        val entityId = entityDao.findEntityIdByIdentifier(type.name, normalized)
            ?: entityDao.findEntityIdByValue(normalized)
            ?: return@withContext null

        getEntity(entityId)
    }

    /**
     * Resolves an E.164 phone number directly to a canonical [Entity].
     */
    suspend fun resolveByPhone(phoneNumber: String): Entity? = withContext(Dispatchers.IO) {
        val cleanPhone = phoneNumber.replace(Regex("[^0-9+]"), "")
        resolveByIdentifier(IdentifierType.PHONE_E164, cleanPhone)
    }

    /**
     * Searches entities by name query (case-insensitive substring match).
     */
    suspend fun resolveByName(nameQuery: String): List<Entity> = withContext(Dispatchers.IO) {
        val roomEntities = entityDao.searchByName(nameQuery.trim())
        roomEntities.mapNotNull { getEntity(it.entityId) }
    }

    /**
     * Retrieves an [Entity] by its stable [entityId], including all linked identifiers.
     */
    suspend fun getEntity(entityId: String): Entity? = withContext(Dispatchers.IO) {
        val roomEntity = entityDao.getEntityById(entityId) ?: return@withContext null
        val roomIdentifiers = entityDao.getIdentifiersForEntity(entityId)

        val identifiers = roomIdentifiers.map {
            Identifier(
                type = runCatching { IdentifierType.valueOf(it.type) }.getOrDefault(IdentifierType.DISPLAY_NAME),
                value = it.value,
                isPrimary = it.isPrimary,
                verifiedAtMs = it.verifiedAtMs
            )
        }

        val commitments = if (roomEntity.openCommitmentIds.isNotBlank()) {
            roomEntity.openCommitmentIds.split(",").filter { it.isNotBlank() }
        } else {
            emptyList()
        }

        Entity(
            entityId = roomEntity.entityId,
            type = runCatching { EntityType.valueOf(roomEntity.type) }.getOrDefault(EntityType.PERSON),
            canonicalName = roomEntity.canonicalName,
            identifiers = identifiers,
            relationshipType = roomEntity.relationshipType,
            trustScore = roomEntity.trustScore,
            openCommitmentIds = commitments,
            lastUpdatedMs = roomEntity.lastUpdatedMs
        )
    }

    /**
     * Creates or updates a full [Entity] node in the local Room database.
     */
    suspend fun saveEntity(entity: Entity): Entity = withContext(Dispatchers.IO) {
        val commitmentString = entity.openCommitmentIds.joinToString(",")
        val roomEntity = EntityRoomEntity(
            entityId = entity.entityId,
            type = entity.type.name,
            canonicalName = entity.canonicalName,
            relationshipType = entity.relationshipType,
            trustScore = entity.trustScore,
            openCommitmentIds = commitmentString,
            lastUpdatedMs = System.currentTimeMillis()
        )

        val roomIdentifiers = entity.identifiers.map { id ->
            IdentifierRoomEntity(
                entityId = entity.entityId,
                type = id.type.name,
                value = normalizeIdentifier(id.type, id.value),
                isPrimary = id.isPrimary,
                verifiedAtMs = id.verifiedAtMs
            )
        }

        entityDao.upsertFullEntity(roomEntity, roomIdentifiers)
        Log.i(TAG, "Saved entity: ${entity.toLogSafe()} with ${roomIdentifiers.size} identifiers")
        entity
    }

    /**
     * Links a new or secondary identifier (e.g. email, WhatsApp JID) to an existing entity.
     */
    suspend fun linkIdentifier(entityId: String, identifier: Identifier): Entity? = withContext(Dispatchers.IO) {
        val entity = getEntity(entityId) ?: return@withContext null
        val normalized = normalizeIdentifier(identifier.type, identifier.value)

        val updatedIdentifiers = entity.identifiers.filterNot {
            it.type == identifier.type && it.value == normalized
        } + identifier.copy(value = normalized)

        val updatedEntity = entity.copy(identifiers = updatedIdentifiers)
        saveEntity(updatedEntity)
    }

    /**
     * Records an interaction outcome and dynamically updates the observational trust score.
     *
     * Invariant: This is an input context metric for the Trust Kernel, NOT an execution bypass.
     */
    suspend fun recordInteraction(
        entityId: String,
        successful: Boolean,
        spamSignal: Boolean = false
    ): Entity? = withContext(Dispatchers.IO) {
        val entity = getEntity(entityId) ?: return@withContext null
        val currentTrust = entity.trustScore

        val newTrust = when {
            spamSignal -> (currentTrust - 0.35f).coerceAtLeast(0.0f)
            successful -> (currentTrust + (1.0f - currentTrust) * 0.05f).coerceAtMost(1.0f)
            else -> (currentTrust - 0.05f).coerceAtLeast(0.1f)
        }

        val updated = entity.copy(trustScore = newTrust)
        saveEntity(updated)
    }

    /**
     * Updates open commitment IDs associated with this entity.
     */
    suspend fun updateCommitments(entityId: String, commitmentIds: List<String>): Entity? = withContext(Dispatchers.IO) {
        val entity = getEntity(entityId) ?: return@withContext null
        val updated = entity.copy(openCommitmentIds = commitmentIds)
        saveEntity(updated)
    }

    private fun normalizeIdentifier(type: IdentifierType, value: String): String = when (type) {
        IdentifierType.PHONE_E164 -> value.replace(Regex("[^0-9+]"), "").trim()
        IdentifierType.EMAIL -> value.trim().lowercase()
        else -> value.trim()
    }
}
