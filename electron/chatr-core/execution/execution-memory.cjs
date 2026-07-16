const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let dbPath;
try {
  const { app } = require('electron');
  if (app && app.getPath) {
    dbPath = path.join(app.getPath('userData'), 'execution-memory.sqlite');
  }
} catch (e) {
  // Ignored, Electron not available
}

if (!dbPath) {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  dbPath = path.join(dataDir, 'execution-memory.sqlite');
}

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS execution_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intent TEXT,
    capability TEXT,
    connector_id TEXT,
    status TEXT,
    cost REAL,
    latency_ms REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS connector_stats (
    connector_id TEXT PRIMARY KEY,
    total_executions INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    avg_latency REAL DEFAULT 0,
    avg_eta REAL DEFAULT 0,
    avg_cost REAL DEFAULT 0,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS execution_graphs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    intent TEXT UNIQUE,
    serialized_graph TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    capability TEXT PRIMARY KEY,
    preferences_json TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

class ExecutionMemory {
  recordExecution(intent, capability, connectorId, status, metrics) {
    const cost = metrics?.cost || 0;
    const latency = metrics?.latency || 0;
    const eta = metrics?.eta || 0;
    const isSuccess = status === 'success' ? 1 : 0;
    const isFail = status !== 'success' ? 1 : 0;

    const insertHistory = db.prepare(`
      INSERT INTO execution_history (intent, capability, connector_id, status, cost, latency_ms)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const updateStats = db.prepare(`
      INSERT INTO connector_stats 
        (connector_id, total_executions, success_count, fail_count, avg_latency, avg_eta, avg_cost, last_used)
      VALUES (@connectorId, 1, @success, @fail, @latency, @eta, @cost, CURRENT_TIMESTAMP)
      ON CONFLICT(connector_id) DO UPDATE SET
        avg_latency = (avg_latency * total_executions + @latency) / (total_executions + 1),
        avg_eta = (avg_eta * total_executions + @eta) / (total_executions + 1),
        avg_cost = (avg_cost * total_executions + @cost) / (total_executions + 1),
        total_executions = total_executions + 1,
        success_count = success_count + @success,
        fail_count = fail_count + @fail,
        last_used = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction(() => {
      insertHistory.run(intent, capability, connectorId, status, cost, latency);
      updateStats.run({
        connectorId,
        success: isSuccess,
        fail: isFail,
        latency,
        eta,
        cost
      });
    });

    transaction();
  }

  getConnectorStats(connectorId) {
    const stmt = db.prepare('SELECT * FROM connector_stats WHERE connector_id = ?');
    return stmt.get(connectorId) || null;
  }

  getAllConnectorStats() {
    const stmt = db.prepare('SELECT * FROM connector_stats');
    return stmt.all();
  }

  getPreferences(capability) {
    const stmt = db.prepare('SELECT preferences_json FROM user_preferences WHERE capability = ?');
    const row = stmt.get(capability);
    if (row && row.preferences_json) {
      try {
        return JSON.parse(row.preferences_json);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  updatePreferences(capability, prefs) {
    const stmt = db.prepare(`
      INSERT INTO user_preferences (capability, preferences_json, last_updated)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(capability) DO UPDATE SET
        preferences_json = excluded.preferences_json,
        last_updated = CURRENT_TIMESTAMP
    `);
    stmt.run(capability, JSON.stringify(prefs));
  }

  saveGraph(intent, graph) {
    const stmt = db.prepare(`
      INSERT INTO execution_graphs (intent, serialized_graph, created_at, usage_count)
      VALUES (?, ?, CURRENT_TIMESTAMP, 0)
      ON CONFLICT(intent) DO UPDATE SET
        serialized_graph = excluded.serialized_graph
    `);
    stmt.run(intent, JSON.stringify(graph));
  }

  getGraph(intent) {
    const getStmt = db.prepare('SELECT serialized_graph FROM execution_graphs WHERE intent = ?');
    const row = getStmt.get(intent);
    if (row && row.serialized_graph) {
      // Increment usage count in the background
      try {
        db.prepare('UPDATE execution_graphs SET usage_count = usage_count + 1 WHERE intent = ?').run(intent);
      } catch (e) {
        // Ignored
      }
      
      try {
        return JSON.parse(row.serialized_graph);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

const executionMemory = new ExecutionMemory();

module.exports = {
  executionMemory,
  ExecutionMemory // exported for testing if needed
};
