package com.chatr.app.kernel.entity

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.chatr.app.kernel.db.EntityRoomEntity
import com.chatr.app.kernel.db.IdentifierRoomEntity

@Dao
interface EntityDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun upsertEntity(entity: EntityRoomEntity)

    @Query("SELECT * FROM kernel_entities WHERE entityId = :entityId LIMIT 1")
    fun getEntityById(entityId: String): EntityRoomEntity?

    @Query("SELECT * FROM kernel_entities WHERE canonicalName LIKE '%' || :nameQuery || '%' COLLATE NOCASE")
    fun searchByName(nameQuery: String): List<EntityRoomEntity>

    @Query("SELECT * FROM kernel_entities ORDER BY lastUpdatedMs DESC")
    fun getAllEntities(): List<EntityRoomEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertIdentifiers(identifiers: List<IdentifierRoomEntity>)

    @Query("SELECT * FROM kernel_identifiers WHERE entityId = :entityId")
    fun getIdentifiersForEntity(entityId: String): List<IdentifierRoomEntity>

    @Query("SELECT entityId FROM kernel_identifiers WHERE type = :type AND value = :value LIMIT 1")
    fun findEntityIdByIdentifier(type: String, value: String): String?

    @Query("SELECT entityId FROM kernel_identifiers WHERE value = :value LIMIT 1")
    fun findEntityIdByValue(value: String): String?

    @Query("DELETE FROM kernel_identifiers WHERE entityId = :entityId")
    fun deleteIdentifiersForEntity(entityId: String)

    @Query("DELETE FROM kernel_entities WHERE entityId = :entityId")
    fun deleteEntity(entityId: String)

    @Transaction
    fun upsertFullEntity(
        entity: EntityRoomEntity,
        identifiers: List<IdentifierRoomEntity>
    ) {
        upsertEntity(entity)
        deleteIdentifiersForEntity(entity.entityId)
        if (identifiers.isNotEmpty()) {
            insertIdentifiers(identifiers)
        }
    }
}
