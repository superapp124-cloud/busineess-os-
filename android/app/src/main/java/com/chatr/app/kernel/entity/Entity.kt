package com.chatr.app.kernel.entity

import java.util.UUID

enum class EntityType {
    PERSON, COMPANY, PHONE_NUMBER, EMAIL_ADDRESS, CHATR_ACCOUNT,
    DOCUMENT, MEETING, PLACE, TASK, CONVERSATION, DEVICE
}

enum class IdentifierType {
    PHONE_E164, EMAIL, CHATR_USER_ID, ANDROID_CONTACT_ID, WHATSAPP_JID, DISPLAY_NAME
}

/** A single identifier that maps to an [Entity]. */
data class Identifier(
    val type: IdentifierType,
    val value: String,
    val isPrimary: Boolean = false,
    val verifiedAtMs: Long? = null
)

/**
 * A canonical identity node in the CHATR Entity Graph.
 *
 * The Entity Engine resolves any incoming identifier (phone number, name, email)
 * to a stable Entity node. All kernel primitives query through the Entity Engine
 * rather than operating on raw strings.
 *
 * Privacy: Entity nodes are stored exclusively on-device in the encrypted local
 * Room database. Entity graph data is never transmitted to cloud services unless
 * the user has explicitly authorized cloud memory sync.
 *
 * Example resolution:
 *   "+91 97171 00000" -> Entity(
 *       entityId = "person_7f2e...",
 *       type = PERSON,
 *       canonicalName = "Ahmed Khan",
 *       trustScore = 0.86f,
 *       openCommitmentIds = ["commit_abc123"]
 *   )
 */
data class Entity(
    /** Stable, locally generated UUID. Must not change if phone/name changes. */
    val entityId: String = UUID.randomUUID().toString(),
    val type: EntityType,
    val canonicalName: String,
    val identifiers: List<Identifier>,
    val relationshipType: String? = null,
    /**
     * Composite trust score: 0.0 = confirmed spam, 1.0 = fully trusted.
     * Derived from CallerScorer layers, interaction frequency, spam reports.
     */
    val trustScore: Float = 0.5f,
    /** IDs of open Commitment records in the Memory Engine involving this entity. */
    val openCommitmentIds: List<String> = emptyList(),
    val lastUpdatedMs: Long = System.currentTimeMillis()
) {
    fun primaryPhone(): String? =
        identifiers.firstOrNull { it.type == IdentifierType.PHONE_E164 && it.isPrimary }?.value
            ?: identifiers.firstOrNull { it.type == IdentifierType.PHONE_E164 }?.value

    fun chatrUserId(): String? =
        identifiers.firstOrNull { it.type == IdentifierType.CHATR_USER_ID }?.value

    val isTrustedContact: Boolean get() = trustScore >= 0.70f
    val isHighRisk: Boolean get() = trustScore <= 0.30f

    /** Privacy-safe string for logs. Never log raw phone numbers. */
    fun toLogSafe(): String =
        "Entity(id=${entityId.take(8)}, type=$type, name=${canonicalName.take(10)}..., trust=$trustScore)"
}
