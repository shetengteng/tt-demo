// src/composables/useDb.js - 数据库操作封装模块
import { app, ipcMain } from 'electron'
import path from 'path'
import Database from 'better-sqlite3'
import { SQL } from './sqlConstants.js'

let db = null

// 数据库路径获取函数
const getDbPath = () => {
  return path.join(app.getPath('userData'), 'chats.db')
}

// 初始化数据库
const initDatabase = () => {
  // 设置IPC处理程序 - 数据库相关
  ipcMain.handle('db:init', async () => {
    try {
      const dbPath = getDbPath()
      console.log('初始化数据库:', dbPath)

      // 打开数据库连接
      db = new Database(dbPath)
      console.log('已连接到SQLite数据库')

      // 依次创建所有表
      const tables = [
        SQL.CREATE_CHAT_SESSIONS_TABLE,
        SQL.CREATE_MESSAGES_TABLE,
        SQL.CREATE_CONFIGS_TABLE,
      ]

      for (const tableSql of tables) {
        db.exec(tableSql)
      }

      console.log('数据库初始化完成')
      return { success: true }
    } catch (error) {
      console.error('数据库初始化失败:', error.message)
      throw error
    }
  })

  // 执行查询
  ipcMain.handle('db:query', async (event, sql, params = []) => {
    if (!db) {
      const dbPath = getDbPath()
      db = new Database(dbPath)
    }

    try {
      const stmt = db.prepare(sql)
      const rows = stmt.all(params)
      return rows
    } catch (err) {
      console.error('查询失败:', err.message)
      throw err
    }
  })

  // 执行操作
  ipcMain.handle('db:run', async (event, sql, params = []) => {
    if (!db) {
      const dbPath = getDbPath()
      db = new Database(dbPath)
    }

    try {
      const stmt = db.prepare(sql)
      const result = stmt.run(params)
      return {
        lastID: result.lastInsertRowid,
        changes: result.changes,
      }
    } catch (err) {
      console.error('执行失败:', err.message)
      throw err
    }
  })

  // 路径连接操作
  ipcMain.handle('path:join', (event, ...args) => {
    return path.join(...args)
  })
}

// 关闭数据库连接
const closeDatabase = () => {
  if (db) {
    db.close()
    db = null
    console.log('数据库连接已关闭')
  }
}

// 导出模块
export { initDatabase, closeDatabase }
