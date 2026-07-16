'use strict';

/**
 * CHATR Kernel — World Model (Phase 5.1)
 *
 * A traversable graph of relationships between the user, places, accounts,
 * executions, preferences, and connectors.
 *
 * Wraps the existing ExecutionMemory SQLite tables with a higher-level
 * graph query interface.
 *
 * Entities:
 *   User → Preferences → intent → connector
 *   User → Places      → home, office, frequent
 *   User → Accounts    → connected services
 *   User → Executions  → history of what ran
 */

const path = require('path');
const fs   = require('fs');

const log = (() => {
  try { return require('electron-log'); } catch { return console; }
})();

let Database;
try { Database = require('better-sqlite3'); } catch (e) { Database = null; }

// ── DB Setup ─────────────────────────────────────────────────────────────────

let db;
function _getDb() {
  if (db) return db;
  if (!Database) return null;

  let dbPath;
  try {
    const { app } = require('electron');
    dbPath = path.join(app.getPath('userData'), 'world-model.sqlite');
  } catch (e) {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    dbPath = path.join(dir, 'world-model.sqlite');
  }

  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS wm_places (
      id TEXT PRIMARY KEY,
      label TEXT,        -- 'home', 'office', 'frequent'
      name TEXT,
      city TEXT,
      country TEXT,
      visit_count INTEGER DEFAULT 1,
      last_visited DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wm_preferences (
      intent TEXT,
      field TEXT,
      value TEXT,
      score REAL DEFAULT 50,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (intent, field)
    );

    CREATE TABLE IF NOT EXISTS wm_executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intent TEXT,
      connector_id TEXT,
      constraints_json TEXT,
      result_summary TEXT,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wm_accounts (
      service TEXT PRIMARY KEY,
      connected INTEGER DEFAULT 0,
      last_used DATETIME
    );

    CREATE TABLE IF NOT EXISTS wm_people (
      id TEXT PRIMARY KEY,
      name TEXT,
      relation TEXT,
      frequency INTEGER DEFAULT 1,
      last_contacted DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wm_companies (
      id TEXT PRIMARY KEY,
      name TEXT,
      relation TEXT,       -- 'employer', 'client', 'vendor'
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS wm_projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      status TEXT,         -- 'active', 'archived'
      deadline DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wm_meetings (
      id TEXT PRIMARY KEY,
      title TEXT,
      time DATETIME,
      location TEXT,
      participants TEXT    -- JSON array of participant IDs
    );

    CREATE TABLE IF NOT EXISTS wm_documents (
      id TEXT PRIMARY KEY,
      title TEXT,
      type TEXT,           -- 'invoice', 'contract', 'report'
      path TEXT,
      indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wm_goals (
      id TEXT PRIMARY KEY,
      description TEXT,
      status TEXT DEFAULT 'in_progress',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wm_habits (
      id TEXT PRIMARY KEY,
      intent TEXT,
      constraints_template TEXT,  -- JSON string with pre-filled constraints
      trigger_condition TEXT,     -- e.g. "day_of_week=5"
      confidence REAL DEFAULT 50,
      executions INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

// ── World Model ───────────────────────────────────────────────────────────────

class WorldModel {

  // ── Habits (Adaptive Intelligence) ────────────────────────────────────────

  /**
   * Detects if there's a strong habit for a given intent.
   * Simple baseline: queries recent executions of this intent.
   * If the last 3 executions had the exact same constraints, consider it a habit.
   */
  detectHabit(intent) {
    const db = _getDb();
    if (!db) return null;

    const rows = db.prepare(`
      SELECT constraints_json
      FROM wm_executions
      WHERE intent = ?
      ORDER BY executed_at DESC
      LIMIT 3
    `).all(intent);

    if (rows.length < 3) return null;

    // Check if all 3 are identical
    const first = rows[0].constraints_json;
    if (rows[1].constraints_json === first && rows[2].constraints_json === first) {
      try {
        return JSON.parse(first);
      } catch { return null; }
    }
    return null;
  }

  // ── Places ────────────────────────────────────────────────────────────────

  savePlace(label, name, city, country = 'IN') {
    const db = _getDb();
    if (!db) return;
    db.prepare(`
      INSERT INTO wm_places (id, label, name, city, country)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET visit_count = visit_count + 1, last_visited = CURRENT_TIMESTAMP
    `).run(`${label}_${city}`, label, name, city, country);
  }

  getPlaces() {
    const db = _getDb();
    if (!db) return {};
    const rows = db.prepare('SELECT * FROM wm_places ORDER BY visit_count DESC').all();
    const result = {};
    for (const r of rows) {
      if (!result[r.label]) result[r.label] = [];
      result[r.label].push(r);
    }
    return result;
  }

  getFrequentRoutes(intent = 'transport.book') {
    const db = _getDb();
    if (!db) return [];
    try {
      const rows = db.prepare(`
        SELECT constraints_json FROM wm_executions
        WHERE intent = ?
        ORDER BY executed_at DESC
        LIMIT 10
      `).all(intent);

      return rows.map(r => {
        try { return JSON.parse(r.constraints_json); } catch { return null; }
      }).filter(Boolean);
    } catch { return []; }
  }

  // ── Preferences ───────────────────────────────────────────────────────────

  /**
   * Get learned preferences for an intent.
   * Returns { preferredConnector, preferredMode, preferredFrom, ... }
   */
  getPreferences(intent) {
    const db = _getDb();
    if (!db) return null;
    try {
      const rows = db.prepare('SELECT field, value, score FROM wm_preferences WHERE intent = ? ORDER BY score DESC').all(intent);
      if (rows.length === 0) return null;
      const prefs = {};
      for (const r of rows) prefs[r.field] = { value: r.value, score: r.score };
      return prefs;
    } catch { return null; }
  }

  updatePreference(intent, field, value, delta = 5) {
    const db = _getDb();
    if (!db) return;
    db.prepare(`
      INSERT INTO wm_preferences (intent, field, value, score)
      VALUES (?, ?, ?, 50)
      ON CONFLICT(intent, field) DO UPDATE SET
        value = excluded.value,
        score = MIN(100, score + ?),
        last_updated = CURRENT_TIMESTAMP
    `).run(intent, field, value, delta);
  }

  // ── Executions ────────────────────────────────────────────────────────────

  recordExecution(intent, connectorId, constraints, resultSummary) {
    const db = _getDb();
    if (!db) return;
    try {
      db.prepare(`
        INSERT INTO wm_executions (intent, connector_id, constraints_json, result_summary)
        VALUES (?, ?, ?, ?)
      `).run(intent, connectorId, JSON.stringify(constraints), resultSummary || '');

      // Update connector preference
      this.updatePreference(intent, 'preferredConnector', connectorId, 3);

      // Update route preference for transport
      if (constraints.from?.value && constraints.to?.value) {
        this.updatePreference(intent, 'preferredFrom', constraints.from.value, 2);
      }

      // Update place memory
      if (constraints.from?.value) this.savePlace('frequent', constraints.from.value, constraints.from.value);
      if (constraints.to?.value)   this.savePlace('frequent', constraints.to.value,   constraints.to.value);

    } catch (e) {
      log.warn('[WorldModel] recordExecution failed:', e.message);
    }
  }

  // ── Accounts ──────────────────────────────────────────────────────────────

  markAccountConnected(service) {
    const db = _getDb();
    if (!db) return;
    db.prepare(`
      INSERT INTO wm_accounts (service, connected) VALUES (?, 1)
      ON CONFLICT(service) DO UPDATE SET connected = 1, last_used = CURRENT_TIMESTAMP
    `).run(service);
  }

  getConnectedAccounts() {
    const db = _getDb();
    if (!db) return [];
    try { return db.prepare('SELECT service FROM wm_accounts WHERE connected = 1').all().map(r => r.service); }
    catch { return []; }
  }

  // ── Graph Query ───────────────────────────────────────────────────────────

  /**
   * Attempt to resolve a natural-language reference to a past execution.
   * e.g. "the same train as last month" → { from, to, connector, ... }
   */
  queryPastExecution(hint, intent) {
    const routes = this.getFrequentRoutes(intent);
    if (routes.length === 0) return null;

    const lower = hint.toLowerCase();

    // "last month" → most recent execution
    if (/last\s+month|last\s+time|same\s+as/i.test(lower)) {
      return routes[0];
    }

    return null;
  }
}

const worldModel = new WorldModel();
module.exports = { worldModel, WorldModel };
