const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

let mainWindow = null;
let db = null;

// 数据库路径
const getDbPath = () => {
  return path.join(app.getPath('userData'), 'chats.db');
};

// 确保只有一个应用实例
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  // 创建主窗口
  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false
      }
    });

    // 加载应用的入口页面
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173/');
      mainWindow.webContents.openDevTools(); // 在开发模式下自动打开开发者工具
    } else {
      mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
    
    // 窗口关闭时清除引用
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

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
        db.run(`
          CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            last_updated INTEGER NOT NULL
          )
        `, (err) => {
          if (err) {
            console.error('创建chat_sessions表失败:', err.message);
            reject(err);
            return;
          }

          // 创建消息表
          db.run(`
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
          `, (err) => {
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
      db.run(sql, params, function(err) {
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
  
  // 路径连接
  ipcMain.handle('path:join', (event, ...args) => {
    return path.join(...args);
  });

  // 应用准备就绪后创建窗口
  app.on('ready', createWindow);

  // 所有窗口关闭时退出应用 (macOS除外)
  app.on('window-all-closed', () => {
    // 关闭数据库连接
    if (db) {
      db.close();
      db = null;
    }
    
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // macOS 下点击应用图标重新打开窗口
    if (mainWindow === null) {
      createWindow();
    }
  });

  // 处理第二个实例启动的情况
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}