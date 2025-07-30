// src/database/sqlConstants.js
// SQL语句常量，同时支持ESM和CommonJS导入

const SQL = {
  CREATE_CHAT_SESSIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_updated INTEGER NOT NULL,
      knowledge_base_id INTEGER,
      knowledge_base_name TEXT
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
  CREATE_DOCUMENTS_TABLE: `
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      knowledge_base_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding BLOB,
      file_path TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases (id) ON DELETE CASCADE
    )
  `,
  CREATE_KNOWLEDGE_BASES_TABLE: `
    CREATE TABLE IF NOT EXISTS knowledge_bases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  CREATE_CHUNKS_TABLE: `
    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      embedding BLOB NOT NULL,
      page_number INTEGER,
      FOREIGN KEY (doc_id) REFERENCES documents (id) ON DELETE CASCADE
    )
  `,
  SELECT_MESSAGES_BY_CHAT_ID:
    'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC',
  SELECT_ALL_CHAT_SESSIONS:
    'SELECT * FROM chat_sessions ORDER BY last_updated DESC',
  SELECT_CONFIG: 'SELECT value FROM app_configs WHERE key = ?',
  SELECT_ALL_CONFIGS: 'SELECT * FROM app_configs',
  SELECT_ALL_DOCUMENTS: 'SELECT * FROM documents ORDER BY created_at DESC',
  SELECT_DOCUMENT_BY_ID: 'SELECT * FROM documents WHERE id = ?',
  SELECT_CHUNKS_BY_DOC_ID: 'SELECT * FROM chunks WHERE doc_id = ? ORDER BY id ASC',
  SELECT_ALL_KNOWLEDGE_BASES: 'SELECT * FROM knowledge_bases ORDER BY updated_at DESC',
  SELECT_KNOWLEDGE_BASE_BY_ID: 'SELECT * FROM knowledge_bases WHERE id = ?',
  SELECT_DOCUMENTS_BY_KB_ID: 'SELECT * FROM documents WHERE knowledge_base_id = ? ORDER BY created_at DESC',
  INSERT_MESSAGE: `
    INSERT INTO messages (
      chat_id, content, reasoning_content, is_user, 
      is_system, model, timestamp, is_reasoning_model, reasoning_complete
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  INSERT_DOCUMENT: `
    INSERT INTO documents (knowledge_base_id, title, content, embedding, file_path)
    VALUES (?, ?, ?, ?, ?)
  `,
  INSERT_KNOWLEDGE_BASE: `
    INSERT INTO knowledge_bases (name, description)
    VALUES (?, ?)
  `,
  UPDATE_KNOWLEDGE_BASE: `
    UPDATE knowledge_bases 
    SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  INSERT_CHUNK: `
    INSERT INTO chunks (doc_id, text, embedding, page_number)
    VALUES (?, ?, ?, ?)
  `,
  INSERT_OR_REPLACE_CHAT_SESSION: `
    INSERT OR REPLACE INTO chat_sessions (id, title, created_at, last_updated, knowledge_base_id, knowledge_base_name) 
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  UPSERT_CONFIG: `
    INSERT OR REPLACE INTO app_configs (key, value, updated_at)
    VALUES (?, ?, ?)
  `,
  DELETE_MESSAGES_BY_CHAT_ID: 'DELETE FROM messages WHERE chat_id = ?',
  DELETE_CHAT_SESSION: 'DELETE FROM chat_sessions WHERE id = ?',
  DELETE_CONFIG: 'DELETE FROM app_configs WHERE key = ?',
  DELETE_DOCUMENT: 'DELETE FROM documents WHERE id = ?',
  DELETE_CHUNKS_BY_DOC_ID: 'DELETE FROM chunks WHERE doc_id = ?',
  DELETE_KNOWLEDGE_BASE: 'DELETE FROM knowledge_bases WHERE id = ?',
}

// 默认导出，支持ESM
export { SQL }
export default { SQL } 
