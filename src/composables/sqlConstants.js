// src/composables/sqlConstants.js
// SQL语句常量，同时支持ESM和CommonJS导入

const SQL = {
  CREATE_CHAT_SESSIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_updated INTEGER NOT NULL
    )
  `,
  CREATE_MESSAGES_TABLE: `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT NOT NULL,
      content TEXT,
      reasoning_content TEXT,
      is_user INTEGER NOT NULL,
      is_system INTEGER DEFAULT 0,
      model TEXT,
      timestamp INTEGER NOT NULL,
      is_reasoning_model INTEGER DEFAULT 0,
      reasoning_complete INTEGER DEFAULT 0,
      FOREIGN KEY (chat_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
    )
  `,
  CREATE_CONFIGS_TABLE: `
    CREATE TABLE IF NOT EXISTS app_configs (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `,
  SELECT_MESSAGES_BY_CHAT_ID:
    'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC',
  SELECT_ALL_CHAT_SESSIONS:
    'SELECT * FROM chat_sessions ORDER BY last_updated DESC',
  SELECT_CONFIG: 'SELECT value FROM app_configs WHERE key = ?',
  SELECT_ALL_CONFIGS: 'SELECT * FROM app_configs',
  INSERT_MESSAGE: `
    INSERT INTO messages (
      chat_id, content, reasoning_content, is_user, 
      is_system, model, timestamp, is_reasoning_model, reasoning_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  INSERT_OR_REPLACE_CHAT_SESSION: `
    INSERT OR REPLACE INTO chat_sessions (id, title, created_at, last_updated) 
    VALUES (?, ?, ?, ?)
  `,
  UPSERT_CONFIG: `
    INSERT OR REPLACE INTO app_configs (key, value, updated_at)
    VALUES (?, ?, ?)
  `,
  DELETE_MESSAGES_BY_CHAT_ID: 'DELETE FROM messages WHERE chat_id = ?',
  DELETE_CHAT_SESSION: 'DELETE FROM chat_sessions WHERE id = ?',
  DELETE_CONFIG: 'DELETE FROM app_configs WHERE key = ?',
}

// 检查是否在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS环境
  module.exports = { SQL }
}

// 默认导出，支持ESM
export { SQL }
export default { SQL }
