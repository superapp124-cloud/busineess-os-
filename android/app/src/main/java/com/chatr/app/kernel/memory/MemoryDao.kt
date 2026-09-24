package com.chatr.app.kernel.memory

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.chatr.app.kernel.db.CommitmentRoomEntity
import com.chatr.app.kernel.db.MemoryRoomEntity

@Dao
interface MemoryDao {

    // ── Memory Records ──────────────────────────────────────────

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun upsertMemory(memory: MemoryRoomEntity)

    @Query("SELECT * FROM kernel_memory WHERE recordId = :recordId LIMIT 1")
    fun getMemoryById(recordId: String): MemoryRoomEntity?

    @Query("SELECT * FROM kernel_memory WHERE relatedEntityIds LIKE '%' || :entityId || '%' ORDER BY createdAtMs DESC")
    fun getMemoriesForEntity(entityId: String): List<MemoryRoomEntity>

    @Query("SELECT * FROM kernel_memory WHERE type = :type ORDER BY createdAtMs DESC")
    fun getMemoriesByType(type: String): List<MemoryRoomEntity>

    @Query("SELECT * FROM kernel_memory ORDER BY importance DESC, createdAtMs DESC LIMIT :limit")
    fun getTopMemories(limit: Int): List<MemoryRoomEntity>

    @Query("SELECT * FROM kernel_memory WHERE verificationLevel = :level ORDER BY createdAtMs DESC")
    fun getMemoriesByVerificationLevel(level: String): List<MemoryRoomEntity>

    @Query("DELETE FROM kernel_memory WHERE recordId = :recordId")
    fun deleteMemory(recordId: String)

    // ── Commitments ─────────────────────────────────────────────

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun upsertCommitment(commitment: CommitmentRoomEntity)

    @Query("SELECT * FROM kernel_commitments WHERE commitmentId = :commitmentId LIMIT 1")
    fun getCommitmentById(commitmentId: String): CommitmentRoomEntity?

    @Query("SELECT * FROM kernel_commitments WHERE isCompleted = 0 AND (:entityId IS NULL OR toEntityId = :entityId) ORDER BY createdAtMs DESC")
    fun getActiveCommitments(entityId: String?): List<CommitmentRoomEntity>

    @Query("SELECT * FROM kernel_commitments ORDER BY createdAtMs DESC")
    fun getAllCommitments(): List<CommitmentRoomEntity>

    @Query("UPDATE kernel_commitments SET isCompleted = 1 WHERE commitmentId = :commitmentId")
    fun markCommitmentCompleted(commitmentId: String)

    @Query("DELETE FROM kernel_commitments WHERE commitmentId = :commitmentId")
    fun deleteCommitment(commitmentId: String)
}
