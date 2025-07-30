// src/database/useDb.js - 数据库操作封装模块
import { app, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import sqlite3 from 'sqlite3'
import { SQL } from './sqlConstants.js'
import { pathToFileURL } from 'url'

// 启用详细日志
const sqlite = sqlite3.verbose()

let db = null

// 数据库路径获取函数
const getDbPath = () => {
    return path.join(app.getPath('userData'), 'chats.db')
}

// 将 db.run 转换为返回 Promise 的函数
const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err)
                return
            }
            resolve({
                lastID: this.lastID,
                changes: this.changes,
            })
        })
    })
}

// 初始化数据库
const initDatabase = () => {
    // 设置IPC处理程序 - 数据库相关
    ipcMain.handle('db:init', async () => {
        try {
            const dbPath = getDbPath()
            console.log('初始化数据库:', dbPath)

            // 打开数据库连接
            db = await new Promise((resolve, reject) => {
                const database = new sqlite.Database(dbPath, err => {
                    if (err) {
                        console.error('无法打开数据库:', err.message)
                        reject(err)
                        return
                    }
                    console.log('已连接到SQLite数据库')
                    resolve(database)
                })
            })

            // 依次创建所有表
            const tables = [
                SQL.CREATE_CHAT_SESSIONS_TABLE,
                SQL.CREATE_MESSAGES_TABLE,
                SQL.CREATE_CONFIGS_TABLE,
                SQL.CREATE_KNOWLEDGE_BASES_TABLE,
                SQL.CREATE_DOCUMENTS_TABLE,
                SQL.CREATE_CHUNKS_TABLE,
            ]

            for (const tableSql of tables) {
                await runAsync(tableSql)
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
            db = new sqlite.Database(dbPath)
        }

        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('查询失败:', err.message)
                    reject(err)
                    return
                }
                resolve(rows)
            })
        })
    })

    // 执行操作
    ipcMain.handle('db:run', async (event, sql, params = []) => {
        if (!db) {
            const dbPath = getDbPath()
            db = new sqlite.Database(dbPath)
        }

        return runAsync(sql, params)
    })

    // 路径连接操作
    ipcMain.handle('path:join', (event, ...args) => {
        return path.join(...args)
    })

    // 保存临时文件
    ipcMain.handle('save-temp-file', async (event, { fileName, content }) => {
        try {
            const tempDir = path.join(os.tmpdir(), 'tt-demo-uploads')

            // 确保临时目录存在
            await fs.mkdir(tempDir, { recursive: true })

            // 生成唯一的临时文件名
            const timestamp = Date.now()
            const ext = path.extname(fileName)
            const baseName = path.basename(fileName, ext)
            const tempFileName = `${baseName}_${timestamp}${ext}`
            const tempPath = path.join(tempDir, tempFileName)

            // 将内容写入临时文件
            const buffer = Buffer.from(content)
            await fs.writeFile(tempPath, buffer)

            console.log('临时文件已保存:', tempPath)
            return tempPath
        } catch (error) {
            console.error('保存临时文件失败:', error)
            throw new Error(`保存临时文件失败: ${error.message}`)
        }
    })

    // 清理临时文件
    ipcMain.handle('cleanup-temp-file', async (event, filePath) => {
        try {
            await fs.unlink(filePath)
            console.log('临时文件已清理:', filePath)
            return true
        } catch (error) {
            console.warn('清理临时文件失败:', error)
            return false
        }
    })

    // 文件解析处理
    ipcMain.handle('parse-file', async (event, filePath) => {
        try {
            // 动态导入主进程文件解析服务
            const { fileParserServiceMain } = await import(pathToFileURL(path.join(process.cwd(), 'src/services/fileParserService.main.js')).href)
            const result = await fileParserServiceMain.parseFile(filePath)
            return { success: true, data: result }
        } catch (error) {
            console.error('文件解析失败:', error)
            return { success: false, error: error.message }
        }
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