// src/composables/useDb.js - 数据库操作封装模块
const { app, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { SQL } = require('./sqlConstants');

let db = null;

// 数据库路径获取函数
const getDbPath = () => {
    return path.join(app.getPath('userData'), 'chats.db');
};

// 初始化数据库
const initDatabase = () => {
    // 设置IPC处理程序 - 数据库相关
    ipcMain.handle('db:init', async () => {
        return new Promise((resolve, reject) => {
            const dbPath = getDbPath();
            console.log('初始化数据库:', dbPath);

            db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('无法打开数据库:', err.message);
                    reject(err);
                    return;
                }

                console.log('已连接到SQLite数据库');

                // 创建聊天会话表
                db.run(SQL.CREATE_CHAT_SESSIONS_TABLE, (err) => {
                    if (err) {
                        console.error('创建chat_sessions表失败:', err.message);
                        reject(err);
                        return;
                    }

                    // 创建消息表
                    db.run(SQL.CREATE_MESSAGES_TABLE, (err) => {
                        if (err) {
                            console.error('创建messages表失败:', err.message);
                            reject(err);
                            return;
                        }

                        console.log('数据库初始化完成');
                        resolve({ success: true });
                    });
                });
            });
        });
    });

    // 执行查询
    ipcMain.handle('db:query', async (event, sql, params = []) => {
        if (!db) {
            const dbPath = getDbPath();
            db = new sqlite3.Database(dbPath);
        }

        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('查询失败:', err.message);
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    });

    // 执行操作
    ipcMain.handle('db:run', async (event, sql, params = []) => {
        if (!db) {
            const dbPath = getDbPath();
            db = new sqlite3.Database(dbPath);
        }

        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) {
                    console.error('操作失败:', err.message);
                    reject(err);
                    return;
                }
                resolve({
                    lastID: this.lastID,
                    changes: this.changes
                });
            });
        });
    });

    // 路径连接操作
    ipcMain.handle('path:join', (event, ...args) => {
        return path.join(...args);
    });
};

// 关闭数据库连接
const closeDatabase = () => {
    if (db) {
        db.close();
        db = null;
        console.log('数据库连接已关闭');
    }
};

// 导出模块
module.exports = {
    initDatabase,
    closeDatabase
}; 