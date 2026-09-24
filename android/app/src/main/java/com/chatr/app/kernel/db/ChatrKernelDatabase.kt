package com.chatr.app.kernel.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.chatr.app.kernel.entity.EntityDao
import com.chatr.app.kernel.memory.MemoryDao

@Database(
    entities = [
        EntityRoomEntity::class,
        IdentifierRoomEntity::class,
        MemoryRoomEntity::class,
        CommitmentRoomEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class ChatrKernelDatabase : RoomDatabase() {

    abstract fun entityDao(): EntityDao
    abstract fun memoryDao(): MemoryDao

    companion object {
        private const val DB_NAME = "chatr_kernel.db"

        @Volatile
        private var instance: ChatrKernelDatabase? = null

        fun get(context: Context): ChatrKernelDatabase {
            return instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    ChatrKernelDatabase::class.java,
                    DB_NAME
                )
                    .fallbackToDestructiveMigration()
                    .build()
                    .also { instance = it }
            }
        }

        /** Creates an isolated in-memory database instance for testing. */
        fun createInMemory(context: Context): ChatrKernelDatabase {
            return Room.inMemoryDatabaseBuilder(
                context,
                ChatrKernelDatabase::class.java
            )
                .allowMainThreadQueries()
                .build()
        }
    }
}
