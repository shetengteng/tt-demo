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
  SELECT_MESSAGES_BY_CHAT_ID: 'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC',
  SELECT_ALL_CHAT_SESSIONS: 'SELECT * FROM chat_sessions ORDER BY last_updated DESC',
  INSERT_MESSAGE: `
    INSERT INTO messages (
      chat_id, content, reasoning_content, is_user, 
      is_system, model, timestamp, is_reasoning_model, reasoning_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  DELETE_MESSAGES_BY_CHAT_ID: 'DELETE FROM messages WHERE chat_id = ?',
  DELETE_CHAT_SESSION: 'DELETE FROM chat_sessions WHERE id = ?'
};

// 兼容CommonJS和ES模块导出
if (typeof module !== 'undefined') {
  // Node.js环境
  module.exports = { SQL };
} 

// 浏览器环境ES模块导出
export { SQL }; 