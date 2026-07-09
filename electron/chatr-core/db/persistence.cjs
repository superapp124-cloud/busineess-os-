'use strict';

/**
 * Persistence Interface (Wave 2 - SQLite Edition)
 * 
 * Defines the strict boundary between CHATR Core and storage.
 * All modules use this generic interface without knowing SQLite is underneath.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

class PersistenceInterface {
  constructor() {
    this.baseDir = path.join(process.env.APPDATA || process.env.HOME || '', '.chatr');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }

    this.dbPath = path.join(this.baseDir, 'chatr.db');
    
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this._initializeSchema();
    } catch (err) {
      console.warn('[Persistence] Database init failed, resetting:', err.message, err.stack);
      if (this.db) {
        try { this.db.close(); } catch (e) {}
      }
      if (fs.existsSync(this.dbPath)) {
        fs.unlinkSync(this.dbPath);
      }
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this._initializeSchema();
    }
  }

  _initializeSchema() {
    this.db.exec(`
      -- Generic Key-Value store for context & core state
      CREATE TABLE IF NOT EXISTS kv_store (
        collection TEXT PRIMARY KEY,
        data JSON NOT NULL
      );

      -- Immutable Intent Journal
      CREATE TABLE IF NOT EXISTS journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection TEXT NOT NULL,
        data JSON NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Universal Schema Pattern for all Capabilities
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        source_conversation_id TEXT NOT NULL,
        source_message_id TEXT,
        created_by TEXT DEFAULT 'system',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        metadata JSON
      );

      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        source_conversation_id TEXT NOT NULL,
        source_message_id TEXT,
        created_by TEXT DEFAULT 'system',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        metadata JSON
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        source_conversation_id TEXT NOT NULL,
        source_message_id TEXT,
        created_by TEXT DEFAULT 'system',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        metadata JSON
      );

      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        source_conversation_id TEXT NOT NULL,
        source_message_id TEXT,
        created_by TEXT DEFAULT 'system',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        metadata JSON
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        source_conversation_id TEXT NOT NULL,
        source_message_id TEXT,
        created_by TEXT DEFAULT 'system',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        metadata JSON
      );
    `);
  }

  /**
   * Save a full JSON object (Overwrite)
   */
  store(collection, data) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO kv_store (collection, data) 
        VALUES (@collection, @data) 
        ON CONFLICT(collection) DO UPDATE SET data = @data
      `);
      stmt.run({ collection, data: JSON.stringify(data) });
      return true;
    } catch (e) {
      console.error(`[Persistence] store failed for ${collection}:`, e.message);
      return false;
    }
  }

  /**
   * Retrieve a full JSON object
   */
  retrieve(collection) {
    try {
      const stmt = this.db.prepare(`SELECT data FROM kv_store WHERE collection = ?`);
      const row = stmt.get(collection);
      if (!row) return null;
      return JSON.parse(row.data);
    } catch (e) {
      console.error(`[Persistence] retrieve failed for ${collection}:`, e.message);
      return null;
    }
  }

  /**
   * Append to a collection (Journal)
   */
  append(collection, entry) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO journal (collection, data) 
        VALUES (@collection, @data)
      `);
      stmt.run({ collection, data: JSON.stringify(entry) });
      return true;
    } catch (e) {
      console.error(`[Persistence] append failed for ${collection}:`, e.message);
      return false;
    }
  }

  /**
   * Flush/truncate a collection
   */
  flush(collection) {
    try {
      const deleteKv = this.db.prepare(`DELETE FROM kv_store WHERE collection = ?`);
      deleteKv.run(collection);
      
      const deleteJournal = this.db.prepare(`DELETE FROM journal WHERE collection = ?`);
      deleteJournal.run(collection);
      return true;
    } catch (e) {
      console.error(`[Persistence] flush failed for ${collection}:`, e.message);
      return false;
    }
  }

  // --- Relational APIs for specific Modules (Wave 2) ---
  
  insertRecord(tableName, record) {
    try {
      const keys = Object.keys(record);
      const placeholders = keys.map(k => `@${k}`).join(', ');
      const cols = keys.join(', ');
      
      const stmt = this.db.prepare(`INSERT INTO ${tableName} (${cols}) VALUES (${placeholders})`);
      stmt.run(record);
      return true;
    } catch (e) {
      console.error(`[Persistence] insertRecord failed for ${tableName}:`, e.message);
      return false;
    }
  }
}

module.exports = new PersistenceInterface();
