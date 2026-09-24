package com.chatr.app.kernel.db

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Room entity for canonical [com.chatr.app.kernel.entity.Entity] nodes.
 */
@Entity(
    tableName = "kernel_entities",
    indices = [
        Index(value = ["canonicalName"]),
        Index(value = ["trustScore"]),
        Index(value = ["lastUpdatedMs"])
    ]
)
data class EntityRoomEntity(
    @PrimaryKey val entityId: String,
    val type: String,
    val canonicalName: String,
    val relationshipType: String? = null,
    val trustScore: Float = 0.5f,
    /** Comma-separated open commitment IDs. */
    val openCommitmentIds: String = "",
    val lastUpdatedMs: Long = System.currentTimeMillis()
)

/**
 * Room entity for identifiers linked to an Entity (E.164 phone, email, contact ID, etc.).
 */
@Entity(
    tableName = "kernel_identifiers",
    foreignKeys = [
        ForeignKey(
            entity = EntityRoomEntity::class,
            parentColumns = ["entityId"],
            childColumns = ["entityId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["entityId"]),
        Index(value = ["type", "value"]),
        Index(value = ["value"])
    ]
)
data class IdentifierRoomEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val entityId: String,
    val type: String,
    val value: String,
    val isPrimary: Boolean = false,
    val verifiedAtMs: Long? = null
)

/**
 * Room entity for durable [com.chatr.app.kernel.memory.MemoryRecord].
 */
@Entity(
    tableName = "kernel_memory",
    indices = [
        Index(value = ["type"]),
        Index(value = ["importance"]),
        Index(value = ["createdAtMs"]),
        Index(value = ["verificationLevel"])
    ]
)
data class MemoryRoomEntity(
    @PrimaryKey val recordId: String,
    val type: String,
    val content: String,
    val embeddingKey: String? = null,
    /** Comma-separated entity IDs. */
    val relatedEntityIds: String = "",
    val relatedTraceId: String? = null,
    val importance: Float = 0.5f,
    val createdAtMs: Long = System.currentTimeMillis(),
    val expiresAtMs: Long? = null,
    val isCloudSynced: Boolean = false,
    // Provenance & Hardening fields
    val source: String = "AI_SCREENING",
    val sourceTraceId: String? = null,
    val confidence: Float = 0.85f,
    val verificationLevel: String = "OBSERVATION",
    val sensitivity: String = "LOW",
    val lastVerifiedAtMs: Long = createdAtMs
)

/**
 * Room entity for [com.chatr.app.kernel.memory.Commitment].
 */
@Entity(
    tableName = "kernel_commitments",
    indices = [
        Index(value = ["toEntityId"]),
        Index(value = ["isCompleted"]),
        Index(value = ["createdAtMs"])
    ]
)
data class CommitmentRoomEntity(
    @PrimaryKey val commitmentId: String,
    val description: String,
    val toEntityId: String? = null,
    val deadlineMs: Long? = null,
    val isCompleted: Boolean = false,
    val createdAtMs: Long = System.currentTimeMillis()
)
