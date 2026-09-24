package com.chatr.app.kernel

import com.chatr.app.kernel.db.EntityRoomEntity
import com.chatr.app.kernel.db.IdentifierRoomEntity
import com.chatr.app.kernel.entity.Entity
import com.chatr.app.kernel.entity.EntityDao
import com.chatr.app.kernel.entity.EntityEngine
import com.chatr.app.kernel.entity.EntityType
import com.chatr.app.kernel.entity.Identifier
import com.chatr.app.kernel.entity.IdentifierType
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class EntityEngineTest {

    private class FakeEntityDao : EntityDao {
        val entities = mutableMapOf<String, EntityRoomEntity>()
        val identifiers = mutableListOf<IdentifierRoomEntity>()

        override fun upsertEntity(entity: EntityRoomEntity) {
            entities[entity.entityId] = entity
        }

        override fun getEntityById(entityId: String): EntityRoomEntity? =
            entities[entityId]

        override fun searchByName(nameQuery: String): List<EntityRoomEntity> =
            entities.values.filter { it.canonicalName.contains(nameQuery, ignoreCase = true) }

        override fun getAllEntities(): List<EntityRoomEntity> =
            entities.values.toList()

        override fun insertIdentifiers(identifiers: List<IdentifierRoomEntity>) {
            this.identifiers.addAll(identifiers)
        }

        override fun getIdentifiersForEntity(entityId: String): List<IdentifierRoomEntity> =
            identifiers.filter { it.entityId == entityId }

        override fun findEntityIdByIdentifier(type: String, value: String): String? =
            identifiers.firstOrNull { it.type == type && it.value == value }?.entityId

        override fun findEntityIdByValue(value: String): String? =
            identifiers.firstOrNull { it.value == value }?.entityId

        override fun deleteIdentifiersForEntity(entityId: String) {
            identifiers.removeAll { it.entityId == entityId }
        }

        override fun deleteEntity(entityId: String) {
            entities.remove(entityId)
            deleteIdentifiersForEntity(entityId)
        }
    }

    private lateinit var fakeDao: FakeEntityDao
    private lateinit var engine: EntityEngine

    @Before
    fun setUp() {
        fakeDao = FakeEntityDao()
        engine = EntityEngine(fakeDao)
    }

    @Test
    fun testResolveEntityByE164PhoneNumber() = runBlocking {
        val entity = Entity(
            entityId = "entity_ahmed_1",
            type = EntityType.PERSON,
            canonicalName = "Ahmed Khan",
            identifiers = listOf(
                Identifier(IdentifierType.PHONE_E164, "+919717100000", isPrimary = true)
            ),
            trustScore = 0.85f
        )
        engine.saveEntity(entity)

        // Resolve by exact E.164
        val resolved = engine.resolveByPhone("+919717100000")
        assertNotNull(resolved)
        assertEquals("entity_ahmed_1", resolved?.entityId)
        assertEquals("Ahmed Khan", resolved?.canonicalName)

        // Resolve with formatted string (spaces and dashes)
        val resolvedFormatted = engine.resolveByPhone("+91 97171-00000")
        assertNotNull(resolvedFormatted)
        assertEquals("entity_ahmed_1", resolvedFormatted?.entityId)
    }

    @Test
    fun testResolveEntityByNameSubstring() = runBlocking {
        val entity1 = Entity(
            entityId = "courier_dhl",
            type = EntityType.COMPANY,
            canonicalName = "DHL Express",
            identifiers = listOf(Identifier(IdentifierType.PHONE_E164, "+911140000000"))
        )
        val entity2 = Entity(
            entityId = "doctor_ahmed",
            type = EntityType.PERSON,
            canonicalName = "Dr. Ahmed Bilal",
            identifiers = emptyList()
        )
        engine.saveEntity(entity1)
        engine.saveEntity(entity2)

        val results = engine.resolveByName("ahmed")
        assertEquals(1, results.size)
        assertEquals("Dr. Ahmed Bilal", results.first().canonicalName)

        val dhlResults = engine.resolveByName("dhl")
        assertEquals(1, dhlResults.size)
        assertEquals("DHL Express", dhlResults.first().canonicalName)
    }

    @Test
    fun testLinkSecondaryIdentifier() = runBlocking {
        val entity = Entity(
            entityId = "user_sarah",
            type = EntityType.PERSON,
            canonicalName = "Sarah Connor",
            identifiers = listOf(
                Identifier(IdentifierType.PHONE_E164, "+14155550199", isPrimary = true)
            )
        )
        engine.saveEntity(entity)

        // Add email identifier
        val updated = engine.linkIdentifier(
            "user_sarah",
            Identifier(IdentifierType.EMAIL, "sarah@cyberdyne.io")
        )
        assertNotNull(updated)
        assertEquals(2, updated?.identifiers?.size)

        // Resolve by email
        val resolvedByEmail = engine.resolveByIdentifier(IdentifierType.EMAIL, "sarah@cyberdyne.io")
        assertNotNull(resolvedByEmail)
        assertEquals("user_sarah", resolvedByEmail?.entityId)
    }

    @Test
    fun testObservationalTrustScoreDynamics() = runBlocking {
        val entity = Entity(
            entityId = "contact_test",
            type = EntityType.PERSON,
            canonicalName = "Test Contact",
            identifiers = emptyList(),
            trustScore = 0.50f
        )
        engine.saveEntity(entity)

        // Positive interaction boosts trust score
        val afterPositive = engine.recordInteraction("contact_test", successful = true)
        assertNotNull(afterPositive)
        assertTrue("Trust score should increase", (afterPositive?.trustScore ?: 0f) > 0.50f)

        // Spam signal significantly docks trust score
        val afterSpam = engine.recordInteraction("contact_test", successful = false, spamSignal = true)
        assertNotNull(afterSpam)
        assertTrue("Trust score should drop sharply on spam", (afterSpam?.trustScore ?: 1f) < 0.30f)
    }
}
